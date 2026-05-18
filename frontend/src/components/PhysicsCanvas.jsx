import React, { useState, useEffect, useRef } from 'react';
import Matter from 'matter-js';

const PhysicsCanvas = ({
  activeTool, socket, roomId, setPhysicsData,
  triggerSave, showVectors, triggerRecord,
  isRunning, triggerReset
}) => {
  const sceneRef        = useRef(null);
  const engineRef       = useRef(null);
  const renderRef       = useRef(null);
  const runnerRef       = useRef(null);
  const motorBodiesRef  = useRef([]);
  const [notes, setNotes] = useState([]);

  const showVectorsRef = useRef(showVectors);
  useEffect(() => { showVectorsRef.current = showVectors; }, [showVectors]);

  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
    if (runnerRef.current) {
      runnerRef.current.enabled = isRunning;
    }
  }, [isRunning]);

  // ── Reset ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!triggerReset || !engineRef.current) return;
    const engine = engineRef.current;
    const bodiesToRemove = engine.world.bodies.filter(b => b.label !== 'boundary');
    const constraintsToRemove = engine.world.constraints.filter(c => c.label !== 'Mouse Constraint');
    Matter.World.remove(engine.world, bodiesToRemove);
    Matter.World.remove(engine.world, constraintsToRemove);
    motorBodiesRef.current = [];
    setNotes([]);
  }, [triggerReset]);

  // ── Recording ─────────────────────────────────────────────────────────
  const mediaRecorderRef   = useRef(null);
  const recordedChunksRef  = useRef([]);

  useEffect(() => {
    if (!triggerRecord) return;
    if (triggerRecord.isRecording) {
      if (!renderRef.current?.canvas) return;
      const stream = renderRef.current.canvas.captureStream(30);
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `simulation-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        recordedChunksRef.current = [];
      };
      mediaRecorderRef.current.start();
    } else {
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    }
  }, [triggerRecord]);

  // ── Save to cloud ─────────────────────────────────────────────────────
  useEffect(() => {
    if (triggerSave === 0 || !engineRef.current) return;
    const bodies = Matter.Composite.allBodies(engineRef.current.world)
      .filter(b => b.label !== 'boundary')
      .map(b => ({
        id: b.id, x: b.position.x, y: b.position.y,
        isStatic: b.isStatic, type: b.circleRadius ? 'circle' : 'box',
        radius: b.circleRadius,
        width:  b.bounds.max.x - b.bounds.min.x,
        height: b.bounds.max.y - b.bounds.min.y,
        color:  b.render.fillStyle,
        velocity: { x: b.velocity.x, y: b.velocity.y }
      }));
    const constraints = engineRef.current.world.constraints
      .filter(c => c.label !== 'Mouse Constraint')
      .map(c => ({
        id: c.id, bodyAId: c.bodyA?.id, bodyBId: c.bodyB?.id, stiffness: c.stiffness
      })).filter(c => c.bodyAId && c.bodyBId);

    const name = prompt('Enter Experiment Name:') || 'Saved Lab';
    fetch('http://localhost:4000/api/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: 'Cloud saved from Instructor', data: { bodies, constraints } })
    }).then(r => r.json()).then(d => alert(`"${d.name}" saved!`)).catch(console.error);
  }, [triggerSave]);

  // ── Main engine setup ─────────────────────────────────────────────────
  useEffect(() => {
    const engine = Matter.Engine.create();
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine,
      options: {
        width:      sceneRef.current.clientWidth,
        height:     sceneRef.current.clientHeight,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio,
      }
    });
    const runner = Matter.Runner.create();
    engineRef.current  = engine;
    renderRef.current  = render;
    runnerRef.current  = runner;

    // Boundaries
    const cw = render.options.width;
    const ch = render.options.height;
    const floor     = Matter.Bodies.rectangle(cw / 2, ch + 25, cw * 2, 50, { isStatic: true, label: 'boundary', render: { fillStyle: '#1f2937' } });
    const leftWall  = Matter.Bodies.rectangle(-25, ch / 2, 50, ch * 2, { isStatic: true, label: 'boundary', render: { fillStyle: '#111827' } });
    const rightWall = Matter.Bodies.rectangle(cw + 25, ch / 2, 50, ch * 2, { isStatic: true, label: 'boundary', render: { fillStyle: '#111827' } });
    Matter.World.add(engine.world, [floor, leftWall, rightWall]);

    // Mouse
    const mouse           = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
    Matter.World.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Analytics loop
    const updateInterval = setInterval(() => {
      const bodiesData = engine.world.bodies
        .filter(b => !b.isStatic)
        .map(b => ({
          id: b.id,
          velocity:      Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2),
          kineticEnergy: 0.5 * b.mass * (b.velocity.x ** 2 + b.velocity.y ** 2),
          momentum:      b.mass * Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2),
          mass:          b.mass,
        }));
      setPhysicsData(bodiesData);
    }, 100);

    // Motor tick
    const beforeUpdate = () => {
      motorBodiesRef.current.forEach(motor => {
        const body = Matter.Composite.allBodies(engine.world).find(b => b.id === motor.id);
        if (body) {
          if (body.isStatic) Matter.Body.setAngle(body, body.angle + motor.speed);
          else body.torque = motor.speed * 10;
        }
      });
    };
    Matter.Events.on(engine, 'beforeUpdate', beforeUpdate);

    // Vector + spring overlay
    const afterRender = () => {
      const ctx    = render.context;
      const bodies = Matter.Composite.allBodies(engine.world);

      if (showVectorsRef.current) {
        bodies.forEach(body => {
          if (body.label === 'boundary' || body.isStatic) return;
          const { velocity, force, position } = body;
          const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

          // Velocity vector (red)
          if (speed > 0.5) {
            const scale = 5;
            const ex = position.x + velocity.x * scale;
            const ey = position.y + velocity.y * scale;
            const angle = Math.atan2(velocity.y, velocity.x);
            ctx.beginPath(); ctx.moveTo(position.x, position.y); ctx.lineTo(ex, ey);
            ctx.lineWidth = 2; ctx.strokeStyle = '#ef4444'; ctx.stroke();
            const hl = 8;
            ctx.beginPath(); ctx.moveTo(ex, ey);
            ctx.lineTo(ex - hl * Math.cos(angle - Math.PI / 6), ey - hl * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(ex - hl * Math.cos(angle + Math.PI / 6), ey - hl * Math.sin(angle + Math.PI / 6));
            ctx.lineTo(ex, ey); ctx.fillStyle = '#ef4444'; ctx.fill();
          }

          // Force vector (blue)
          const fs = Math.sqrt(force.x ** 2 + force.y ** 2);
          if (fs > 0.0001) {
            const scale = 5000;
            const ex = position.x + force.x * scale;
            const ey = position.y + force.y * scale;
            const angle = Math.atan2(force.y, force.x);
            ctx.beginPath(); ctx.moveTo(position.x, position.y); ctx.lineTo(ex, ey);
            ctx.lineWidth = 2; ctx.strokeStyle = '#3b82f6'; ctx.stroke();
            const hl = 8;
            ctx.beginPath(); ctx.moveTo(ex, ey);
            ctx.lineTo(ex - hl * Math.cos(angle - Math.PI / 6), ey - hl * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(ex - hl * Math.cos(angle + Math.PI / 6), ey - hl * Math.sin(angle + Math.PI / 6));
            ctx.lineTo(ex, ey); ctx.fillStyle = '#3b82f6'; ctx.fill();
          }
        });
      }

      // Spring visualization
      Matter.Composite.allConstraints(engine.world).forEach(c => {
        if (c.customType !== 'spring' && c.render?.type !== 'spring') return;
        if (!c.bodyA || !c.bodyB) return;
        const pA = { x: c.bodyA.position.x + (c.pointA?.x || 0), y: c.bodyA.position.y + (c.pointA?.y || 0) };
        const pB = { x: c.bodyB.position.x + (c.pointB?.x || 0), y: c.bodyB.position.y + (c.pointB?.y || 0) };
        const dx = pB.x - pA.x, dy = pB.y - pA.y;
        const angle = Math.atan2(dy, dx);
        const coils = 12, coilW = 12;
        ctx.beginPath(); ctx.moveTo(pA.x, pA.y);
        for (let i = 1; i < coils; i++) {
          const x = pA.x + dx * (i / coils);
          const y = pA.y + dy * (i / coils);
          if (i % 2 === 0) ctx.lineTo(x + Math.sin(angle) * coilW, y - Math.cos(angle) * coilW);
          else ctx.lineTo(x - Math.sin(angle) * coilW, y + Math.cos(angle) * coilW);
        }
        ctx.lineTo(pB.x, pB.y);
        ctx.lineWidth = 3; ctx.strokeStyle = c.render?.strokeStyle || '#ec4899';
        ctx.lineJoin = 'round'; ctx.stroke();
      });
    };
    Matter.Events.on(render, 'afterRender', afterRender);

    // Socket listeners
    const onShapeAdded = (data) => {
      let b;
      if (data.type === 'box')    b = Matter.Bodies.rectangle(data.x, data.y, 60, 60, { id: data.id, restitution: 0.5, render: { fillStyle: data.color } });
      if (data.type === 'circle') b = Matter.Bodies.circle(data.x, data.y, 30, { id: data.id, restitution: 0.8, render: { fillStyle: data.color } });
      if (b) Matter.World.add(engine.world, b);
    };
    const onConstraintAdded = (data) => {
      const all = Matter.Composite.allBodies(engine.world);
      const bA = all.find(b => b.id === data.bodyAId);
      const bB = all.find(b => b.id === data.bodyBId);
      if (bA && bB) {
        const opts = { id: data.id, bodyA: bA, bodyB: bB, stiffness: data.stiffness || 0.05, render: { visible: true, lineWidth: 3, strokeStyle: data.color || '#8b5cf6' } };
        if (data.length !== undefined) opts.length = data.length;
        Matter.World.add(engine.world, Matter.Constraint.create(opts));
      }
    };
    const onExperimentLoaded = (data) => {
      Matter.World.remove(engine.world, engine.world.bodies.filter(b => b.label !== 'boundary'));
      Matter.World.remove(engine.world, engine.world.constraints.filter(c => c.label !== 'Mouse Constraint'));
      motorBodiesRef.current = [];
      setNotes([]);

      const newBodies = data.bodies.map(bData => {
        const opts = { id: bData.id, isStatic: bData.isStatic || false, render: { fillStyle: bData.color || '#fff' } };
        if (bData.restitution)              opts.restitution  = bData.restitution;
        if (bData.mass)                     opts.mass         = bData.mass;
        if (bData.frictionAir !== undefined) opts.frictionAir = bData.frictionAir;
        let body;
        if (bData.type === 'box')    body = Matter.Bodies.rectangle(bData.x, bData.y, bData.width || 60, bData.height || 60, opts);
        if (bData.type === 'circle') body = Matter.Bodies.circle(bData.x, bData.y, bData.radius || 30, opts);
        if (body && bData.velocity)  Matter.Body.setVelocity(body, bData.velocity);
        return body;
      }).filter(Boolean);

      Matter.World.add(engine.world, newBodies);

      (data.constraints || []).forEach(cData => {
        const bA = newBodies.find(b => b.id === cData.bodyAId);
        const bB = newBodies.find(b => b.id === cData.bodyBId);
        if (!bA || !bB) return;
        const opts = { id: cData.id, bodyA: bA, bodyB: bB, stiffness: cData.stiffness || 0.05, damping: cData.damping || 0, render: cData.render || { visible: true, lineWidth: 3, strokeStyle: '#8b5cf6' } };
        if (cData.length !== undefined) opts.length = cData.length;
        const c = Matter.Constraint.create(opts);
        if (cData.render?.type) c.customType = cData.render.type;
        Matter.World.add(engine.world, c);
      });
    };
    const onLockToggled  = (data) => {
      const b = Matter.Composite.allBodies(engine.world).find(b => b.id === data.bodyId);
      if (b) Matter.Body.setStatic(b, data.isStatic);
    };
    const onMotorAdded  = (data) => motorBodiesRef.current.push(data);
    const onNoteAdded   = (data) => setNotes(prev => [...prev, data]);

    socket.on('shape_added',       onShapeAdded);
    socket.on('constraint_added',  onConstraintAdded);
    socket.on('experiment_loaded', onExperimentLoaded);
    socket.on('lock_toggled',      onLockToggled);
    socket.on('motor_added',       onMotorAdded);
    socket.on('note_added',        onNoteAdded);

    const handleResize = () => {
      if (!sceneRef.current || !renderRef.current) return;
      render.canvas.width  = sceneRef.current.clientWidth;
      render.canvas.height = sceneRef.current.clientHeight;
      Matter.Render.setPixelRatio(render, window.devicePixelRatio);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      socket.off('shape_added',       onShapeAdded);
      socket.off('constraint_added',  onConstraintAdded);
      socket.off('experiment_loaded', onExperimentLoaded);
      socket.off('lock_toggled',      onLockToggled);
      socket.off('motor_added',       onMotorAdded);
      socket.off('note_added',        onNoteAdded);
      Matter.Events.off(engine, 'beforeUpdate', beforeUpdate);
      Matter.Events.off(render, 'afterRender', afterRender);
      window.removeEventListener('resize', handleResize);
      Matter.Runner.stop(runner);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.canvas = null; render.context = null; render.textures = {};
      clearInterval(updateInterval);
    };
  }, [roomId, setPhysicsData, socket]);

  // ── Two-step constraint selection ─────────────────────────────────────
  const selectedBodyRef = useRef(null);
  useEffect(() => { selectedBodyRef.current = null; }, [activeTool]);

  // ── Canvas click handler ──────────────────────────────────────────────
  const handleCanvasClick = (e) => {
    if (!engineRef.current || activeTool === 'select') return;
    const rect = sceneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const engine = engineRef.current;

    // Lock
    if (activeTool === 'lock') {
      const clicked = Matter.Query.point(Matter.Composite.allBodies(engine.world), { x, y });
      if (clicked.length > 0 && clicked[0].label !== 'boundary') {
        const newStatic = !clicked[0].isStatic;
        Matter.Body.setStatic(clicked[0], newStatic);
        socket.emit('toggle_lock', { roomId, bodyId: clicked[0].id, isStatic: newStatic });
      }
      return;
    }

    // Motor
    if (activeTool === 'motor') {
      const clicked = Matter.Query.point(Matter.Composite.allBodies(engine.world), { x, y });
      if (clicked.length > 0 && clicked[0].label !== 'boundary') {
        const motorData = { id: clicked[0].id, speed: 0.05 };
        motorBodiesRef.current.push(motorData);
        socket.emit('add_motor', { roomId, ...motorData });
      }
      return;
    }

    // Note
    if (activeTool === 'note') {
      const text = prompt('Enter note text:');
      if (text) {
        const noteData = { id: Date.now(), x, y, text };
        setNotes(prev => [...prev, noteData]);
        socket.emit('add_note', { roomId, ...noteData });
      }
      return;
    }

    // Two-body constraint tools: spring, rope, pivot
    if (['spring', 'rope', 'pivot'].includes(activeTool)) {
      const clicked = Matter.Query.point(Matter.Composite.allBodies(engine.world), { x, y });
      if (clicked.length > 0) {
        const clickedBody = clicked[0];
        if (!selectedBodyRef.current) {
          selectedBodyRef.current = clickedBody;
        } else {
          const bA = selectedBodyRef.current;
          const bB = clickedBody;
          if (bA !== bB) {
            const cId = Date.now() + Math.floor(Math.random() * 1000);
            let stiffness = 0.05, color = '#8b5cf6';
            let extraOpts = {};

            if (activeTool === 'rope') {
              // Rope: inextensible distance constraint
              stiffness = 1;
              color = '#d97706';
              const dx = bB.position.x - bA.position.x;
              const dy = bB.position.y - bA.position.y;
              extraOpts.length = Math.sqrt(dx * dx + dy * dy);
            } else if (activeTool === 'pivot') {
              // Pivot: zero-length stiff joint (pin joint)
              stiffness = 0.9;
              color = '#10b981';
              extraOpts.length = 0;
            } else {
              // Spring: soft constraint
              stiffness = 0.04;
              color = '#ec4899';
              extraOpts.damping = 0.03;
            }

            const constraint = Matter.Constraint.create({
              id: cId, bodyA: bA, bodyB: bB, stiffness,
              render: { visible: true, lineWidth: 3, strokeStyle: color, type: activeTool === 'spring' ? 'spring' : undefined },
              ...extraOpts
            });
            if (activeTool === 'spring') constraint.customType = 'spring';
            Matter.World.add(engine.world, constraint);
            socket.emit('add_constraint', { roomId, id: cId, bodyAId: bA.id, bodyBId: bB.id, stiffness, color, length: extraOpts.length });
          }
          selectedBodyRef.current = null;
        }
      } else {
        selectedBodyRef.current = null;
      }
      return;
    }

    // Spawn shapes
    const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#10b981'];
    const color  = colors[Math.floor(Math.random() * colors.length)];
    const newId  = Date.now() + Math.floor(Math.random() * 1000);
    let newBody, type;

    if (activeTool === 'box') {
      type    = 'box';
      newBody = Matter.Bodies.rectangle(x, y, 60, 60, { id: newId, restitution: 0.5, friction: 0.5, render: { fillStyle: color } });
    } else if (activeTool === 'circle') {
      type    = 'circle';
      newBody = Matter.Bodies.circle(x, y, 30, { id: newId, restitution: 0.8, friction: 0.5, render: { fillStyle: color } });
    }

    if (newBody) {
      Matter.World.add(engine.world, newBody);
      socket.emit('add_shape', { roomId, type, id: newId, x, y, color });
    }
  };

  // Selection highlight hint
  const isSelectingSecondBody = ['spring', 'rope', 'pivot'].includes(activeTool) && selectedBodyRef.current != null;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {isSelectingSecondBody && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-gray-900/90 border border-indigo-500/50 text-indigo-300 text-xs font-medium px-4 py-2 rounded-full backdrop-blur-sm shadow-lg pointer-events-none">
          {activeTool === 'spring' ? '🌀' : activeTool === 'rope' ? '🪢' : '📌'} Click a second body to connect
        </div>
      )}

      <div
        ref={sceneRef}
        className="w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
      />

      {/* Sticky Notes */}
      {notes.map(note => (
        <div
          key={note.id}
          className="absolute bg-yellow-300 text-yellow-900 px-3 py-2 rounded shadow-lg text-xs font-medium transform -translate-x-1/2 -translate-y-1/2 pointer-events-none whitespace-pre-wrap max-w-xs z-20"
          style={{ left: note.x, top: note.y }}
        >
          {note.text}
        </div>
      ))}
    </div>
  );
};

export default PhysicsCanvas;

import React, { useState, useEffect, useRef } from 'react';
import Matter from 'matter-js';

const PhysicsCanvas = ({ activeTool, socket, roomId, setPhysicsData, triggerSave }) => {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const motorBodiesRef = useRef([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (triggerSave === 0) return;
    if (!engineRef.current) return;
    
    const bodies = Matter.Composite.allBodies(engineRef.current.world)
      .filter(b => b.label !== 'boundary')
      .map(b => ({
        id: b.id,
        x: b.position.x,
        y: b.position.y,
        isStatic: b.isStatic,
        type: b.circleRadius ? 'circle' : 'box',
        radius: b.circleRadius,
        width: b.bounds.max.x - b.bounds.min.x,
        height: b.bounds.max.y - b.bounds.min.y,
        color: b.render.fillStyle,
        velocity: { x: b.velocity.x, y: b.velocity.y }
      }));
      
    const constraints = engineRef.current.world.constraints
      .filter(c => c.label !== 'Mouse Constraint')
      .map(c => ({
        id: c.id,
        bodyAId: c.bodyA ? c.bodyA.id : null,
        bodyBId: c.bodyB ? c.bodyB.id : null,
        stiffness: c.stiffness
      })).filter(c => c.bodyAId && c.bodyBId);

    const name = prompt("Enter Experiment Name:") || "Saved Lab";
    
    fetch('http://localhost:4000/api/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description: "Cloud saved experiment from Instructor",
        data: { bodies, constraints }
      })
    }).then(res => res.json())
      .then(data => alert(`Experiment "${data.name}" successfully saved to MongoDB!`))
      .catch(err => console.error(err));
      
  }, [triggerSave]);

  useEffect(() => {
    // 1. Setup Matter.js Engine & Render
    const engine = Matter.Engine.create();
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: sceneRef.current.clientWidth,
        height: sceneRef.current.clientHeight,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio
      }
    });

    engineRef.current = engine;
    renderRef.current = render;

    // 2. Create static boundaries (Floor, Walls)
    const cw = render.options.width;
    const ch = render.options.height;
    
    const floor = Matter.Bodies.rectangle(cw / 2, ch + 25, cw * 2, 50, { 
      isStatic: true,
      label: 'boundary',
      render: { fillStyle: '#1f2937' } // Tailwind gray-800
    });
    
    const leftWall = Matter.Bodies.rectangle(-25, ch / 2, 50, ch * 2, { isStatic: true, label: 'boundary' });
    const rightWall = Matter.Bodies.rectangle(cw + 25, ch / 2, 50, ch * 2, { isStatic: true, label: 'boundary' });

    Matter.World.add(engine.world, [floor, leftWall, rightWall]);

    // 3. Add Mouse Control
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Matter.World.add(engine.world, mouseConstraint);
    
    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // 4. Run the engine and renderer
    Matter.Runner.run(Matter.Runner.create(), engine);
    Matter.Render.run(render);

    // 5. Setup data extraction loop for analytics
    const updateInterval = setInterval(() => {
      const bodiesData = engine.world.bodies
        .filter(b => !b.isStatic)
        .map(b => ({
          id: b.id,
          velocity: Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2),
          kineticEnergy: 0.5 * b.mass * (b.velocity.x ** 2 + b.velocity.y ** 2),
          momentum: b.mass * Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2),
          mass: b.mass
        }));
      setPhysicsData(bodiesData);
      
      // Emit sync if we wanted to sync to others (simplified for MVP)
      // socket.emit('update_physics_state', { roomId, bodies: ... })
    }, 100);

    // Engine update loop for motors
    const beforeUpdate = () => {
      motorBodiesRef.current.forEach(motor => {
        const body = Matter.Composite.allBodies(engine.world).find(b => b.id === motor.id);
        if (body) {
          if (body.isStatic) {
            Matter.Body.setAngle(body, body.angle + motor.speed);
          } else {
            body.torque = motor.speed * 10;
          }
        }
      });
    };
    Matter.Events.on(engine, 'beforeUpdate', beforeUpdate);

    // 6. Socket listeners for multi-user sync
    const handleShapeAdded = (data) => {
      let newBody;
      if (data.type === 'box') {
        newBody = Matter.Bodies.rectangle(data.x, data.y, 60, 60, {
          id: data.id, restitution: 0.5, friction: 0.5, render: { fillStyle: data.color }
        });
      } else if (data.type === 'circle') {
        newBody = Matter.Bodies.circle(data.x, data.y, 30, {
          id: data.id, restitution: 0.8, friction: 0.5, render: { fillStyle: data.color }
        });
      }
      if (newBody) Matter.World.add(engine.world, newBody);
    };

    const handleConstraintAdded = (data) => {
      const allBodies = Matter.Composite.allBodies(engine.world);
      const bodyA = allBodies.find(b => b.id === data.bodyAId);
      const bodyB = allBodies.find(b => b.id === data.bodyBId);
      if (bodyA && bodyB) {
        const constraint = Matter.Constraint.create({
          id: data.id, bodyA: bodyA, bodyB: bodyB, stiffness: 0.05, render: { visible: true, lineWidth: 3, strokeStyle: '#8b5cf6' }
        });
        Matter.World.add(engine.world, constraint);
      }
    };

    const handleExperimentLoaded = (data) => {
      // Clear existing (except boundaries)
      const bodiesToRemove = engine.world.bodies.filter(b => b.label !== 'boundary');
      Matter.World.remove(engine.world, bodiesToRemove);
      Matter.World.remove(engine.world, engine.world.constraints.filter(c => c.label !== 'Mouse Constraint'));

      // Add bodies
      const newBodies = data.bodies.map(bData => {
        const commonOptions = {
          id: bData.id,
          isStatic: bData.isStatic || false,
          render: { fillStyle: bData.color || '#fff' }
        };
        if (bData.restitution) commonOptions.restitution = bData.restitution;
        if (bData.mass) commonOptions.mass = bData.mass;

        let body;
        if (bData.type === 'box') {
          body = Matter.Bodies.rectangle(bData.x, bData.y, bData.width || 60, bData.height || 60, commonOptions);
        } else if (bData.type === 'circle') {
          body = Matter.Bodies.circle(bData.x, bData.y, bData.radius || 30, commonOptions);
        }
        
        if (body && bData.velocity) {
          Matter.Body.setVelocity(body, bData.velocity);
        }
        
        return body;
      }).filter(Boolean);

      Matter.World.add(engine.world, newBodies);

      // Add constraints
      if (data.constraints) {
        const newConstraints = data.constraints.map(cData => {
          const bodyA = newBodies.find(b => b.id === cData.bodyAId);
          const bodyB = newBodies.find(b => b.id === cData.bodyBId);
          if (bodyA && bodyB) {
            return Matter.Constraint.create({
              id: cData.id,
              bodyA: bodyA,
              bodyB: bodyB,
              stiffness: cData.stiffness || 0.05,
              render: { visible: true, lineWidth: 3, strokeStyle: '#8b5cf6' }
            });
          }
          return null;
        }).filter(Boolean);
        Matter.World.add(engine.world, newConstraints);
      }
    };

    const handleLockToggled = (data) => {
      const allBodies = Matter.Composite.allBodies(engine.world);
      const targetBody = allBodies.find(b => b.id === data.bodyId);
      if (targetBody) {
        Matter.Body.setStatic(targetBody, data.isStatic);
      }
    };

    const handleMotorAdded = (data) => {
      motorBodiesRef.current.push(data);
    };

    const handleNoteAdded = (data) => {
      setNotes(prev => [...prev, data]);
    };

    socket.on('shape_added', handleShapeAdded);
    socket.on('constraint_added', handleConstraintAdded);
    socket.on('experiment_loaded', handleExperimentLoaded);
    socket.on('lock_toggled', handleLockToggled);
    socket.on('motor_added', handleMotorAdded);
    socket.on('note_added', handleNoteAdded);

    // Handle Resize
    const handleResize = () => {
      if (!sceneRef.current || !renderRef.current) return;
      renderRef.current.canvas.width = sceneRef.current.clientWidth;
      renderRef.current.canvas.height = sceneRef.current.clientHeight;
      Matter.Render.setPixelRatio(renderRef.current, window.devicePixelRatio);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      socket.off('shape_added', handleShapeAdded);
      socket.off('constraint_added', handleConstraintAdded);
      socket.off('experiment_loaded', handleExperimentLoaded);
      socket.off('lock_toggled', handleLockToggled);
      socket.off('motor_added', handleMotorAdded);
      socket.off('note_added', handleNoteAdded);
      Matter.Events.off(engine, 'beforeUpdate', beforeUpdate);
      window.removeEventListener('resize', handleResize);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.canvas = null;
      render.context = null;
      render.textures = {};
      clearInterval(updateInterval);
    };
  }, [roomId, setPhysicsData, socket]);

  const selectedBodyRef = useRef(null);

  useEffect(() => {
    selectedBodyRef.current = null;
  }, [activeTool]);

  // Handle clicking on canvas to add shapes based on activeTool
  const handleCanvasClick = (e) => {
    if (!engineRef.current || activeTool === 'select') return;

    const rect = sceneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'lock') {
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      const clickedBodies = Matter.Query.point(bodies, { x, y });
      
      if (clickedBodies.length > 0) {
        const targetBody = clickedBodies[0];
        if (targetBody.label !== 'boundary') {
          const newStaticState = !targetBody.isStatic;
          Matter.Body.setStatic(targetBody, newStaticState);
          socket.emit('toggle_lock', { roomId, bodyId: targetBody.id, isStatic: newStaticState });
        }
      }
      return;
    }

    if (activeTool === 'motor') {
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      const clickedBodies = Matter.Query.point(bodies, { x, y });
      
      if (clickedBodies.length > 0) {
        const targetBody = clickedBodies[0];
        if (targetBody.label !== 'boundary') {
          const motorData = { id: targetBody.id, speed: 0.05 };
          motorBodiesRef.current.push(motorData);
          socket.emit('add_motor', { roomId, ...motorData });
        }
      }
      return;
    }

    if (activeTool === 'note') {
       const text = prompt('Enter note text:');
       if (text) {
          const noteData = { id: Date.now(), x, y, text };
          setNotes(prev => [...prev, noteData]);
          socket.emit('add_note', { roomId, ...noteData });
       }
       return;
    }

    if (activeTool === 'spring') {
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      const clickedBodies = Matter.Query.point(bodies, { x, y });
      
      if (clickedBodies.length > 0) {
        // Ignore static bodies if they are the only thing clicked, or allow connecting to walls?
        // Actually, connecting to walls (static bodies) is highly desirable in physics sims.
        const clickedBody = clickedBodies[0];
        
        if (!selectedBodyRef.current) {
          // Select first body
          selectedBodyRef.current = clickedBody;
        } else {
          // Select second body and link
          const bodyA = selectedBodyRef.current;
          const bodyB = clickedBody;
          
          if (bodyA !== bodyB) {
            const constraintId = Date.now() + Math.floor(Math.random() * 1000);
            const constraint = Matter.Constraint.create({
              id: constraintId,
              bodyA: bodyA,
              bodyB: bodyB,
              stiffness: 0.05,
              render: {
                visible: true,
                lineWidth: 3,
                strokeStyle: '#8b5cf6' // Tailwind violet-500
              }
            });
            Matter.World.add(engineRef.current.world, constraint);
            socket.emit('add_constraint', { roomId, id: constraintId, bodyAId: bodyA.id, bodyBId: bodyB.id });
          }
          selectedBodyRef.current = null; // Reset selection
        }
      } else {
        // Clicked empty space, reset selection
        selectedBodyRef.current = null;
      }
      return;
    }

    let newBody;
    const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b']; // Indigo, Pink, Teal, Amber
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    let type = '';

    if (activeTool === 'box') {
      type = 'box';
      newBody = Matter.Bodies.rectangle(x, y, 60, 60, {
        id: newId,
        restitution: 0.5,
        friction: 0.5,
        render: { fillStyle: randomColor }
      });
    } else if (activeTool === 'circle') {
      type = 'circle';
      newBody = Matter.Bodies.circle(x, y, 30, {
        id: newId,
        restitution: 0.8,
        friction: 0.5,
        render: { fillStyle: randomColor }
      });
    }

    if (newBody) {
      Matter.World.add(engineRef.current.world, newBody);
      socket.emit('add_shape', { roomId, type, id: newId, x, y, color: randomColor });
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div 
        ref={sceneRef} 
        className="w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
      >
        {/* Canvas is injected here by Matter.js */}
      </div>

      {/* Sticky Notes Overlay */}
      {notes.map(note => (
        <div 
          key={note.id} 
          className="absolute bg-yellow-300 text-yellow-900 px-3 py-2 rounded shadow-lg text-sm font-medium transform -translate-x-1/2 -translate-y-1/2 pointer-events-none whitespace-pre-wrap max-w-xs z-20"
          style={{ left: note.x, top: note.y }}
        >
          {note.text}
        </div>
      ))}
    </div>
  );
};

export default PhysicsCanvas;

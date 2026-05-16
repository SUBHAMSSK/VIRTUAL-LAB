export const EXPERIMENT_TEMPLATES = [
  {
    id: 'pendulum_basic',
    name: 'Pendulum Energy Transfer',
    description: 'A simple pendulum experiment showing kinetic vs. potential energy curves in real time.',
    color: 'bg-pink-500/20',
    borderColor: 'border-pink-500/50',
    data: {
      bodies: [
        { type: 'box', x: 400, y: 100, width: 200, height: 20, isStatic: true, id: 101, color: '#4b5563' },
        { type: 'circle', x: 200, y: 300, radius: 40, isStatic: false, id: 102, color: '#ec4899', restitution: 0.9, mass: 5 }
      ],
      constraints: [
        { id: 201, bodyAId: 101, bodyBId: 102, stiffness: 0.1 }
      ]
    }
  },
  {
    id: 'car_crash',
    name: 'Car Crash Dynamics',
    description: 'Two carts collide at different velocities to observe momentum conservation.',
    color: 'bg-amber-500/20',
    borderColor: 'border-amber-500/50',
    data: {
      bodies: [
        { type: 'box', x: 200, y: 500, width: 80, height: 40, isStatic: false, id: 301, color: '#f59e0b', velocity: { x: 10, y: 0 } },
        { type: 'box', x: 600, y: 500, width: 80, height: 40, isStatic: false, id: 302, color: '#6366f1', velocity: { x: -5, y: 0 } }
      ],
      constraints: []
    }
  },
  {
    id: 'bridge_stability',
    name: 'Bridge Stability Test',
    description: 'Learners design truss bridges, apply loads, and observe stress distribution.',
    color: 'bg-teal-500/20',
    borderColor: 'border-teal-500/50',
    data: {
      bodies: [
        { type: 'box', x: 200, y: 400, width: 50, height: 200, isStatic: true, id: 401, color: '#4b5563' },
        { type: 'box', x: 600, y: 400, width: 50, height: 200, isStatic: true, id: 402, color: '#4b5563' },
        { type: 'box', x: 400, y: 290, width: 450, height: 20, isStatic: false, id: 403, color: '#14b8a6', mass: 10 }
      ],
      constraints: []
    }
  }
];

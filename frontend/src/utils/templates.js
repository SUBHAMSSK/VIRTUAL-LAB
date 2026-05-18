export const EXPERIMENT_TEMPLATES = [
  {
    id: 'pendulum_basic',
    name: 'Pendulum Energy Transfer',
    description: 'A simple pendulum experiment showing kinetic vs. potential energy curves in real time.',
    color: 'bg-pink-500/20',
    borderColor: 'border-pink-500/50',
    category: 'Mechanics',
    difficulty: 'Beginner',
    data: {
      bodies: [
        { type: 'box', x: 400, y: 80, width: 200, height: 20, isStatic: true, id: 101, color: '#4b5563' },
        { type: 'circle', x: 200, y: 320, radius: 40, isStatic: false, id: 102, color: '#ec4899', restitution: 0.9, mass: 5 }
      ],
      constraints: [
        { id: 201, bodyAId: 101, bodyBId: 102, stiffness: 1, damping: 0 }
      ]
    }
  },
  {
    id: 'newtons_cradle',
    name: "Newton's Cradle",
    description: "Five suspended balls demonstrate momentum and kinetic energy transfer through elastic collisions.",
    color: 'bg-violet-500/20',
    borderColor: 'border-violet-500/50',
    category: 'Collisions',
    difficulty: 'Intermediate',
    data: {
      bodies: [
        { type: 'box', x: 400, y: 80, width: 300, height: 15, isStatic: true, id: 901, color: '#374151' },
        { type: 'circle', x: 270, y: 230, radius: 22, isStatic: false, id: 902, color: '#8b5cf6', restitution: 1.0, mass: 3, frictionAir: 0.001 },
        { type: 'circle', x: 314, y: 230, radius: 22, isStatic: false, id: 903, color: '#8b5cf6', restitution: 1.0, mass: 3, frictionAir: 0.001 },
        { type: 'circle', x: 358, y: 230, radius: 22, isStatic: false, id: 904, color: '#8b5cf6', restitution: 1.0, mass: 3, frictionAir: 0.001 },
        { type: 'circle', x: 402, y: 230, radius: 22, isStatic: false, id: 905, color: '#8b5cf6', restitution: 1.0, mass: 3, frictionAir: 0.001 },
        { type: 'circle', x: 446, y: 230, radius: 22, isStatic: false, id: 906, color: '#a78bfa', restitution: 1.0, mass: 3, frictionAir: 0.001, velocity: { x: -8, y: 0 } },
      ],
      constraints: [
        { id: 1001, bodyAId: 901, bodyBId: 902, stiffness: 1, length: 150 },
        { id: 1002, bodyAId: 901, bodyBId: 903, stiffness: 1, length: 150 },
        { id: 1003, bodyAId: 901, bodyBId: 904, stiffness: 1, length: 150 },
        { id: 1004, bodyAId: 901, bodyBId: 905, stiffness: 1, length: 150 },
        { id: 1005, bodyAId: 901, bodyBId: 906, stiffness: 1, length: 150 },
      ]
    }
  },
  {
    id: 'car_crash',
    name: 'Car Crash Dynamics',
    description: 'Two carts collide at different velocities to observe conservation of momentum.',
    color: 'bg-amber-500/20',
    borderColor: 'border-amber-500/50',
    category: 'Collisions',
    difficulty: 'Beginner',
    data: {
      bodies: [
        { type: 'box', x: 180, y: 500, width: 90, height: 45, isStatic: false, id: 301, color: '#f59e0b', velocity: { x: 10, y: 0 }, restitution: 0.6 },
        { type: 'box', x: 620, y: 500, width: 90, height: 45, isStatic: false, id: 302, color: '#6366f1', velocity: { x: -5, y: 0 }, restitution: 0.6 }
      ],
      constraints: []
    }
  },
  {
    id: 'bridge_stability',
    name: 'Bridge Stability Test',
    description: 'Design a truss bridge, apply loads, and observe structural stress distribution.',
    color: 'bg-teal-500/20',
    borderColor: 'border-teal-500/50',
    category: 'Structural',
    difficulty: 'Advanced',
    data: {
      bodies: [
        { type: 'box', x: 180, y: 420, width: 50, height: 200, isStatic: true, id: 401, color: '#374151' },
        { type: 'box', x: 620, y: 420, width: 50, height: 200, isStatic: true, id: 402, color: '#374151' },
        { type: 'box', x: 400, y: 305, width: 480, height: 20, isStatic: false, id: 403, color: '#14b8a6', mass: 15, restitution: 0.1 },
        { type: 'circle', x: 400, y: 240, radius: 35, isStatic: false, id: 404, color: '#ef4444', mass: 30, restitution: 0.1 },
      ],
      constraints: [
        { id: 501, bodyAId: 401, bodyBId: 403, stiffness: 0.9 },
        { id: 502, bodyAId: 402, bodyBId: 403, stiffness: 0.9 },
      ]
    }
  },
  {
    id: 'spring_oscillator',
    name: 'Damped Spring Oscillator',
    description: 'Observe simple harmonic motion with adjustable damping on a spring-mass system.',
    color: 'bg-rose-500/20',
    borderColor: 'border-rose-500/50',
    category: 'Oscillation',
    difficulty: 'Intermediate',
    data: {
      bodies: [
        { type: 'box', x: 400, y: 100, width: 80, height: 20, isStatic: true, id: 601, color: '#374151' },
        { type: 'box', x: 400, y: 320, width: 70, height: 70, isStatic: false, id: 602, color: '#f43f5e', mass: 3, frictionAir: 0.015 }
      ],
      constraints: [
        { id: 701, bodyAId: 601, bodyBId: 602, stiffness: 0.04, damping: 0.03, length: 120, render: { visible: false, strokeStyle: '#f43f5e', type: 'spring' } }
      ]
    }
  },
  {
    id: 'projectile_motion',
    name: 'Projectile Motion',
    description: 'Launch a ball at an angle and study the parabolic trajectory and range equation.',
    color: 'bg-sky-500/20',
    borderColor: 'border-sky-500/50',
    category: 'Kinematics',
    difficulty: 'Beginner',
    data: {
      bodies: [
        { type: 'circle', x: 80, y: 500, radius: 25, isStatic: false, id: 801, color: '#38bdf8', mass: 2, velocity: { x: 14, y: -18 }, restitution: 0.5 },
        { type: 'box', x: 800, y: 520, width: 60, height: 60, isStatic: true, id: 802, color: '#dc2626' }
      ],
      constraints: []
    }
  }
];

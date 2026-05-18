# VIRTUAL-LAB — Digital Twin Physics Sandbox 🧪⚛️

> A collaborative, real-time 2D physics simulation platform for university-level learning.  
> Bridge the gap between theoretical equations and physical intuition — together.

---

## ✨ Overview

**VIRTUAL-LAB** is a web-based Digital Twin environment where multiple users simultaneously design mechanical systems, run physics simulations, and observe live telemetry — all inside a shared, high-fidelity workspace.

Instructors build and broadcast experiments. Students observe, interact, and develop physical intuition through hands-on experimentation rather than passive video watching.

---

## 🌟 Key Features

### ⚙️ Interactive Physics Canvas
Built on **Matter.js** — a production-grade 2D rigid-body physics engine:
- Spawn **boxes** and **circles** with realistic mass, friction, and restitution
- Drag, throw, and interact with bodies in real time
- **Play / Pause** simulation at any point
- **Reset canvas** to clear all bodies and constraints instantly
- Velocity and force **vector overlays** rendered directly on the canvas (red = velocity, blue = force)

### 🔗 Advanced Constraint System
Five mechanical connection types available from the toolbar:

| Tool | Type | Behavior |
|------|------|----------|
| 🌀 Spring | Soft elastic | Oscillates with configurable stiffness & damping |
| 🪢 Rope | Distance constraint | Inextensible tether, fixed length |
| 📌 Pivot | Pin joint | Zero-length rigid pivot, enables rotation |
| 🔒 Lock | Static freeze | Anchors a body in place |
| ⚙️ Motor | Rotational torque | Continuously spins a body |

Visual feedback guides two-step constraint creation — a banner prompts *"Click a second body to connect"*.

### 👥 Real-Time Multi-User Collaboration
Powered by **Socket.io** with an **Agent Middleware** delta-compression layer:
- All users in the same **Room ID** share a synchronized physics world
- **Delta sync**: only bodies that moved beyond 0.5 px/rad threshold are broadcast, minimizing network traffic
- Synced events: shape creation, constraints, motors, locks, sticky notes, experiment loads, and canvas resets
- **Instructor** role: full toolbar access, classroom management, cloud saves, AI generation
- **Student** role: read-only observer with live telemetry view

### 📊 Real-Time Analytics Dashboard
An integrated telemetry panel updates at 10 Hz:

| Panel | Data |
|-------|------|
| **Stat Cards** | Active Objects · Max Speed · System KE · Total Momentum |
| **KE Chart** | Rolling 60-frame live line chart of total kinetic energy (J) |
| **Momentum Chart** | Rolling 60-frame live line chart of system momentum (kg·m/s) |
| **Avg Velocity Chart** | Rolling 60-frame average speed across all bodies |
| **Speed Histogram** | Distribution of body speeds in 5 buckets (m/s) |
| **Body Telemetry** | Per-body list with velocity color coding; click to expand KE, momentum, mass |

### 🧪 Experiment Library
A gallery modal with two tabs:

**Lab Templates** (6 built-in, filterable by category & difficulty):
| Experiment | Category | Difficulty |
|------------|----------|------------|
| Pendulum Energy Transfer | Mechanics | Beginner |
| Newton's Cradle | Collisions | Intermediate |
| Car Crash Dynamics | Collisions | Beginner |
| Bridge Stability Test | Structural | Advanced |
| Damped Spring Oscillator | Oscillation | Intermediate |
| Projectile Motion | Kinematics | Beginner |

**Cloud Saves tab**: Fetches instructor-saved experiments from MongoDB with creation timestamps.

### 🤖 AI Experiment Generator
Instructors describe a scenario in plain English — the system translates it into a live Matter.js scene:
- *"Build a trebuchet"* → arm + counterweight + pivot + projectile
- *"Create a simple pendulum"* → anchor + bob + rigid constraint
- *"Build a spring with damping"* → anchor + mass + spring constraint
- *"Build a car"* → chassis + two wheels + soft suspension

### ☁️ Cloud Save & Restore
- **Save to Cloud**: serializes all bodies and constraints → POST to Express API → stored in MongoDB
- **Load from Library**: restores full scene state including constraint types and initial velocities
- **DELETE** endpoint for removing saved experiments

### 🎥 Simulation Recording
- Captures the Matter.js canvas stream at 30 FPS using the **MediaRecorder API**
- Exports as `.webm` video file on stop — ready for lab reports or submissions

### 📝 Sticky Note Annotations
- Instructors place floating notes directly on the canvas
- Synced to all room participants in real time
- Useful for marking stress points, labeling forces, or leaving instructions

### 🏫 Classroom Manager
- Instructors see all active rooms with live object counts
- One-click room switching without re-logging in

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 18 + Vite 5 |
| **Physics Engine** | Matter.js 0.19 |
| **Styling** | Tailwind CSS 3 |
| **Charts** | Chart.js 4 + react-chartjs-2 |
| **Icons** | Lucide React |
| **Real-Time** | Socket.io 4 (client + server) |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **Dev Server** | Nodemon |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v16+
- **MongoDB** running locally on port `27017`

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 2. Start Backend
```bash
cd backend
npm run dev
# ✅  Running at http://localhost:4000
```

> If you see `EADDRINUSE` on port 4000, kill the old process:
> ```bash
> lsof -ti :4000 | xargs kill -9
> ```

### 3. Start Frontend
```bash
cd frontend
npm run dev
# ✅  Running at http://localhost:5173 (or 5174 if busy)
```

### 4. Open Multiple Windows
Open `http://localhost:5173` in **two separate browser windows**.  
Log in as **Instructor** in one and **Student** in the other with the **same Room ID** to experience real-time collaboration.

---

## 🎮 Toolbar Reference

| Icon | Tool | Shortcut Tip |
|------|------|-------------|
| ↖ | Select & Move | Default mode for dragging bodies |
| ▢ | Create Box | Click canvas to spawn |
| ○ | Create Circle | Click canvas to spawn |
| 🌀 | Spring | Click body A → click body B |
| ✂ | Rope | Click body A → click body B (fixed length) |
| ⚓ | Pivot | Click body A → click body B (pin joint) |
| 🔒 | Lock/Unlock | Click any body to toggle static |
| ⚙️ | Motor | Click any body to add continuous spin |
| 📝 | Sticky Note | Click canvas, type, confirm |
| ⏸ | Play/Pause | Toggle simulation running state |
| ↺ | Reset | Clear all objects and constraints |

---

## 📂 Project Structure

```
VIRTUAL-LAB/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Root layout, socket init, state
│   │   ├── components/
│   │   │   ├── PhysicsCanvas.jsx      # Matter.js engine, tools, vector overlay
│   │   │   ├── Toolbar.jsx            # Tool selector, play/pause, reset
│   │   │   ├── AnalyticsDashboard.jsx # Live charts, telemetry, histogram
│   │   │   └── ExperimentLibrary.jsx  # Gallery modal, tabs, filters
│   │   ├── utils/
│   │   │   └── templates.js           # 6 built-in experiment definitions
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── server.js                      # Express REST + Socket.io + delta middleware
│   ├── models/
│   │   └── Experiment.js              # Mongoose schema
│   └── package.json
│
└── README.md
```

---

## 🔌 API Reference

### REST Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/experiments` | Save a new experiment to MongoDB |
| `GET` | `/api/experiments` | Fetch all saved experiments (sorted newest first) |
| `DELETE` | `/api/experiments/:id` | Delete an experiment by ID |

### Socket.io Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_room` | Client → Server | `roomId` |
| `add_shape` | Client → Room | `{ roomId, type, id, x, y, color }` |
| `add_constraint` | Client → Room | `{ roomId, id, bodyAId, bodyBId, stiffness, ... }` |
| `toggle_lock` | Client → Room | `{ roomId, bodyId, isStatic }` |
| `add_motor` | Client → Room | `{ roomId, id, speed }` |
| `add_note` | Client → Room | `{ roomId, id, x, y, text }` |
| `load_experiment` | Client → Room | `{ roomId, experimentData }` |
| `reset_canvas` | Client → Room | `{ roomId }` |
| `update_physics_state` | Client → Server | `{ roomId, bodies[] }` — delta compressed |
| `sync_delta` | Server → Room | `[{ id, x, y, angle, vx, vy }]` — only changed bodies |
| `active_rooms_list` | Server → Client | `[{ id, objectCount }]` |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT — free to use, modify, and distribute.

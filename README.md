# VIRTUAL-LAB | Digital Twin 🧑‍🔬⚛️

VIRTUAL-LAB is a collaborative 2D physics sandbox built for university-level experimentation and interactive learning. 
It functions as a Digital Twin environment — a shared virtual workspace where multiple users can design systems, simulate physical interactions, test structural behavior, and visualize real-time physics collaboratively.

The platform transforms theoretical concepts from mechanics and engineering into an engaging, hands-on experience through real-time simulation and analytics.

## 🌟 Features

### ⚙️ Interactive Physics Sandbox
Built with **Matter.js**, the simulation canvas allows users to:
* Create dynamic objects like boxes and circles
* Configure physical properties such as:
  * Mass
  * Restitution
  * Friction
* Drag, move, and interact with bodies naturally in real time

### 👥 Real-Time Collaboration
Powered by **Socket.io**, multiple users can work together inside shared rooms with synchronized:
* Object creation
* Constraint connections
* Motors and locks
* Sticky notes and annotations
* Physics state updates

### 🔗 Advanced Constraint System
Design complex mechanical systems using:
* Springs and elastic constraints
* Object locking tools
* Rotational motors for gears and pulleys

This enables creation of:
* Pendulums
* Suspension systems
* Gear mechanisms
* Structural experiments

### 📊 Live Physics Analytics
Integrated telemetry dashboards visualize simulation data in real time using **Chart.js**:
* System Kinetic Energy
* System Momentum
* Dynamic physics trends at 60 FPS

### ☁️ Experiment Library & Cloud Saves
Users and instructors can:
* Load predefined experiments
* Save custom lab environments to MongoDB
* Share reusable experiment templates globally

Example experiments include:
* Pendulum systems
* Trebuchets
* Car collision simulations
* Mechanical gear setups

### 📝 Collaborative Annotations
Sticky notes can be placed directly onto the simulation canvas to:
* Highlight observations
* Explain concepts
* Mark stress points
* Leave collaborative instructions

## 🛠️ Tech Stack
**Frontend**
* React.js
* Vite
* Matter.js
* Tailwind CSS
* Chart.js (react-chartjs-2)
* Lucide React

**Backend**
* Node.js
* Express.js
* Socket.io

**Database**
* MongoDB
* Mongoose

## 🚀 Getting Started

### Prerequisites
Make sure the following are installed on your system:
* Node.js (v16 or higher)
* MongoDB (running locally on port `27017`)

### 1️⃣ Backend Setup
Navigate to the backend folder:
```bash
cd backend
```
Install dependencies:
```bash
npm install
```
Start the backend server:
```bash
npm run dev
```
The backend will start at: `http://localhost:4000` *(Note: updated port to 4000 to avoid macOS conflicts)*

### 2️⃣ Frontend Setup
Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
```
Install dependencies:
```bash
npm install
```
Start the frontend server:
```bash
npm run dev
```
The application will usually run at: `http://localhost:5173`

*Open multiple browser tabs/windows to test real-time collaboration.*

## 🎮 Usage Guide

| Tool | Description |
| :--- | :--- |
| **Select & Move** | Drag and reposition objects naturally |
| **Create Box / Circle** | Spawn physical bodies onto the canvas |
| **Create Spring** | Connect two objects with elastic constraints |
| **Lock Object** | Freeze objects in place |
| **Add Motor** | Apply rotational velocity to objects |
| **Sticky Notes** | Add collaborative annotations |
| **Library** | Load saved or predefined experiments |

## 🧪 Example Use Cases
* Physics laboratory simulations
* Mechanical system prototyping
* Engineering demonstrations
* Classroom collaboration
* Structural behavior visualization
* Interactive educational experiments

## 📂 Project Structure
```text
VIRTUAL-LAB/
│
├── frontend/        # React + Matter.js client
├── backend/         # Express + Socket.io server
├── backend/models/  # MongoDB schemas
└── README.md
```

## 🔮 Future Enhancements
* Multi-room classroom management
* User authentication and roles
* Advanced force/vector visualization
* Export simulation recordings
* 3D physics support
* AI-assisted experiment generation

## 🤝 Contributing
Contributions are welcome!

To contribute:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

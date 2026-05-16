# VIRTUAL-LAB | Digital Twin 🧑‍🔬⚛️

VIRTUAL-LAB is a collaborative 2D physics sandbox designed for university-level learning. It acts as a "Digital Twin" environment—a shared, high-fidelity workspace where multiple users can build machines, test structural integrity, and observe real-time forces. It bridges the gap between theoretical equations and physical reality through hands-on experimentation.

![VIRTUAL-LAB Banner](https://via.placeholder.com/1000x300.png?text=VIRTUAL-LAB+Digital+Twin)

## 🌟 Key Features

*   **Interactive Physics Canvas:** A rich web-based workspace powered by **Matter.js**. Users can drag, drop, and configure physical bodies (boxes, circles) with varying masses and restitutions.
*   **Multi-User Room Engine:** Powered by **Socket.io**, the platform synchronizes the physical state—including shape spawns, constraint connections, and sticky notes—across all users in a room in real-time.
*   **Advanced Constraint System:** Build mechanical connections using the Spring/Constraint tool. Includes Instructor tools like "Lock" to freeze dynamic objects, and "Motor" to apply continuous angular velocity to gears/pulleys.
*   **Real-Time Analytics Dashboard:** An integrated telemetry panel utilizing **Chart.js** that parses 60FPS physics data to plot live Line Charts for System Kinetic Energy and System Momentum.
*   **Experiment Library & Cloud Saves:** Browse pre-configured physics scenarios (e.g., Trebuchet, Pendulum, Car Crash). Instructors can completely configure a custom lab environment on the canvas and **Save to Cloud** (MongoDB) to be loaded globally.
*   **Collaborative Annotation:** Drop synchronized sticky notes directly onto the physics canvas to highlight stress points or leave instructions for students.

## 🛠️ Technology Stack

*   **Frontend:** React.js, Vite, Matter.js (2D Physics Engine), Chart.js (react-chartjs-2), Tailwind CSS, Lucide React (Icons).
*   **Backend:** Node.js, Express.js, Socket.io (WebSockets).
*   **Database:** MongoDB, Mongoose (Cloud storage for experiment templates).

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your local machine:
*   [Node.js](https://nodejs.org/en/) (v16 or higher)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Running locally on default port `27017`)

### 1. Backend Setup (Room Engine & Database)
Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
npm run dev
```
*The server will start on `http://localhost:5000` and connect to MongoDB.*

### 2. Frontend Setup (React Client)
Open a **new** terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
*The Vite development server will start, usually on `http://localhost:5173`. Open this URL in multiple browser windows to test the real-time collaboration!*

## 🎮 How to Use

1.  **Select & Move:** Default tool. Click and drag objects naturally.
2.  **Create Box / Circle:** Click anywhere on the dark canvas to spawn a dynamic body.
3.  **Create Spring:** Click the first body (Anchor A), then click a second body (Anchor B) to wire them together with an elastic constraint.
4.  **Lock Object:** Click any dynamic body to toggle its static state (freeze it in mid-air).
5.  **Add Motor:** Click an object to convert it into a motor with continuous angular velocity. Perfect for creating gears.
6.  **Add Sticky Note:** Click anywhere to leave a text annotation for the class.
7.  **Library:** Click the Library button in the top header to load a predefined experiment, or retrieve a custom lab previously saved to the Cloud.

## 📝 Roadmap Completion
- [x] **MVP:** Drag-and-drop shapes, basic constraints, real-time sync, simple analytics.
- [x] **Phase 2:** Experiment library, expanded analytics (momentum charts), instructor lock tools.
- [x] **Phase 3:** Motors/gears, collaborative annotations, cloud-based MongoDB integration.

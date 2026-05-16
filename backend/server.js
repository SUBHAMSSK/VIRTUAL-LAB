const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Experiment = require('./models/Experiment');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Assuming local MongoDB is running. In production, this would be a MongoDB Atlas URI.
mongoose.connect('mongodb://127.0.0.1:27017/virtual_lab')
  .then(() => console.log('MongoDB connected for VIRTUAL-LAB Cloud'))
  .catch(err => console.error('MongoDB connection error:', err));

// REST APIs for Cloud Classroom Integration
app.post('/api/experiments', async (req, res) => {
  try {
    const newExp = new Experiment(req.body);
    const savedExp = await newExp.save();
    res.status(201).json(savedExp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/experiments', async (req, res) => {
  try {
    const experiments = await Experiment.find().sort('-createdAt');
    res.status(200).json(experiments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all for MVP
    methods: ["GET", "POST"]
  }
});

// A simple in-memory state store for the physics objects
// In a real app, this would be managed by MongoDB or a more robust memory store
const rooms = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins a simulation room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = { objects: [] }; // Initial state
    }
    socket.emit('initial_state', rooms[roomId]);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Handle physics state updates (e.g., from the room host or a client dragging an object)
  socket.on('update_physics_state', ({ roomId, bodies }) => {
    rooms[roomId].objects = bodies;
    // Broadcast to everyone else in the room
    socket.to(roomId).emit('sync_physics_state', bodies);
  });

  // Action syncs
  socket.on('add_shape', (data) => {
    socket.to(data.roomId).emit('shape_added', data);
  });

  socket.on('add_constraint', (data) => {
    socket.to(data.roomId).emit('constraint_added', data);
  });

  socket.on('toggle_lock', (data) => {
    socket.to(data.roomId).emit('lock_toggled', data);
  });

  socket.on('add_motor', (data) => {
    socket.to(data.roomId).emit('motor_added', data);
  });

  socket.on('add_note', (data) => {
    socket.to(data.roomId).emit('note_added', data);
  });

  socket.on('load_experiment', (data) => {
    io.in(data.roomId).emit('experiment_loaded', data.experimentData);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`VIRTUAL-LAB Multi-User Room Engine running on port ${PORT}`);
});

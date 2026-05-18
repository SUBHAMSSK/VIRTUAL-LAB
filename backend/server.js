const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const cors     = require('cors');
const mongoose = require('mongoose');
const Experiment = require('./models/Experiment');

const app = express();
app.use(cors());
app.use(express.json());

// ── MongoDB ───────────────────────────────────────────────────────────────
mongoose.connect('mongodb://127.0.0.1:27017/virtual_lab')
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => console.error('❌  MongoDB error:', err));

// ── REST API ──────────────────────────────────────────────────────────────
app.post('/api/experiments', async (req, res) => {
  try {
    const saved = await new Experiment(req.body).save();
    res.status(201).json(saved);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/experiments', async (req, res) => {
  try {
    const experiments = await Experiment.find().sort('-createdAt').lean();
    res.status(200).json(experiments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/experiments/:id', async (req, res) => {
  try {
    await Experiment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Socket.io ─────────────────────────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// In-memory room state
const rooms = {};

// ── Agent Middleware: delta compression helper ─────────────────────────────
// We store the last broadcast state per room and only emit non-trivial deltas
const DELTA_THRESHOLD = 0.5; // pixels or radians movement before we broadcast

function computeDeltas(prev, current) {
  const deltas = [];
  current.forEach(b => {
    const old = prev.find(p => p.id === b.id);
    if (!old) { deltas.push({ ...b, _new: true }); return; }
    const moved =
      Math.abs(b.x - old.x) > DELTA_THRESHOLD ||
      Math.abs(b.y - old.y) > DELTA_THRESHOLD ||
      Math.abs(b.angle - (old.angle || 0)) > DELTA_THRESHOLD;
    if (moved) {
      deltas.push({ id: b.id, x: b.x, y: b.y, angle: b.angle, vx: b.vx, vy: b.vy });
    }
  });
  return deltas;
}

io.on('connection', (socket) => {
  console.log(`🔌  User connected: ${socket.id}`);

  // Join room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = { objects: [], lastBroadcast: [], constraintCount: 0 };
    }
    socket.emit('initial_state', rooms[roomId]);
    console.log(`👤  ${socket.id} joined ${roomId}`);
    broadcastRoomList();
  });

  socket.on('get_active_rooms', () => {
    socket.emit('active_rooms_list', buildRoomList());
  });

  // ── Agent Middleware: high-frequency delta sync ──────────────────────────
  // Clients send their local body positions every frame; server computes
  // deltas, resolves conflicts (latest-write-wins per body), then fans out
  socket.on('update_physics_state', ({ roomId, bodies }) => {
    if (!rooms[roomId]) return;
    const deltas = computeDeltas(rooms[roomId].lastBroadcast, bodies);
    if (deltas.length > 0) {
      // Merge into room state
      bodies.forEach(b => {
        const idx = rooms[roomId].objects.findIndex(o => o.id === b.id);
        if (idx >= 0) rooms[roomId].objects[idx] = b;
        else rooms[roomId].objects.push(b);
      });
      rooms[roomId].lastBroadcast = bodies;
      // Broadcast only the delta payload to reduce bandwidth
      socket.to(roomId).emit('sync_delta', deltas);
    }
  });

  // ── Action events ─────────────────────────────────────────────────────────
  socket.on('add_shape', (data) => {
    if (rooms[data.roomId]) rooms[data.roomId].objects.push(data);
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
    if (rooms[data.roomId]) {
      rooms[data.roomId].objects = [];
      rooms[data.roomId].lastBroadcast = [];
    }
    io.in(data.roomId).emit('experiment_loaded', data.experimentData);
  });

  socket.on('reset_canvas', ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].objects = [];
      rooms[roomId].lastBroadcast = [];
    }
    socket.to(roomId).emit('canvas_reset');
  });

  socket.on('disconnect', () => {
    console.log(`🔌  User disconnected: ${socket.id}`);
    broadcastRoomList();
  });
});

function buildRoomList() {
  return Object.keys(rooms).map(r => ({ id: r, objectCount: rooms[r].objects.length }));
}
function broadcastRoomList() {
  io.emit('active_rooms_list', buildRoomList());
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀  VIRTUAL-LAB backend running on port ${PORT}`));

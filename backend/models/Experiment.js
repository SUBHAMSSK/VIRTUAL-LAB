const mongoose = require('mongoose');

const ExperimentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  authorId: { type: String, default: 'instructor_1' },
  data: {
    bodies: [{
      type: { type: String },
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      radius: Number,
      isStatic: Boolean,
      id: Number,
      color: String,
      restitution: Number,
      mass: Number,
      velocity: {
        x: Number,
        y: Number
      }
    }],
    constraints: [{
      id: Number,
      bodyAId: Number,
      bodyBId: Number,
      stiffness: Number
    }]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Experiment', ExperimentSchema);

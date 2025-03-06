const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['public', 'private'], default: 'public' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Organizer field
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ticketPrice: { type: Number, default: 0 },
  ticketTiers: {
    regular: { type: Number, default: 0 },
    vip: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('Event', eventSchema);
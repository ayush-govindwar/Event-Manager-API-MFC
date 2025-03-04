const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isVerified: { type: Boolean, default: false },
  tier: { type: String, enum: ['regular', 'vip'], default: 'regular' },
  price: { type: Number, required: true } 
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);

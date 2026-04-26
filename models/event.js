const mongoose = require('mongoose')
const eventSchema = new mongoose.Schema({
  eventName: String,
  date: Date,
  location: String,
  description: String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema)
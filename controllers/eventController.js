const Event = require("../models/event");
const User = require("../models/user");
const { sendRegistrationEmail } = require("../utils/emailService");
exports.createEvent = async (req, res) => {
  try {
    const { eventName, date, location, description } = req.body;
    const event = new Event({
      eventName,
      date,
      location,
      description,
    });
    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("participants", "name email");
    res.json(events);
  } catch (err) {
    res.status(500).send("Server error");
  }
};
exports.joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });
    if (event.participants.includes(req.user.id)) {
      return res.status(400).json({ msg: "Already joined" });
    }
    event.participants.push(req.user.id);
    await event.save();
    const user = await User.findById(req.user.id);
    if (user && user.email) {
      const dateStr = new Date(event.date).toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      });
      sendRegistrationEmail(user.email, user.name, event.eventName, dateStr, event.location);
    }
    const updatedEvent = await Event.findById(req.params.id).populate("participants", "name email");
    res.json(updatedEvent);
  } catch (err) {
    res.status(500).send("Server error");
  }
};
exports.updateEvent = async (req, res) => {
  try {
    const { eventName, date, location, description } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { eventName, date, location, description },
      { new: true, runValidators: true }
    ).populate("participants", "name email");
    if (!event) return res.status(404).json({ msg: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });
    await event.deleteOne();
    res.json({ msg: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
exports.getEventParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("participants", "name email university");
    if (!event) return res.status(404).json({ msg: "Event not found" });
    res.json(event.participants);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
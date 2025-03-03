const Event = require('../models/Event'); 
const User = require('../models/User');
const Ticket = require('../models/Ticket')
const { v4: uuidv4 } = require('uuid');

// Function to create a new event
const createEvent = async (req, res) => {
  const { title, description, date, location, type, ticketPrice, ticketTiers } = req.body;
  const userId = req.user.userId; // Get the user ID from the authenticated user

  try {
    // Check if the user ID is valid
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Invalid user ID. User not found.' });
    }

    // Create a new event with the provided details
    const newEvent = new Event({
      title,
      description,
      date,
      location,
      type,
      ticketPrice,
      ticketTiers,
      organizer: userId // Assign the user who created the event as the organizer
    });

    // Save the event to the database
    await newEvent.save();

    // Return the created event
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
};
const getUserEvents = async (req, res) => {
  const userId = req.user.userId; // Get the user ID from the authenticated user

  try {
    // Check if the user ID is valid
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Invalid user ID. User not found.' });
    }

    // Fetch all public events and private events created by the user
    const events = await Event.find({
      $or: [
        { type: 'public' }, // All public events
        { type: 'private', organizer: userId } // Private events created by the user
      ]
    }).populate('organizer', 'name email'); // Populate organizer details (optional)

    // Return the events
    res.status(200).json({ message: 'Events fetched successfully', events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};
const deleteEvent = async (req, res) => {
  const eventId = req.params.eventId; // Get the event ID from the request parameters
  const userId = req.user.userId; // Get the user ID from the authenticated user

  try {
    // Check if the user ID is valid
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Invalid user ID. User not found.' });
    }

    // Find the event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check if the authenticated user is the organizer of the event
    if (event.organizer.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this event.' });
    }

    // Delete the event
    await Event.findByIdAndDelete(eventId);

    // Return success message
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  const eventId = req.params.eventId; 
  const userId = req.user.userId; 
  const updates = req.body; 

  try {
    // Check if the user ID is valid
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Invalid user ID. User not found.' });
    }

    // Find the event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check if the authenticated user is the organizer of the event
    if (event.organizer.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this event.' });
    }

    // Update the event with the provided details
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updates }, // Apply the updates
      { new: true, runValidators: true } // Return the updated event and run schema validators
    );

    // Return the updated event
    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
};

const registerEvent = async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.user.userId;

  try {
    // Validate user and event
    const user = await User.findById(userId);
    const event = await Event.findById(eventId);
    if (!user || !event) {
      return res.status(404).json({ message: 'User or event not found.' });
    }

    // Check if user already has a ticket for this event
    const existingTicket = await Ticket.findOne({ event: eventId, user: userId });
    if (existingTicket) {
      return res.status(400).json({ message: 'You are already registered for this event.' });
    }

    // Create a new ticket
    const ticket = new Ticket({
      event: eventId,
      user: userId,
      tier: req.body.tier || 'regular' // Tier can be passed in the request body
    });
    await ticket.save();

    // Generate verification link (using the ticket ID)
    const verificationLink = `http://localhost:5000/api/v1/events/verify/${ticket._id}`;

    res.status(201).json({
      message: 'Registration successful. Show this QR code to the organizer.',
      verificationLink,
      ticketId: ticket._id
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to register for event', error: error.message });
  }
};
// Function to verify attendance using QR code
const verifyAttendance = async (req, res) => {
  const { ticketId } = req.params;
  const organizerId = req.user.userId;

  try {
    const ticket = await Ticket.findById(ticketId).populate('event');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    // Check if the organizer owns the event
    if (ticket.event.organizer.toString() !== organizerId) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    // Mark ticket as verified
    ticket.isVerified = true;
    await ticket.save();

    res.status(200).json({ message: 'Attendance verified successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify attendance.', error: error.message });
  }
};



// Export the controller functions
module.exports = {
  createEvent,
  getUserEvents,
  deleteEvent,
  updateEvent,
  verifyAttendance,
  registerEvent
}
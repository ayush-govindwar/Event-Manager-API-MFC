const Event = require('../models/Event'); // Import the Event model
const User = require('../models/User'); // Import the User model

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

// Export the controller functions
module.exports = {
  createEvent,
  getUserEvents
};
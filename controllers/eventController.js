const Event = require('../models/Event'); 
const User = require('../models/User');
const Ticket = require('../models/Ticket')

const  { sendUpdatesEmail , sendCancellationEmail} = require('../utils')
const createEvent = async (req, res) => {
  const { title, description, date, location, type, ticketPrice, ticketTiers } = req.body;
  const userId = req.user.userId; // Get the user Id from the authenticated user

  try {
    // Check if the userid is valid
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

    
    await newEvent.save();

    // Return the created event
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
};
const getUserEvents = async (req, res) => {
  const userId = req.user.userId; // Get the userid from the authenticated user

  try {
    // Check if the userid is valid
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Invalid user ID. User not found.' });
    }

    // Fetch all public events and private events created by the user only
    const events = await Event.find({
      $or: [
        { type: 'public' }, // All public events
        { type: 'private', organizer: userId } // Private events created by the user
      ]
    }).populate('organizer', 'name email'); // Put organizer details

    // Return the events
    res.status(200).json({ message: 'Events fetched successfully', events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};
const deleteEvent = async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.user.userId;

  try {
    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Find event and verify if user is organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.organizer.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete event.' });
    }

    
    // get the gegistrants and event title before deleting event
    const registrants = event.attendees|| [];
    const eventTitle = event.title;

    // Delete the event
    await Event.findByIdAndDelete(eventId);

    // Send response first
    res.status(200).json({ message: 'Event deleted successfully' });

    // Send cancellation emails to all registered attendees
    try {
      if (registrants.length > 0) {
        const users = await User.find({ _id: { $in: registrants } })
          .select('email name')
          .lean();

        console.log(`Sending cancellation emails to ${users.length} registrants`);

        await Promise.all(users.map(async (user) => {
          try {
            await sendCancellationEmail({
              name: user.name,
              email: user.email,
              eventTitle: eventTitle
            });
            console.log(`Cancellation email sent to ${user.email}`);
          } catch (emailError) {
            console.error(`Failed to send email to ${user.email}:`, emailError.message);
          }
        }));
      }
    } catch (emailProcessError) {
      console.error('Email notification process failed:', emailProcessError.message);
    }

  } catch (error) {
    console.error('Event deletion error:', error);
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  const eventId = req.params.eventId; 
  const userId = req.user.userId; 
  const updates = req.body; 

  try {
    // Validate user and event
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    // Check if user is organizer
    if (event.organizer.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update event.' });
    }

    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Send response first
    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
    const registrants = updatedEvent.attendees || [];
    if (registrants.length > 0) {
      const users = await User.find({ _id: { $in: registrants } }).select('email name');
      
      await Promise.all(users.map(user => 
        sendUpdatesEmail({
          name: user.name,
          email: user.email,
          eventTitle: updatedEvent.title, // Adjust field name 
        })
      ));
      console.log('Emails sent to registrants.');
    }
  


  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
};

const registerEvent = async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.user.userId;
  const { tier = 'regular' } = req.body; // Default tier is "regular"

  try {
    // Validate user and event
    const user = await User.findById(userId);
    const event = await Event.findById(eventId);
    if (!user || !event) {
      return res.status(404).json({ message: 'User or event not found.' });
    }

    // Check if the user already has a ticket for this event
    const existingTicket = await Ticket.findOne({ event: eventId, user: userId });
    if (existingTicket) {
      return res.status(400).json({ message: 'You are already registered for this event.' });
    }

    
    const ticketPrice = tier === 'vip' ? event.ticketTiers.vip : event.ticketTiers.regular;

    // Create a new ticket and store the price
    const ticket = new Ticket({
      event: eventId,
      user: userId,
      tier,
      price: ticketPrice // Storing price in the ticket
    });
    await ticket.save();

    // Also update the user's registeredEvents array
    user.registeredEvents.push(eventId);
    await user.save();

    // Generate verification link with ticket id
    const verificationLink = `${process.env.BASE_URL}/api/v1/event/verify/${ticket._id}`;

    res.status(201).json({
      message: 'Registration successful. Show this QR code to the organizer.',
      verificationLink,
      ticketId: ticket._id,
      price: ticketPrice // Returning stored price
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to register for event', error: error.message });
  }
};


// Function to verify attendance using QR code (link)
const verifyAttendance = async (req, res) => {
  const { ticketId } = req.params;
  const organizerId = req.user.userId;

  try {
    // Find the ticket and populate the event
    const ticket = await Ticket.findById(ticketId).populate('event');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    // Validate organizer ownership
    if (ticket.event.organizer.toString() !== organizerId) {
      return res.status(403).json({ message: 'Unauthorized to verify this ticket.' });
    }

    // Check if user exists
    const user = await User.findById(ticket.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    
    ticket.isVerified = true;
    await ticket.save();

    // Update events attendees 
    if (!ticket.event.attendees.includes(user._id)) {
      ticket.event.attendees.push(user._id);
      await ticket.event.save();
    }

    // Update users registered events (if not already present)
    if (!user.registeredEvents.includes(ticket.event._id)) {
      user.registeredEvents.push(ticket.event._id);
      await user.save();
    }

    res.status(200).json({ 
      message: 'Attendance verified successfully.',
      event: ticket.event.title,
      user: user.name
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to verify attendance', 
      error: error.message 
    });
  }
};

const getRegisteredEvents = async (req, res) => {
  const userId = req.user.userId;

  try {
    // populate registered events along with ticket details
    const user = await User.findById(userId).populate({
      path: 'registeredEvents',
      select: 'title date location ticketTiers', // only these fields
      populate: {
        path: '_id',
        model: 'Event' 
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the tickets of users registered events 
    const tickets = await Ticket.find({ user: userId }).populate('event', 'title date location ticketTiers');

    // Format response
    const registeredEventsWithPrices = tickets.map(ticket => ({
      eventId: ticket.event._id,
      title: ticket.event.title,
      date: ticket.event.date,
      location: ticket.event.location,
      tier: ticket.tier,
      price: ticket.price 
    }));

    res.status(200).json({ registeredEvents: registeredEventsWithPrices });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch registered events", error: error.message });
  }
};

const searchEvents = async (req, res) => {
  const userId = req.user.userId;
  const { search, location, type, fromDate, toDate } = req.query;

  try {
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Show public events + users own private events
    const baseFilter = {
      $or: [
        { type: 'public' },
        { type: 'private', organizer: userId }
      ]
    };

    const filterConditions = [baseFilter];

    // Search title or description
    if (search) {
      filterConditions.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Location filter
    if (location) {
      filterConditions.push({ location: { $regex: location, $options: 'i' } });
    }

    // Event type filter
    if (type && ['public', 'private'].includes(type.toLowerCase())) {
      filterConditions.push({ type: type.toLowerCase() });
    }

    // Date range filtering
    const dateFilter = {};
    if (fromDate && !isNaN(new Date(fromDate))) {
      dateFilter.$gte = new Date(fromDate);
    }
    if (toDate && !isNaN(new Date(toDate))) {
      dateFilter.$lte = new Date(toDate);
    }
    if (Object.keys(dateFilter).length > 0) {
      filterConditions.push({ date: dateFilter });
    }

    // Combine all conditions
    const finalFilter = filterConditions.length > 1 ? 
      { $and: filterConditions } : 
      baseFilter;

    const events = await Event.find(finalFilter)
      .populate('organizer', 'name email')
      .sort({ date: 1 }); // Sort by nearest date first

    res.status(200).json({ 
      message: 'Events retrieved successfully', 
      count: events.length,
      events 
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: 'Failed to search events', 
      error: error.message 
    });
  }
};






module.exports = {
  createEvent,
  getUserEvents,
  deleteEvent,
  updateEvent,
  verifyAttendance,
  registerEvent,
  getRegisteredEvents,
  searchEvents 

}
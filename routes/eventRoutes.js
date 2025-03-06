const express = require("express");
const {createEvent ,getUserEvents ,deleteEvent , updateEvent, registerEvent, verifyAttendance , getRegisteredEvents, searchEvents} = require('../controllers/eventController')
const router = express.Router();
const {authMiddleware} = require('../middleware/authentication')

router.post('/createEvent',authMiddleware,createEvent)
router.get('/getUserEvents',authMiddleware, getUserEvents)
router.delete('/deleteEvent/:eventId',authMiddleware, deleteEvent)
router.put('/updateEvent/:eventId',authMiddleware, updateEvent)
router.post('/registerEvent/:eventId',authMiddleware, registerEvent)
router.patch('/verify/:ticketId',authMiddleware, verifyAttendance)
router.get('/getRegisteredEvents',authMiddleware, getRegisteredEvents)
router.get('/search',authMiddleware,searchEvents)


module.exports = router;
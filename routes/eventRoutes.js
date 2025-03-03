const express = require("express");
const {createEvent ,getUserEvents ,deleteEvent , updateEvent, registerEvent, verifyAttendance} = require('../controllers/eventController')
const router = express.Router();
const {authMiddleware} = require('../middleware/authentication')

router.post('/createEvent',authMiddleware,createEvent)
router.get('/getUserEvents',authMiddleware, getUserEvents)
router.delete('/deleteEvent/:eventId',authMiddleware, deleteEvent)
router.put('/updateEvent/:eventId',authMiddleware, updateEvent)
router.post('/registerEvent/:eventId',authMiddleware, registerEvent)
router.patch('/verify/:ticketId',authMiddleware, verifyAttendance)
// router.post('/registerEvent/:id', registerEvent)
// router.get('/getuserEvents', getUserEvents)
// router.delete('/deleteEvents',deleteEvents)
// router.post('/updateEvents',updateEvents)
// router.post('/scan',authenticateUser,scan)


module.exports = router;
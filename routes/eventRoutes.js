const express = require("express");
const {createEvent ,getUserEvents} = require('../controllers/eventController')
const router = express.Router();
const {authMiddleware} = require('../middleware/authentication')

router.post('/createEvent',authMiddleware,createEvent)
router.get('/getUserEvents', getUserEvents)
// router.post('/registerEvent/:id', registerEvent)
// router.get('/getuserEvents', getUserEvents)
// router.delete('/deleteEvents',deleteEvents)
// router.post('/updateEvents',updateEvents)
// router.post('/scan',authenticateUser,scan)


module.exports = router;
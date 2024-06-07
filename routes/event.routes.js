const express = require('express');
const router = express.Router();

const eventController = require("../controllers/event.controller");


router.post('/create-event', eventController.createEvent);


router.put('/approve-or-disapprove-event/:eventId', eventController.approveEventAndAddToCalendar);

router.get('/approved-events', eventController.getAllApprovedEvents);

module.exports = router;

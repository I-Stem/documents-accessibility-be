const Event = require("../models/event.model")
// const { sendEmail } = require(); // Assuming you've organized your code this way
const { sendEmail } = require("../helpers/email-notifications")
const { google } = require('googleapis');
const httpStatusCodes = require("../constants/http-status-codes");
const { formResponse } = require("../helpers/response");
const calendar = google.calendar('v3');
const credentials = require("../helpers/google-credentials.json");
const angularBaseURL = process.env.ANGULAR_BASE_URL

exports.createEvent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      eventName,
      eventDate,
      eventTime,
      eventTimeZone,
      eventLocation,
      eventDescription,
      eventAccessibility,
      eventCategory,
      eventTargetAudience,
      eventLink,
      eventOrganizers,
      eventParticipation,
      eventCapacity,
      eventAdditionalInfo,
      userId
    } = req.body;

    const newEvent = new Event({
      name,
      email,
      phone,
      eventName,
      eventDate,
      eventTime,
      eventTimeZone,
      eventLocation,
      eventDescription,
      eventAccessibility,
      eventCategory,
      eventTargetAudience,
      eventLink,
      eventOrganizers,
      eventParticipation,
      eventCapacity,
      eventAdditionalInfo,
      userId // Add the userId to the event
    });
    
    const savedEvent = await newEvent.save();

    // Send email for approval
    const emailSubject = 'Event Approval Request';

    let html = '<!DOCTYPE html><body>'
    html += '<h1>A new event requires approval.</h1>'
    html += '<h1>User Details:</h1>' + name ? '<br> Name:' + name : ''
    html += email ? '<br> Email: ' + email : ''
    html += phone ? '<br> phone: ' + phone : ''
    html += '<h1>Event Details:</h1>' + eventName ? '<br> Event Name:' + eventName : ''
    html += eventDate ? '<br> Event Date:' + eventDate : ''
    html += eventTime ? '<br> Event Time:' + eventTime : ''
    html += eventTimeZone ? '<br> Event Time Zone:' + eventTimeZone : ''
    html += eventLocation ? '<br> Event Location:' + eventLocation : ''
    html += eventDescription ? '<br> Event Description:' + eventDescription : ''
    html += eventAccessibility ? '<br> Event Accessibility:' + eventAccessibility : ''
    html += eventCategory ? '<br> Event Category:' + eventCategory : ''
    html += eventTargetAudience ? '<br> Event Target Audience:' + eventTargetAudience : ''
    html += eventLink ? '<br> Event Link:' + eventLink : ''
    html += eventOrganizers ? '<br> Event Organizers:' + eventOrganizers : ''
    html += eventParticipation ? '<br> Event Participation:' + eventParticipation : ''
    html += eventAdditionalInfo ? '<br> Event Additional Information:' + eventAdditionalInfo : ''
    html += eventCapacity ? '<br> Event Capacity:' + eventCapacity : ''
    html += '<h1> Please click <a href="' + angularBaseURL + '/auth/approveOrDisapproveCalendarEvent/' + savedEvent._id + '/1">here</a> to approve the event:</h1></body></html>'
    await sendEmail(process.env.ADMIN_EMAIL, emailSubject, '', html);

    res.status(httpStatusCodes[201].code).json(formResponse(httpStatusCodes[201].code, savedEvent));
    console.log(savedEvent.eventDate)
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, {}));
  }
};

exports.getAllApprovedEvents = async (req, res) => {
  try {
    const approvedEvents = await Event.find({ approved: true }).exec();
    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, approvedEvents));
  } catch (error) {
    console.error('Error fetching approved events:', error);
    res.status(500).json({ error: 'An error occurred while fetching approved events.' });
  }
};


exports.approveEventAndAddToCalendar = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { approve } = req.body;
    console.log('Event ID:', eventId);
    console.log('Approve Flag:', approve);

    const event = await Event.findById(eventId); // Get the event

    if (!event) {
      console.log(`No event found with ID: ${eventId}`);
      return res.status(httpStatusCodes[404].code).json(formResponse(httpStatusCodes[404].code, {}));
    }

    // Update event approval status
    if (approve) {
      console.log('Event is approved. Adding to Google Calendar...');

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      const calendar = google.calendar('v3');
      const eventStartTime = new Date(event.eventDate);
      const eventTimeComponents = event.eventTime.split(':');
      eventStartTime.setUTCHours(parseInt(eventTimeComponents[0]), parseInt(eventTimeComponents[1]));

      // Calculate end time with a 1-hour gap
      const eventEndTime = new Date(eventStartTime.getTime() + 1 * 60 * 60 * 1000);

      const eventResource = {
        summary: event.eventName,
        location: event.eventLocation,
        description: `
        ${event.eventDescription}
    Contact Name:${event.name}
    Contact Email: ${event.email}
    Contact Phone: ${event.phone}
    event Accessibility:${event.eventAccessibility}
    event Category:${event.eventCategory}
    event Target Audience:${event.eventTargetAudience}
    eventCapacity:${event.eventCapacity}
    Event Link: ${event.eventLink}
    `,
        start: {
          dateTime: eventStartTime.toISOString(),
          timeZone: event.eventTimeZone, // Use event's timezone
        },
        end: {
          dateTime: eventEndTime.toISOString(),
          timeZone: event.eventTimeZone, // Use event's timezone
        },
      };

      const calendarResponse = await calendar.events.insert({
        auth,
        calendarId: 'contact@gnypwd.org',
        resource: eventResource,
      });

      event.googleCalendarEventId = calendarResponse.data.id;
      await event.save();

      console.log('Event added to Service Account\'s Google Calendar:', calendarResponse.data);
    } else {
      console.log('Event is disapproved.');

      if (event.approved) {
        console.log('Removing event from Google Calendar...');

        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/calendar'],
        });

        const calendar = google.calendar('v3');

        // Remove the event from Google Calendar using its event ID
        await calendar.events.delete({
          auth,
          calendarId: 'contact@gnypwd.org',
          eventId: event.googleCalendarEventId,
        });

        console.log('Event removed from Service Account\'s Google Calendar.');
      }
    }

    event.approved = approve; // Update event approval status
    await event.save();

    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `Event ${approve ? 'approved and added to' : 'disapproved and removed from'} Google Calendar.`));
  } catch (error) {
    console.error('Error approving event and adding to calendar:', error);
    res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, 'An error occurred while approving the event and adding to calendar.'));
  }
};

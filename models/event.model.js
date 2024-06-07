const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventTime: { type: String, required: true },
  eventTimeZone: { type: String, required: true },
  eventLocation: { type: String, required: true },
  eventDescription: { type: String, required: true },
  eventAccessibility: { type: String },
  eventCategory: { type: String, required: true },
  eventTargetAudience: { type: String, required: true },
  eventLink: { type: String },
  eventOrganizers: { type: String, required: true },
  eventParticipation: { type: String, required: true },
  eventCapacity: { type: String, required: true },
  eventAdditionalInfo: { type: String },
  approved: { type: Boolean, default: false },
  googleCalendarEventId: { type: String, default: null },
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: false },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

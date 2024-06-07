const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const sessionSchema = new mongoose.Schema({
    user_id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['system', 'assistant', 'user'],
          required: true
        },
        content: {
          type: String,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ]
  });

module.exports = mongoose.model("session", sessionSchema);   
const mongoose = require('mongoose');

const whatsappAutotagSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileLink: {
    type: String,
    required: true
  },
  resultFileLink: {
    type: String,
    required: false
  },
  resultFileLinkActive: {
    type: Boolean,
    required: false
  },
  docType: {
    type: String,
    required: true
  },
  format: {
    type: String,
    required: true
  },
  inputFileHash: {
    type: String,
    required: true
  }
}, {timestamps: true});

const WhatsappAutotag = mongoose.model('whatsapp_autotag', whatsappAutotagSchema);

module.exports = WhatsappAutotag;

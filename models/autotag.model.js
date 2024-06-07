const mongoose = require('mongoose');

const autotagPDFSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // Assuming you have a 'User' model
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
    required: false
  },
  outputFormat: {
    type: String,
    required: false
  },
  inputFileHash: {
    type: String,
    required: false
  }
}, {timestamps: true});

const AutotagPDF = mongoose.model('autotag_pdf', autotagPDFSchema);

module.exports = AutotagPDF;

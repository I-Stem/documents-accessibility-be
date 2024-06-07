const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Section schema
const sectionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    sectionNo: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: false
    },
    moduleId: {
        type: Schema.Types.ObjectId,
        ref: 'Module'
    }
});
module.exports = mongoose.model('Section', sectionSchema);
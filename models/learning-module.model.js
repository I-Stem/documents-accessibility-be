const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const moduleSchema = new Schema({

    moduleNo: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    },
    sections: [{
        type: Schema.Types.ObjectId,
        ref: 'Section'
    }]
});

module.exports = mongoose.model('Module', moduleSchema);

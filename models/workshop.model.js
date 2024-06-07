const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const workshopSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    pptLink: {
        type: String,
        required: true
    },
    videoLink: {
        type: String,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model("workshop", workshopSchema);   
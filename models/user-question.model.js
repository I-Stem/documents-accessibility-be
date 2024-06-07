const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userQuestionSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String],
    }
}, {timestamps: true});

module.exports = mongoose.model("user_question", userQuestionSchema);   
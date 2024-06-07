const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const authChallengeSchema = new Schema({
    challenge_type: {
        type: String,
        required: true,
        enum: ["mcq", "ca"]
    },
    challenge: {
        type: [Schema.Types.ObjectId],
        ref: "user_question"
    }
}, {timestamps: true});

module.exports = mongoose.model("auth_challenge", authChallengeSchema);   
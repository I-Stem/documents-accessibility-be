const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const authChallengeResponseSchema = new Schema({
    challenge: {
        type: Schema.Types.ObjectId,
        ref: "auth_challenge"
    },
    questions: {
        type: [Schema.Types.ObjectId],
        ref: "user_question"
    },
    responses: [String],
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"
    }, 
    group: {
        type: Schema.Types.ObjectId,
        ref: "social_group"
    }
}, {timestamps: true});

module.exports = mongoose.model("auth_challenge_response", authChallengeResponseSchema);   
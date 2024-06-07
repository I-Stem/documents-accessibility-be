const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const socialPostCommentSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: "social_post"
    },
    content: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    files: {
        type: [Schema.Types.ObjectId],
        ref: "user_file"
    },
    reply_to: {
        type: Schema.Types.ObjectId,
        ref: "social_post_comment"
    },
    reported: Boolean,
    reported_on: Date,
    blocked: Boolean,
    blocked_on: Date,
    blocked_by: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
}, {timestamps: true});

module.exports = mongoose.model("social_post_comment", socialPostCommentSchema);   
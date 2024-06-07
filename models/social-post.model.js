const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const socialPostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    post_type:{
        type: String,
        enum: ['GROUP_DISCUSSION','GROUP_ANNOUNCEMENT','PROJECT_DISCUSSION','PROJECT_ANNOUNCEMENT']
    },
    content: {
        type: String,
        required: true
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: "social_group"
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "project"
    },
    region: {
        type: Schema.Types.ObjectId,
        ref: "region"
    },
    theme: {
        type: Schema.Types.ObjectId,
        ref: "theme"
    },
    requested_on: Date,
    approved: {
        type: Boolean,
        default: false
    },
    approved_on: Date,
    approved_by: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    likes: {
        type: [Schema.Types.ObjectId],
        ref: "user"
    },
    files: [String],
    fileName: [String],
    reported: Boolean,
    reported_on: Date,
    blocked: Boolean,
    blocked_by: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    blocked_on: Date, 
}, { timestamps: true });

module.exports = mongoose.model("social_post", socialPostSchema);   
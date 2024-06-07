const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const projectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        required: true
    },
    files: {
        type: [Schema.Types.ObjectId],
        ref: "user_file"
    },
    members: {
        approved: {
            type: [Schema.Types.ObjectId],
            ref: "user"
        },
        pending: {
            type: [Schema.Types.ObjectId],
            ref: "user"
        }
    },
    discussions: {
        approved: {
            type: [Schema.Types.ObjectId],
            ref: "social_post"
        },
        pending: {
            type: [Schema.Types.ObjectId],
            ref: "social_post"
        }
    },
    announcements: {
        approved: {
            type: [Schema.Types.ObjectId],
            ref: "social_post"
        },
        pending: {
            type: [Schema.Types.ObjectId],
            ref: "social_post"
        }
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: "social_group"
    },
    auth_challenge: {
        type: Schema.Types.ObjectId,
        ref: "auth_challenge"
    },
    approved: {
        type: Boolean,
        default: false
    },
    approved_on: Date,
    approved_by: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
}, {timestamps: true});

module.exports = mongoose.model("project", projectSchema);   
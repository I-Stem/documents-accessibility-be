const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true,
        minlength: 8
    },
    mobile: {
        type: String,
        default: ""
    },
    profile_pic: {
        type: String,
        default: ""
    },
    shortBio: {
        type: String,
        default: ""
    },
    longBio: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    country: {
        type: Schema.Types.ObjectId,
        ref: "country",
        default: null
    },
    work_places: {
        type: [Schema.Types.ObjectId],
        ref: "region"
    },
    thematic_area: {
        type: [Schema.Types.ObjectId],
        ref: "theme"
    },
    education: [],
    experience: [],
    social_links: {
        fb: {
            type: String,
            default: ""
        },
        linkedin: {
            type: String,
            default: ""
        },
        instagram: {
            type: String,
            default: ""
        },
        twitter: {
            type: String,
            default: ""
        }
    },
    disability: {
        type: String,
        default: ""
    },
    disability_reason: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        default: "user"
    },
    last_login_date: {
        type: Date
    },
    groups: {
        approved: {
            type: [Schema.Types.ObjectId],
            ref: "social-group"
        }, //will store object having id,date,activity_date
        pending: {
            type: [Schema.Types.ObjectId],
            ref: "social-group"
        } //will store object having id,date,
    },
    projects: {
        approved: [], //will store object having id,date
        pending: [] //will store object having id,date
    },
    like_count: {
        type: Number,
        default: 0
    },
    post_count: {
        type: Number,
        default: 0
    },
    dob: {
        type: Number,
        default: null
    },
    chat_users: {
        type: [Schema.Types.ObjectId],
        ref: "user"
    },
    token: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema);
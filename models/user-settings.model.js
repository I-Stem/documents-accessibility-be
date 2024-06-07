const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const userSettingsSchema = new Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    PERSONAL_CHATS: {
        type: Boolean,
        default: false
    },
    POST_LIKES_AND_COMMENTS: {
        type: Boolean,
        default: false
    },
    GROUP_ANNOUNCEMENT: {
        type: Boolean,
        default: false
    },
    GROUP_DISCUSSION: {
        type: Boolean,
        default: false
    },
    PROJECT_ANNOUNCEMENT: {
        type: Boolean,
        default: false
    },
    PROJECT_DISCUSSION: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('user_settings', userSettingsSchema)

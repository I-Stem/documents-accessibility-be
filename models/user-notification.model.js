const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const userNotificationSchema = new Schema({

    notification_type: {
        type: String
    },
    users: [

        {
            user: { type: mongoose.Types.ObjectId, ref: 'user', },
            email: { type: String, },

        }

    ]

})

module.exports = mongoose.model('user_notification', userNotificationSchema)

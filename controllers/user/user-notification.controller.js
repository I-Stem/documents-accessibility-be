const user_notification = require('../../models/user-notification.model')
const user_settings = require('../../models/user-settings.model')

const { findById, findOneAndUpdate } = require('../../models/user-notification.model');
const { DataSync } = require('aws-sdk');
const { sendEmail } = require('../../helpers/email-notifications');


exports.sendBulkEmail = async (post_type) => {

    let result = await user_notification.findOne({ notification_type: post_type }, "users")
    let n = Object.keys(result.users).length

    let mailist = []

    for (let i = 0; i < n; i++) {
        mailist.push(result.users[i].email)

    }
    let str = post_type.replace(/_/, ' ')
    let subject = `New ${str}`
    let message = "Hi there is new message in one of your group"
    // console.log(mailist)
    sendEmail(mailist, subject, message)

}

exports.sendEmail = async (post_type, id) => {

    if (post_type === "PERSONAL_CHATS") {
        let subject = `New Messages!`
        let message = "Hi there is new message in one of your chats"
        let result = await user_settings.findOne({ user: id }).populate('user', 'email')

        let email = result.user.email
        if (result.PERSONAL_CHATS) {
            sendEmail(email, subject, message)
        }
        else {
            console.log("notifications turned off")
        }
    }
    else if (post_type === 'POST_LIKES_AND_COMMENTS') {
        let subject = `Post likes and Comments`
        let message = "Someone just liked or commented on your post!"
        let result = await user_settings.findOne({ user: id }).populate('user', 'email')
        // console.log(y)
        let email = result.user.email
        if (result.POST_LIKES_AND_COMMENTS) {
            sendEmail(email, subject, message)
        }
        else {
            console.log("notifications turned off")
        }
    }
}


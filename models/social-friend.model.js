const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const socialFriendSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    requested_on: Date,
    approved_on: Date
}, {timestamps: true});

module.exports = mongoose.model("social_friend", socialFriendSchema);   
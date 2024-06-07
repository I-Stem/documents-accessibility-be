const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userFriendSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    approved: {
        type: [Schema.Types.ObjectId],
        ref: "social_friend"
    },
    requests: {
        type: [Schema.Types.ObjectId],
        ref: "social_friend"
    },
    requested: {
        type: [Schema.Types.ObjectId],
        ref:"social_friend"
    }
}, {timestamps: true});

module.exports = mongoose.model("user_friend", userFriendSchema);   
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userGroupSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    approved: {
        type: [Schema.Types.ObjectId],
        ref: "social_group"
    },
    requested: {
        type: [Schema.Types.ObjectId],
        ref: "social_group"
    }
}, {timestamps: true});

module.exports = mongoose.model("user_group", userGroupSchema);   
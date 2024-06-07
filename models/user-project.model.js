const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userProjectSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    approved: {
        type: [Schema.Types.ObjectId],
        ref: "project"
    },
    requested: {
        type: [Schema.Types.ObjectId],
        ref: "project"
    },
}, {timestamps: true});

module.exports = mongoose.model("user_project", userProjectSchema);   
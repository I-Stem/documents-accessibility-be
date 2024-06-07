const mongoose = require("mongoose");
const { stringify } = require("uuid");
const Schema = mongoose.Schema;
const messageSchema = new Schema({ 
    sender: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    content: String,
    content_type: String,
}, {timestamps: true});

module.exports = mongoose.model("message", messageSchema);   
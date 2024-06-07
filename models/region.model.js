const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const regionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    country: {
        type: Schema.Types.ObjectId,
        ref: "country"
    }
}, {timestamps: true});

module.exports = mongoose.model("region", regionSchema);   
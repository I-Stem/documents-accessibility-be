const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const testSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    
    password: {
        type: String,
        required: true
    },
    
    contact: {
    
    phone: {
        type: Number,
    }
},
age: Number
}, {timestamps: true});

module.exports = mongoose.model("test", testSchema);   
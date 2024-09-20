const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Email schema
const emailSchema = new Schema({
    to: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
});

// Create the Email model
const Email = mongoose.model('Email', emailSchema);

module.exports = Email;

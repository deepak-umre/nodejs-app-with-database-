

// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true // Ensure usernames are unique
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Ensure passwords have a minimum length of 6
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
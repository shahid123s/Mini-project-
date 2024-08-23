const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        contact: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        is_admin: {
            type: Number,
            required: true
        },
    }
)

module.exports = mongoose.model('User', userSchema) 
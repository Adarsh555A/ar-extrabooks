const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,

    },
    image: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    is_online: {
        type: String,
        default: '0',
    },
    is_verified: {
        type: String,
        default: '0',
    }, blue_tick: {
        type: String,
        default: '0',
    }, token: {
        type: String,
        default: ''
    }, fcm_token: {
        type: String,
        default: ''
    },location: {
        type: String,
        default: 'undefined'
    },
    followers: [{ type: ObjectId, ref: "user" }],
    following: [{ type: ObjectId, ref: "user" }]

},
    { timestamps: true });
module.exports = mongoose.model('user', userSchema);

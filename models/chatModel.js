const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const chatSchema = new mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    message: {
        type: String,
        required: true,
    },
},
{timestamps: true});
module.exports = mongoose.model('chat', chatSchema);

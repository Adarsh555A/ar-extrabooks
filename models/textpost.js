const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const tpostSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
        
    },
    userid: {
        type: String,
        required: true,
    },
    username:{
        type: String,
        require: true
    },
    userimage:{
        type: String,
        required: true
    },
    like: [{type:ObjectId,ref:"user"}]
    
},
{timestamps: true});
module.exports = mongoose.model('Tpost', tpostSchema);

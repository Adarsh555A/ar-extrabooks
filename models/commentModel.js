const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
     userid: {
        type: String,
        required: true,
        
    },
    username: {
        type: String,
        required: true,
        
    },
    userimage: {
        type: String,
        required: true,
        
    },
    blogid: {
        type: String,
        required: true,
    },
    like: {
        type: String,
        default: '0',
    }
    
},
{timestamps: true});
module.exports = mongoose.model('comment', commentSchema);

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,

    },
    image: {
        type: String,
        required: true
    },
    userid: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    like: [{ type: ObjectId, ref: "user" }]

},
    { timestamps: true });
module.exports = mongoose.model('blog', blogSchema);

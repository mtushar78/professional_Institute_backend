const mongoose = require('mongoose');
const NoticeSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    file: {
        type: Array,
        default: [],
    },
    date: {
        type: String,
        defult: new Date().toString(),
    },
    history: {
        type: Array,
        default: []
    }

});
module.exports = notice = mongoose.model('Notice',NoticeSchema);
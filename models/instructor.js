const mongoose = require('mongoose');
const InstructorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNo: {
        type: String,
        required: true,
        unique: true
    },
    specialization: {
        type: String,
        required: true,
    },
    linkedin:{
        type: String,
    },
    image: {
        type: Array,
        default: [],
        require: true
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
module.exports = Instructor = mongoose.model('Instructor',InstructorSchema);
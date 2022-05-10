const mongoose = require('mongoose');
const CoursesSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    details: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    rating: {
        type: String,
        required: true,
    },
    course_label:{
        type: String,
    },
    category:{
        type: String,
        required: true,
    },
    files: {
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
module.exports = Courses = mongoose.model('Courses',CoursesSchema);
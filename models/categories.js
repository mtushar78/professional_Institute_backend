const mongoose = require('mongoose');
const CategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    children: {
        type: [Object],
        default:[]
    }

});
module.exports = Categories = mongoose.model('categories', CategorySchema);
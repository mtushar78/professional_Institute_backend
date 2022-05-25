const mongoose = require('mongoose');
const PartnerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
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
module.exports = partner = mongoose.model('partner',PartnerSchema);
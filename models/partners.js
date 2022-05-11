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
    history: {
        type: Array,
        default: []
    }

});
module.exports = partner = mongoose.model('partner',PartnerSchema);
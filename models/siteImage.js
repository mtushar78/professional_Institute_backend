const mongoose = require('mongoose');
const SiteSchema = mongoose.Schema({
    location: {
        type: String,
        required: true
    },
    file: {
        type: Array,
        default: [],
    },
    details: {
        type: String,
        default: ""
    },
    history: {
        type: Array,
        default: []
    }

});
module.exports = siteImage = mongoose.model('siteImage',SiteSchema);
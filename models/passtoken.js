const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
   isactive:{
       type: Boolean,
       required: true,
   }

},{ timestamps: true });
module.exports = User = mongoose.model('Passtoken',UserSchema);
const jwt = require('jsonwebtoken');
// const storeToken = require('../models/storeToken');
module.exports = async function (req, res, next) {
    //get token from header
    const token = req.header('x-auth-token');
    if(!token){
        return res.status(401).json({msg:'No token. Authentication denied'});
    }
    try {
        const decoded = jwt.decode(token,process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    }catch(error){
        return res.status(401).json({msg:'The token is not valid'});
    }
}
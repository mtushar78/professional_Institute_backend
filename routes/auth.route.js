const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const auth = require('../middleware/auth');
//user model
const User = require('../models/user');
const Passtoken = require('../models/passtoken');
const emailService = require('../services/emailService');



// @route  POST api/user/register
// @desc   Register user
// @access Public
router.post('/register', [
    //validation
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('phoneNo', 'Phone No. is required').isMobilePhone().isLength({
        min: 11,
        max: 14
    }),
    check('password', 'Enter a password with 6 or more length').isLength(
        {
            min: 6,
        }
    )
], async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({
            errors: error.array()
        })
    }
    const { name, phoneNo, email, password } = req.body;
    
    try {
        let user = await User.findOne({ email: email });
        console.log(user);
        if (user) {
            return res.status(400).json({
                error: {
                    msg: "User already exists"
                }
            })
        }
        const avatar = gravatar.url(email, {
            s: "200",
            r: "pg",
            d: "mm"
        })
        user = new User(
            { name: name, phoneNo: phoneNo, email: email, avatar: avatar, password: password }
        );
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        user.save(function (err, user) {
            if (err) {
                console.log(err.keyValue)
                if (err.keyValue.email !== undefined) {
                    return res.status(500).json("This email is already used.")
                } else {
                    return res.status(500).json("Unable to save in database.")
                }

            };
            console.log(user._id + " saved to user collection.");
            return res.status(201).json('User created successfully');
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json("Server Error")

    }
});

// @route  POST api/user/login
// @desc   Login user 
// @access Public
router.post('/login', [
    //validation
    check('email', 'email is required').isEmail(),
    check('password', 'Enter a password with 6 or more length').isLength(
        {
            min: 6,
        }
    )
], async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    console.log(req.body);
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({
            error: error.array()
        })
    }
    const { email, password } = req.body;
    let user = await User.findOne({ email: email });

    if (!user) {
        return res.status(400).json({
            msg: 'User does not exist'
        })
    }
    const bcryptpassword = await bcrypt.compare(password, user.password);
    if (!bcryptpassword) {
        return res.status(401).json({
            msg: 'Wrong password'
        })
    }
    user.password = undefined;
    const payload = {
        user: user
    }
    jwt.sign(payload,
        process.env.JWT_SECRET, {
        expiresIn: 360000
    }, (err, token) => {
        if (err) throw err;
        res.status(200).json({
            token: token
        });

    }
    );
})


router.get('/getAllUser', auth, async (req, res) => {

    console.log(req.params.string);
    const user = await User.find();

    console.log(user);
    return res.json(user);
});
router.post('/resetPassword', async (req, res) => {
    console.log(req.body);
    const email = req.body.email;
    let user = await User.findOne({ email: email });
    if (!user) {
        return res.status(400).json({
            msg: 'User does not exist'
        })
    }
    const payload = {
        email: email,
        date: new Date()
    }
    jwt.sign(payload,
        process.env.JWT_SECRET, {
        expiresIn: 360000
    }, (err, token) => {
        if (err) throw err;
        console.log(token);

        const passtoken = new Passtoken({
            email: email,
            token: token,
            isactive: true
        });
        // passtoken.save();
        passtoken.save(function (err, passtoken1) {
            if (err) {
                console.log(err);
                return res.status(500).json('Unable to save verification code.');
            };
            // console.log(passtoken1._id+" saved to passtoken collection.");
            emailService(req.body.email, passtoken1.token);
            return res.status(201).json('A verification email was sent to you.');
        });
    }
    );
});
router.post('/verifyConfirmationToken', async (req, res) => {
    console.log(req.body);
    try{
        Passtoken.find({ 'token': req.body.token,'isactive':true }).then(result => {
            if (result.length > 0) {
                return res.status(200).json({
                    email: result[0].email
                })
            }else{
                return res.status(403).json({error: "Invalid token"})
            }
        })
    }catch (error) {
        console.error(error);
        return res.status(500).json({error:"Internal Error DB I/O"})
    }
    
})
router.post('/resetPasswordConfirm', async (req, res) => {
    const email = req.body.email;
    let password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    console.log('encrypted password: ' + password);
    const x = await Passtoken.findOneAndUpdate({'email': email,'isactive':true },{$set: {'isactive': false}});
    console.log(x);
    User.findOneAndUpdate(
        { 'email': email },
        {$set:{ 'password': password }}      //updatePassword
    ).then((user) => {
        // if(err) {
        //     console.log('error: ' + err);
        //     return res.status(400).json({ msg: err })
        // }
        console.log('DB password: ' + user);
        return res.json({ msg: 'Password changed successfully!' })
    })
})



module.exports = router;
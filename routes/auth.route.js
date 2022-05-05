const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const auth = require('../middleware/auth');
//user model
const User = require('../models/user');



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
                }else{
                    return res.status(500).json("Unable to save in database.")
                }

            };
            console.log(user._id + " saved to user collection.");
            return res.status(201).json('User created successfully');
        });

        // const payload = {
        //     user: {
        //         id: user.id
        //     }
        // }
        // jwt.sign(payload, process.env.JWT_SECRET, {
        //     expiresIn: 36000
        // }, (err, token) => {
        //     if (err) throw err;
        //     res.status(200).json({
        //         msg: 'success',
        //         token: token
        //     })
        // })
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
})



module.exports = router;
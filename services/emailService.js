const nodemailer = require('nodemailer');

// Step 1
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,  // TODO: your gmail account
        pass: process.env.PASSWORD// TODO: your gmail password
    }
});
const sendEmail = async (to, token) => {
    console.log(to); 
    const text = "Click this link to reset your password: http://localhost:3000/resetPasswordConfirm/"+token;
    // Step 2
    let mailOptions = {
        from: process.env.EMAIL, // TODO: email sender
        to: to, // TODO: email receiver
        subject: 'Password reset',
        text: text
    };

    // Step 3

    transporter.sendMail(mailOptions, (err, data) => {
        console.log(data);
        if (err) {
            return 'failed';
        }
        return 'successful';
    });
}
module.exports = sendEmail;
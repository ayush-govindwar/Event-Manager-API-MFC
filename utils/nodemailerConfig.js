// module.exports = {
//   host: 'smtp.ethereal.email',
//   port: 587,
//   auth: {
//     user: 'tommie.schamberger92@ethereal.email',
//     pass: 'ayush123',
//   },
// };
//You create a transporter using nodemailer.createTransport(), passing in an object with SMTP settings.
//the above obj is passed in transporter nodemailer.createtransport(here)
// config/email.js
module.exports = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com', 
  port: process.env.EMAIL_PORT || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASSWORD, 
  },
};
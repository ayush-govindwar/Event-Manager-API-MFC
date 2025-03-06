
module.exports = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com', 
  port: process.env.EMAIL_PORT || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASSWORD, 
  },
};
const sendEmail = require('./sendEmail');

const sendUpdatesEmail = async ({
  name,
  email,
  eventTitle,
}) => {
  const message = `The event "${eventTitle}" has been updated. Please check the event details for the latest information.`;

  return sendEmail({
    to: email,
    subject: 'Event Updated',
    html: `<h4>Hello, ${name}</h4>
    <p>${message}</p>`,
  });
};

module.exports = sendUpdatesEmail;
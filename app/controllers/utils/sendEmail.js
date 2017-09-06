const nodemailer = require('nodemailer');
/**
 * This Module uses nodemailer transporter to send 
 * emails to users based on proirity
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});
const sendEmailInvite = function ( useremail, url ) {
  const mailOptions = {
    subject:'Invite to play a Game',
    from: 'El-rond Team',
    to: useremail,
    text: `Hey Pal, you wanna play a fun game?. click this link ${url}`,
    html: `So to join a game .\n
          Use this link <a href="${url}">${url}</a>`
  };
  transporter.sendMail(mailOptions, (err, msg) => {
    if (err) {
      console.log(err);
      return err;
    }
    return `Message ${msg.messageId} sent: ${msg.response}`;
  });
};
module.exports = sendEmailInvite;

// const emailOptions = {
//   subject: 'Hey Friend',
//   text: '',
//   from: 'postitbydanny@gmail.com'
// };
// module.exports = (emails, priority) => {
//   if (priority === 'Urgent' || priority === 'Critical') {
//     emails.forEach((email) => {
//       emailOptions.to = email;
//       transporter.sendMail(emailOptions, (error, info) => {
//         if (error) {
//           return console.log(error);
//         }
//         console.log(info.response);
//       });
//     });
//   }
// };

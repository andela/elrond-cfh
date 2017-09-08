const nodemailer = require('nodemailer');
/**
 * This Module uses nodemailer transporter to send 
 * emails to users
 * @param emails - Emails of Users
 
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});
const sendEmailInvite = (useremail, url) => {
  const mailOptions = {
    subject: 'Invite to play a Game',
    from: 'El-rond Team',
    to: useremail,
    text: `Hey Pal, you wanna play a fun game?. click this link ${url}`,
    html: `Hey buddy, Please come join me play a game, it Promises to be fun; click this link .\n
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
export default sendEmailInvite;

require('dotenv').config();
const nodeMailer = require('nodemailer');

async function sendMail(email, code, reset = false) {
  try {
    const smtpEndpoint = 'smtp.sendgrid.net';
    const port = 465;
    const senderAddress = 'TechSpiritSS techspiritss@duck.com';

    var toAddress = email;
    const smtpUsername = 'apikey';
    const smtpPassword = process.env.SG_APIKEY;
    let subject = 'Verify your Email';
    if (reset) subject = 'Reset your password';

    var bodyHTML = `<!DOCTYPE html>
        <html><head></head>
        <body>
        <p> Your authentication code is <b>  ${code} </b> </p>
        </body>
        </html>`;

    let transporter = nodeMailer.createTransport({
      host: smtpEndpoint,
      port: port,
      secure: true,
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
    });

    let mailOptions = {
      from: senderAddress,
      to: toAddress,
      subject: subject,
      html: bodyHTML,
    };

    let info = await transporter.sendMail(mailOptions);
    return {
      error: false,
    };
  } catch (error) {
    console.error('Error in sending mail', error);
    return {
      error: true,
      message: "Can't send the mail",
    };
  }
}

module.exports = { sendMail };

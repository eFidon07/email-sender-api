import nodemailer from "nodemailer";

class Mailer {
  #transporter;

  constructor(mailAuth) {
    this.#transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: mailAuth.email,
        pass: mailAuth.pass,
      },
    });
  }

  async sendMail({ mailFrom, mailTo, subject, text, html }) {
    try {
      // send mail with defined transport object
      const info = await this.#transporter.sendMail({
        from: `"noreply" <${mailFrom}>`, // sender address
        to: mailTo, // list of receivers
        subject, // Subject line
        text, // plain text body
        html, // html body
      });

      return {
        status: "success",
        message: "Message sent: " + info.messageId,
      };
    } catch (error) {
      console.log(error);
      return {
        status: "fail",
        message: error.message,
      };
    }
  }
}

const mailer = (mailAuth) => new Mailer(mailAuth);
export default mailer;

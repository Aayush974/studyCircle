import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";

//setting up nodemail transporter
const transporter = nodemailer.createTransport({
  host: "smtp.mailgun.org",
  port: 587, // port 587 and secure false is a standard approach
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER, // i am using a snadbox domain so the emails will most likely be forwarded to spam folder
    pass: process.env.NODEMAILER_PASS,
  },
});

const sendMail = async function (recipientMail, link) {
  try {
    await transporter.verify();
    const info = await transporter.sendMail({
      from: "practicem629@gmail.com",
      to: recipientMail,
      subject: "email verification",
      text: `this is an email to verify your account at studyCircle\n click on this link \n ${link} \n if you did not request a verification please disregrad it`,
    });
    return info;
  } catch (error) {
    console.error("Nodemailer error", {
      message: error.message,
      statusCode: error.code,
      response: error.response,
      stack: error.stack,
    });
    let message = "failed to send email verification";
    if (error.code == "EENVELOPE") message = "Invalid recipient email address.";
    if (error.code == "EAUTH") message = "email authentication failed";
    throw new ApiError(502, message); // sending a default error code of 500 since nodemailer error codes are string as shown above
  }
};

export default sendMail;

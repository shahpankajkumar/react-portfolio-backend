const express = require("express");
const nodemailer = require("nodemailer");
const axios = require("axios");
const router = express.Router();
const Email = require("../models/Email");
const cors = require("cors");

// CORS configuration
const allowedOrigins = [
  "https://pankaj-shah.vercel.app",
  "http://localhost:3000",
];
router.use(
  cors({
    origin: function (origin, callback) {
      // allow requests from the specified domains
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

require("dotenv").config();

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST, //smtp.gmail.com
  port: process.env.MAIL_PORT,

  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

// API endpoint for sending emails
router.post("/send-email", async (req, res) => {
  const { name, email, text, recaptchaToken } = req.body;

  // Define email text
  const textData = `Name: ${name}\nEmail: ${email}\n\n${text}`;
  const subject = "Pankaj Shah - Portfolio Contact";

  // Define email options
  const mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS,
    subject: subject,
    text: textData,
    to: process.env.MAIL_FROM_ADDRESS,
    sender: process.env.MAIL_FROM_ADDRESS,
  };

  try {
    // Verify reCAPTCHA token with Google's API
    const secretKey = process.env.RECAPTCHA_SECRET_KEY_V2; // Your reCAPTCHA secret key from Google

    const response = await verifyRecaptcha(secretKey, recaptchaToken);

    if (response.success) {
      // If reCAPTCHA verification is successful
      console.log("reCAPTCHA verified successfully");

      // Send email
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).send("Error sending email");
        } else {
          console.log("Email sent: " + info.response);

          // Save email details in MongoDB
          try {
            const email_data = new Email({
              to: email,
              subject: subject,
              text: textData,
            });
            await email_data.save();
            console.log("Email details saved to MongoDB");
            res.status(200).send("Email sent and saved successfully");
          } catch (err) {
            console.error("Error saving email to MongoDB", err);
            res.status(500).send("Email sent but error saving to MongoDB");
          }
        }
      });

    } else {
      // reCAPTCHA verification failed
      return res
        .status(400)
        .json({
          message: "reCAPTCHA verification failed",
          response: response,
        });
    }
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Verify reCAPTCHA token with Google's API
async function verifyRecaptcha(secretKey, recaptchaToken) {
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: recaptchaToken,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    throw error;
  }
}

module.exports = router;


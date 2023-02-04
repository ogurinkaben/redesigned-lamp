// Import Express
const express = require("express");
const app = express();
// Add cors
const cors = require("cors")({ origin: true });
// Import Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Morgan
const morgan = require("morgan");
app.use(morgan("dev"));
// dotenv
require("dotenv").config();

app.get("/", (req, res) => {
  res.json({
    status: 200,
    message: "Api running",
  });
});
function sendSms(phone, message) {
  return new Promise(async (resolve, reject) => {
    const accountSid = process.env.SID;
    const authToken = process.env.AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);
    client.messages
      .create({
        body: message,
        from: process.env.TWILIO_NUMBER,
        to: phone,
      })
      .then((message) => {
        resolve({
          success: true,
          message: "OTP sent successfully",
        });
      })
      .catch((err) => {
        reject(err.message);
      });
  });
}
app.post("/send-sms", (req, res) => {
  try {
    const number = req.body.number;
    const message = `Hello. We have received your booking and we are on our way. Call 09022618844 to get real-time updates on our location`;
    console.log(number);
    sendSms(number, message)
      .then((xx) => {
        console.log(xx);
        res.json({
          status: 200,
          message: "message sent",
        });
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  } catch (error) {
    res.json(error);
  }
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running at port http://localhost:${port}`);
});

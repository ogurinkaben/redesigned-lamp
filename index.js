// Import Express
const express = require("express");
const app = express();
// Add cors
const cors = require("cors")({ origin: true });
app.use(cors);
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
// format phone number to be like '2348162099369'
function formatNigerianPhoneNumber(phoneNumber) {
  // Remove all non-numeric characters from the input phone number
  phoneNumber = phoneNumber.replace(/\D/g, '');

  // Check if the input phone number has a length of 11 digits, 10 digits, 13 digits, or 14 digits
  if (phoneNumber.length === 11) {
    // Remove the first digit (which must be a zero)
    phoneNumber = phoneNumber.substr(1);
  } else if (phoneNumber.length !== 10 && phoneNumber.length !== 13) {
     return false;
  }

  // Check if the input phone number already has a 234 or +234 prefix
  if (phoneNumber.startsWith("234")) {
    phoneNumber = phoneNumber.substr(3);
  } else if (phoneNumber.startsWith("+234")) {
    phoneNumber = phoneNumber.substr(4);
  }

  // Add the Nigerian country code (234) to the beginning of the input phone number
  phoneNumber = "234" + phoneNumber;

  return phoneNumber;
}



app.post("/send-sms", (req, res) => {
  try {
    
    const phoneNumber = req.body.number;
    
    if(!phoneNumber){
      res.json({
        status: 400,
        message: 'phone number cannot be empty'
      })
    }
      
    const number = formatNigerianPhoneNumber(phoneNumber);
    if(!number){
      res.json({
       status: 400,
       message: 'Not a valid phone number'
      })
    }
      
    const confirm = req.body.confirm;
    let message;
    if (confirm) {
      message = `Hello. We have received your booking and we are on our way. Call 08104459237 to get real-time updates on our location`;
    } else {
      message = `Oops. Your order has been cancelled`;
    }
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

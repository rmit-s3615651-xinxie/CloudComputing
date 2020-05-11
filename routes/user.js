const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const request = require("request");
const withAuth = require("../middileware/auth");
const { User, validateRegister, validateChange } = require("../models/user");
// Import the AWS SDK
const AWS = require('aws-sdk');

// Configure the region
AWS.config.update({region: 'us-east-1'});

// Create an SQS service object
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const queueUrl = "https://sqs.us-east-1.amazonaws.com/303732725473/email-queue";

//TODO: For real application, should keep this secret an actual secret
//using environment variables or some other method and make sure you
//DO NOT commit it to version control if you happen to be using git
const secret = "This is a secret String";

//find a user with the given username and verify that the given
//password is correct. If the password is correct, we will issue
//a signed token to the requester.
router.get("/login", function(req, res) {
  res.render("login.html");
});
router.get("/register", function(req, res) {
  res.render("register.html");
});
router.post("/login", function(req, res) {
  const { email, password } = req.body;
  User.findOne({ email }, function(err, user) {
    if (err) {
      console.log(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else if (!user) {
      res.status(401).json({
        error: "Incorrect username or password"
      });
    } else {
      user.isCorrectPassword(password, function(err, same) {
        if (err) {
          res.status(500).json({
            error: "Internal error please try again"
          });
        } else if (!same) {
          res.status(401).json({
            error: "Incorrect username or password"
          });
        } else {
          //Issue token
          const { firstName, lastName, _id } = user;
          const payload = { email, firstName, lastName, _id };
          const token = jwt.sign(payload, secret, {
            expiresIn: "2h"
          });
          res.cookie("token", token, { httpOnly: true }).redirect("/earth");
        }
      });
    }
  });
});

router.post("/register", async (req, res) => {
  try {
    // g-recaptcha-response is the key that browser will generate upon form submit.
    // if its blank or null means user has not selected the captcha, so return the error.
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
    }
    // Put your secret key here.
    const secretKey = "6LcAs_IUAAAAAGsloWxfe3Kde2jsTbADm9Qy-IKW";
    // req.connection.remoteAddress will provide IP address of connected user.
    const verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    // Hitting GET request to the URL, Google will respond with success or error scenario.
    request(verificationUrl, async function(error,response,body) {
      body = JSON.parse(body);
      console.log(body);
      // Success will be true or false depending upon captcha validation.
      if(body.success !== undefined && !body.success) {
        res.status(500).send("You are a bot");
      }

      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
      });
      await user.save();

      // Sending message to SQS
      let regData = {
        'email': user.email,
        'firstName': user.firstName,
        'lastName': user.lastName
      }

      let sqsData = {
        MessageBody: JSON.stringify(regData),
        QueueUrl: queueUrl
      };

      // Send the order data to the SQS queue
      let sendSqsMessage = sqs.sendMessage(sqsData).promise();

      sendSqsMessage.then((data) => {
        console.log(`RegSvc | SUCCESS: ${data.MessageId}`);
      }).catch((err) => {
        console.log(`RegSvc | ERROR: ${err}`);
      });
      //Issue token
      const { firstName, lastName, email, _id } = user;
      const payload = { email, firstName, lastName, _id };
      const token = jwt.sign(payload, secret, {
        expiresIn: "2h"
      });
      res.cookie("token", token, { httpOnly: true }).redirect("/earth");

    });

  } catch (ex) {
    console.log(ex.errors);
    res.status(500).send(ex.message);
  }
});

module.exports = router;

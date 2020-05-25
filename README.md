# Cloud Computing Assignment2

RMIT university 2020

## Getting Started
- SSH to EC2 instance
```
ssh -i /path/my-key-pair.pem ec2-user@s3615651.mywire.org
```
- Start web service
```
> screen
> cd CloudComputingAssign2/
> npm install; $ npm start
# CTRL A -> CTRL D to quite current sreen and let dev server remain running
```
- Stop web service
```
> sreen -r // resume running session
# CTRL + C to stop server 
```

- S3 mount point
```
# S3 bucket is mounted locally here /home/ec2-user/Cloud
s3fs cloudcomputingdir -o use_cache=/tmp -o multireq_max=5 -o endpoint="ap-southeast-2" -o passwd_file=passwd-s3fs -o umask=0007,uid=$UID -o url=https://s3-ap-southeast-2.amazonaws.com /home/ec2-user/Cloud
# make a symbolic link to data folder of web service /home/ec2-user/CloudComutingAssign2/views/data
> ln -s /home/ec2-user/Cloud/data /home/ec2-user/CloudComutingAssign2/views/data
```

### Prerequisites

Node.js
npm cli

### Demo Link

http://s3615651.mywire.org:8080/

### Email-Service (AWS Lambda)
[email-service](email-lambda/email-service/handler.js)
This service utilizes [Serverless Framework](https://www.serverless.com/) for deployment.
- Usage
  ````
  // Replace these with a valid AWS credential
  accessKeyId : AWS_ACCESS_KEY_ID ,
  secretAccessKey : AWS_SECRET_KEY,
  ````
- Deploy
  ```
  > sls deploy
  ```
- Sending Greeting Email via SES
  ```
  Lambda function is triggered when it message is send to SQS queue
  each message is considered as a record with user registration data as json in message body
  event.Records.forEach(record => {
      const obj = JSON.parse(record.body);
      let mailOptions = {
          from: 'xiexin19900204@163.com',
          to: obj.email,
          subject: 'Greeting', // Subject line
          html: `<p>Hi ${obj.firstName} ${obj.lastName} Welcome to Global Wing Map</p>` // html body
      };
      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
          console.log("Sending email");
          if(error){
              console.log(error);
          }else{
              console.log('Message sent: ' + info);
          }
      });
  });

  ``` 
### Weather Data Sync (Cronjob)
[Data-Syncer](views/libs/getTodayData.sh)
This cronjob gets weather data from NOMADS periodically and translate format from grib to json format.
It also stores json file to a local folder that store the weather data for web.

### User Auth
Authentication uses a MongoDb for storing user data.
- DB Configuration:
  [dev-server.js](dev-server.js)
  ```
  # Replace DB Connection String
  const url = "mongodb://username:password@db_url";
  ```
  
### User Registration (Front end)
User registration page: [register](views/register.html)
It send a POST request to [user auth endpoint](routes/user.js) when user clicked submit button.
- reCaptcha   
  ```
  // Include google api url
  <script src="https://www.google.com/recaptcha/api.js" async defer></script>
  ```
  ```
  // config data-site key that obtained from GCP
  <div class="g-recaptcha" data-sitekey="6LcAs_IUAAAAAPmvmQPQuJPvGEvvlsOTXbnAc3LG"></div>
  <br/>
  <button type="submit" class="btn btn-primary mx-auto">
    Sign Up
  </button>
  ```

### User Registration (Back end)
[User Auth](routes/user.js)
It handles request from user registration form.
- reCaptcha - The following code takes reCaptcha code from the body and post it to Google reCaptcha API url for validation. 
  
  ```
  // g-recaptcha-response is the key that browser will generate upon form submit.
  // if its blank or null means user has not selected the captcha, so return the error.
  if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
  }
  // Put your secret key here.
  const secretKey = RECAPTCHA_SECRET_KEY;
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
  ```

- SQS Message
  - Configuration
  ```
  // Replace SQS_QUEUE_URL
  const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
  const queueUrl = SQS_QUEUE_URL;
  ```
  - Sending Message to SQS Queue - The code below shows the way to send json data to sqs queue
  ```
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
  
  // Send the data to the SQS queue
  let sendSqsMessage = sqs.sendMessage(sqsData).promise();
  
  sendSqsMessage.then((data) => {
    console.log(`RegSvc | SUCCESS: ${data.MessageId}`);
  }).catch((err) => {
    console.log(`RegSvc | ERROR: ${err}`);
  });
  ```
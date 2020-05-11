'use strict';

var nodemailer = require('nodemailer');
var sesTransport = require('nodemailer-ses-transport');

module.exports.handler = (event) => {
    // TODO implement
    var SESCREDENTIALS = {
        accessKeyId : "AKIAUNN7BS3Q6XPWBERD" ,
        secretAccessKey : "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",
        region: "ap-southeast-2"
    };

    var transporter = nodemailer.createTransport(sesTransport({
        accessKeyId: SESCREDENTIALS.accessKeyId,
        secretAccessKey: SESCREDENTIALS.secretAccessKey,
        rateLimit: 5,
        region: "ap-southeast-2"
    }));

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

};

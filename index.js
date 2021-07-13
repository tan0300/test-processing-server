var request = require('request');
require('dotenv').config();
var fs = require('fs');
const sgMail = require('@sendgrid/mail');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

let url = "http://ec2-3-17-181-179.us-easst-2.compute.amazonaws.com/media/process";

let formData = {
  
  fileName: 'test.mp4',
  callbackData: JSON.stringify({delayResponse : true}),
  file: fs.createReadStream(__dirname + "/test.mp4")
}

var req = request.post({url: url, formData}, function (err, resp, body) {
  if (err) {
    console.log(err)
    console.log('Error!');
    sendText();
    sendEmail();
  } else {
    console.log('good');
  }
});

function sendText()
{ 
  let phone_numbers = process.env.PHONE_NUMBERS.split(",");
  for(var i = 0; i < phone_numbers.length; i++) {
    client.messages
    .create({
      body: 'This is system generated message from Sapphire Apps. The processing server is down.',
      from: process.env.PHONE_NUMBER_FROM,
      to: phone_numbers[i]
    })
    .then(message => console.log(message.sid));
  }
}

function sendEmail() {
  
  let emails = process.env.EMAILS.split(",");
  
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  for(var i = 0; i < emails.length; i++) {
    const msg = {
      to: emails[i],
      from: process.env.EMAIL_FROM, // Use the email address or domain you verified above
      subject: 'The processing server is down.',
      text: 'The processing server is down',
      html: '<strong>The processing server is down.</strong>',
    };
    //ES6
    sgMail
    .send(msg)
    .then(() => {
      console.log('Email Sent!');
    }, error => {
      console.error(error);
      
      if (error.response) {
        console.error(error.response.body)
      }
    });
    
    //ES8
    (async () => {
      try {
        await sgMail.send(msg);
      } catch (error) {
        console.error(error);
        
        if (error.response) {
          console.error(error.response.body)
        }
      }
    })();
  }
}
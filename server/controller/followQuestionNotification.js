'use strict';
const nodemailer = require('nodemailer');
const EventEmitter = require('events');

const mailEmitter = new EventEmitter();

let sendMail = function(result){
// create reusable transporter object using the default SMTP transport
var receiver = result[0].receiver;
var question = result[0].question;
var answered_by = result[0].answered_by;
console.log(receiver,question);
let transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com", // hostname
  secureConnection: false, // TLS requires secureConnection to be false
  port: 587, // port for secure SMTP
  tls: {
     ciphers:'SSLv3'
  },
  auth: {
      user: 'aprabhu1994@outlook.com',
      pass: 'Pra6$bhua'
  }
});


mailEmitter.on('sendmail',data=>{
    // setup email data with unicode symbols
    let mailOptions = {
        from: "aprabhu1994@outlook.com" , // sender address
        to: data.to,
        subject: data.subject, // Subject line
        text: data.text, // plain text body
        html: data.html, // html body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', JSON.stringify(info));
    });
});

let send = (options)=>{
    mailEmitter.emit('sendmail',options)
};

send({
	to:receiver,
	subject:'Answer for your followed question',
  html:'<center><h1>Welcome to Quest</h1></center><br>'+
                    'Hi,<br><br>Answer has been posted for your followed question.'+
                    '<p style=text-transform:capitalize;'+
                    '><b>'+question+'?'+'</b></p><br>'+'<p> by '+'<b>'+answered_by+'</b>'+'<br>'+
                    '<i>This is an Auto-generated mail,'+
                    'please do not reply</i>'
});
}
module.exports = sendMail;

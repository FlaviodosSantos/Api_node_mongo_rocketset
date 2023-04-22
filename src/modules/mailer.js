const path = require('path')
const nodemailer =  require('nodemailer')
const hbs = require('nodemailer-express-handlebars')

//configurando para o gmail
const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com', //servidor do yahoo
    port: 465, //porta smtp
    secure: true, //true para porta 465, false para outras
    auth: {
        user: 'softsflavio@gmail.com', //seu email da gmail
        pass: 'lrwezyhyuqxottdd',//sua senha do app gerada pelo yahoo
    },
    tls: {
        rejectUnauthorized: false //fix de bug de envio
    }
});


/**const { host, port, user, pass } = require('../config/mail.json')

const transport = nodemailer.createTransport({
  host,
  port,
  auth: { user, pass },
});
/**
 * transport.use('compile', hbs({
    viewEngine: 'handlebars',
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html',
}))
 */
const handlebarOptions = {
  viewEngine: {
    extName: '.html',
    partialsDir: path.resolve('./src/resources/mail/'),
    layoutsDir: path.resolve('./src/resources/mail/'),
    defaultLayout: null,
},
  viewPath: path.resolve('./src/resources/mail/'),
  extName: '.html'
};

transport.use('compile', hbs(handlebarOptions));

module.exports = transport;
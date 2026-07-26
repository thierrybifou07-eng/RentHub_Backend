import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false, // true for 465, false for other ports
    tls: {
        rejectUnauthorized: false
    }
});

export default transport;
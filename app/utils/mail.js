//app/utils/mail.js
import nodemailer from "nodemailer";

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("❌ SMTP_USER or SMTP_PASS is missing in .env");
}

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com", // or your SMTP host
    port: 587, // or your SMTP port
    secure: false,
    auth: {
        user: process.env.SMTP_USER, // your SMTP username
        pass: process.env.SMTP_PASS, // your SMTP password
    },
    tls: {
        rejectUnauthorized: false // Allows self-signed certificates (optional)
    }
});

export async function sendQuoteMail({ to, subject, html }) {
    const mailOptions = {
        from: `"Promo ForBusiness" <hello@promoforbusiness.com>`,
        to,
        subject,
        html,
    };

    // console.log("📧 SMTP config:", {
    //     user: process.env.SMTP_USER,
    //     pass: !!process.env.SMTP_PASS,
    //     host: "smtp-relay.brevo.com",
    //     port: 587,
    // });
    // console.log("📧 Sending mail with options:", mailOptions);

    try {
        const info = await transporter.sendMail(mailOptions);
        // console.log("📧 Mail sent info:", info);
        return info;
    } catch (error) {
        console.error("❌ Mail sending error:", error);
        throw error;
    }
}

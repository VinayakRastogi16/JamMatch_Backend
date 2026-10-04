import dotenv from "dotenv";
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_APP_PASSWORD
    }
})

const sendVerificationEmail = async ({email, username, verificationToken})=>{
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    return transporter.sendMail({
        from:`JamMatch <${process.env.EMAIL_USER}>`,
        to:email,
        subject:"Verify your JamMatch Account!",
        html:`
            <div>
                <h2>Welcome to JamMatch, ${username}! 🎸</h2>

                <p>Please verify your email address to complete your account setup.</p>

                <a href ="${verificationURL}">Verify my email!</a>

                <p>This verification link will expire in 30 minutes.</p>
            </div>
        `
    });
}

export const sendMatchEmail = async ({email, username, senderName})=>{
    return transporter.sendMail({
        from: `JamMatch <${process.env.EMAIL_USER}>`,
        to: email,
        subject:"You have a new match on JamMatch!",
        html:`
            <div>
                <h2>It's a match, ${username}!</h2>

                <p>You matched with <strong>${senderName}</strong>.</p>

                <p>
                    Open JamMatch and start making music together.
                </p>
            </div>
        `,
    });

}

export const sendMessageEmail = async ({email, username, senderName})=>{
    return transporter.sendMail({
        from: `JamMatch <${process.env.EMAIL_USER}>`,
        to: email,
        subject:"You have a new message on JamMatch!",
        html:`
            <div>
                <h2>New message, ${username}! ✉️</h2>

                <p><strong>${senderName}</strong> Sent you a message on JamMatch.</p>

                <p>
                    Open JamMatch to view the message and continue the conversation.
                </p>
            </div>
        `,
    });

}

export default sendVerificationEmail;
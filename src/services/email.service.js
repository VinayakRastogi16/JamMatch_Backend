import {Resend} from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async ({email, username, verificationToken})=>{
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const {data, e} = await resend.emails.send({
        from:process.env.EMAIL_FROM,
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

    if(e){
        throw new Error(e.message);
    }

    return data;
}


export default sendVerificationEmail;
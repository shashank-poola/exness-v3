import express from 'express';
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';

dotenv.config();

const app = express()
const JWT_TOKEN = "secret"

app.use(express.json())
;

app.use(cookieParser())
app.post("/api/v1/signup", async (req, res) => {
    const { email } = req.body

    if (!email) {
        res.status(404).json({
            message: "email not found"
        })
        return
    }

    const token = jwt.sign(email, JWT_TOKEN)
    const link = `http://localhost:8000/token=${token}`
    try {

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "shashankpoola123@gmail.com",
                pass: "blga tlbb jkkq aung",
            },
        });


        const info = await transporter.sendMail({
            from: '"S30" <shashankpoola123@gmail.com>',
            to: email,
            subject: "super30-contest ✔",
            text: "Hello world?",
            html: `<b>Please sign in?</b> ${link}`,
        });

        console.log("Message sent:", info.messageId);

        return res.status(200).json({
            message: "Signup email sent successfully",
            link,
        })

    } catch (error) {
        console.log(error)
    }

})

app.get("/token=:token", async (req, res) => {
    const { token } = req.params

    if (!token) {
        res.status(403).json({
            message: "token not found"
        })
        return
    }

    const decode = jwt.verify(token, JWT_TOKEN)
    if (!decode) {
        res.status(405).json({
            message: "login unsucessfull"
        })
    }
    
    res.cookie("auth",token,{
        httpOnly:true
    })
    res.status(200).json({
        message:"login successfull",
        user:decode
    })
})

app.listen(8000, () => {
    console.log(`server is running on 8000`)
})
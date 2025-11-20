import dbClient from '@exness-v3/db';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';

import { createUserInEngine } from '../services/engine.service';
import { sendEmail } from '../utils';
import { signupSchema } from '../validations/signupSchema';

export async function signupHandler(req: Request, res: Response) {
  try {
    const { success, data, error } = signupSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({ error: error.flatten().fieldErrors });
    }

    const { email } = data;
    const token = jwt.sign(data, process.env.JWT_SECRET!, {
      expiresIn: '5m',
    });

    let user = await dbClient.user.findFirst({
      where: {
        email,
      },
    });
    console.log(user);
    if (!user) {
      console.log('in not user');
      user = await dbClient.user.create({
        data: {
          email: email,
          lastLoggedIn: new Date(),
          balance: 5000,
        },
      });
    }
    createUserInEngine(user);

    if (process.env.NODE_ENV === 'production') {
      const { error } = await sendEmail(email, token);
      if (error) {
        res.status(400).json({ error });
      }
    } else {
      const url =
        process.env.API_BASE_URL + '/auth/signin/verify?token=' + token;
      console.log(url);
    }

    res.status(201).json({ message: 'Email Sent' });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: 'Interal server error' });
  }
}

export async function signInVerify(req: Request, res: Response) {
  try {
    console.log('in signInVerify');
    const token = req.query.token?.toString();

    if (!token) {
      console.log('Token not found');
      res.status(400).json({
        message: 'Verification token not found in params',
      });
      return;
    }
    console.log('token', token);
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
    console.log('decodedToken', decodedToken);
    if (!decodedToken) {
      res.status(400).json({ message: 'Invalid token' });
      return;
    }

    const { email } = decodedToken as { email: string };

    const sessionToken = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: '2d',
    });

    res.cookie('token', sessionToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      domain: '.localhost',
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });
    console.log('in signInVerify redirect');
    res.redirect(process.env.CORS_ORIGIN! + '/trade');
    // res.status(200).json({ message: 'Login successful' });
    // res.redirect("http://localhost:3000/trade");
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: 'Interal server error' });
  }
}
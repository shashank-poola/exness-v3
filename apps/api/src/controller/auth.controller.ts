import dbClient from '@exness-v3/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { createUserInEngine } from '../services/engine.service.js';
import { signupSchema } from '../validations/signupSchema.js';

export async function signupHandler(req: Request, res: Response) {
  try {
    const parsed = signupSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { email, password } = parsed.data;

    const existing = await dbClient.user.findFirst({
      where: { email }
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: null,
        error: "USER_ALREADY_EXISTS"
        })
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await dbClient.user.create({
      data: {
        email,
        password: hashedPassword,
        balance: 10000,
        lastLoggedIn: new Date(),
      },
      select: { id: true, email: true, balance: true, password: true, lastLoggedIn: true },
    });

    createUserInEngine(user);

    const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: '2d',
    });

    return res.status(201).json({
      success: true,
      message: 'SIGNUP_SUCCESSFULL',
      token,
      user: {
        email: user.email,
        balance: user.balance,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: null,
      error: 'INTERNAL_SERVER_ERROR' 
     })
    return;
  }
}

export async function signInVerify(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: null,
        error: "EMAIL_AND_PASSWORD_REQUIRED",
      })
      return;
    }

    const user = await dbClient.user.findFirst({
      where: { email },
      select: { 
        id: true, 
        email: true, 
        password: true, 
        balance: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await dbClient.user.update({
      where: { id: user.id },
      data: { lastLoggedIn: new Date() },
    });

    const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: '2d',
    });

    return res.status(200).json({
      success: true,
      message: 'LOGIN_SUCCESSFUL',
      token,
      user: {
        email: user.email,
        balance: user.balance,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: true,
      message: null,
      error: 'INTERNAL_SERVER_ERROR' 
    })
    return;
  }
}

export async function getMeHandler(req: Request, res: Response) {
  try {
    const email = req.user;
    const user = await dbClient.user.findFirst({
      where: { email: email as string },
      select: { id: true, email: true, balance: true },
    });

    if (!user) {
      res.status(404).json({ 
        success: false,
        message: null,
        error: 'USER_NOT_FOUND' 
      })
      return;
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      balance: user.balance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: null,
      error: 'INTERNAL_SERVER_ERROR',
    })
  } return;
}
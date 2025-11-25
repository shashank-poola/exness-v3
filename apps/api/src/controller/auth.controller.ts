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

    // Check existing user by email only
    const existing = await dbClient.user.findFirst({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await dbClient.user.create({
      data: {
        email,
        password: hashedPassword,
        balance: 5000,
        lastLoggedIn: new Date(),
      },
      select: { id: true, email: true, balance: true, password: true },
    });

    // Optional internal service
    createUserInEngine(user);

    // Issue JWT (return in response body, NOT cookies)
    const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: '2d',
    });

    return res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        email: user.email,
        balance: user.balance,
      },
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}


// -------------------- SIGNIN --------------------

export async function signInVerify(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Fetch user with balance for validation and response
    const user = await dbClient.user.findFirst({
      where: { email },
      select: { id: true, email: true, password: true, balance: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update login timestamp
    await dbClient.user.update({
      where: { id: user.id },
      data: { lastLoggedIn: new Date() },
    });

    // Generate token
    const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: '2d',
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        email: user.email,
        balance: user.balance,
      },
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
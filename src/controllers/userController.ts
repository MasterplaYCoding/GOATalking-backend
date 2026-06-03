import { Request, Response } from "express";
import { prisma } from "../db";
import { sendSecurityEmail } from "../services/emailService";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, passwordHash, avatarUrl } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Email is already registered" });
      return;
    }

    const newUser = await prisma.user.create({
      data: { username, email, passwordHash, avatarUrl: avatarUrl || "/logo.png" },
      include: { role: true }
    });

    const dbRole = newUser.role?.name || "User";

    const token = jwt.sign(
      { userId: newUser.id, role: dbRole },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { role: true } 
    });

    if (!user || user.passwordHash !== password) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
    const twoFactorExpiry = new Date(Date.now() + 5 * 60 * 1000); 

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode, twoFactorExpiry }
    });

    await sendSecurityEmail(
      user.email,
      "Your GOATalking Login Code",
      `Hello ${user.username},\n\nYour 2FA login code is: ${twoFactorCode}\nThis code will expire in 5 minutes.`
    );

    res.status(200).json({ 
      message: "2FA code sent to email",
      userId: user.id,
      requires2FA: true 
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const verify2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.body.userId;
    const code = req.body.code?.trim();

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { role: true }
    });

    console.log("Expected Code in DB:", user?.twoFactorCode);
    console.log("Code received from frontend:", code);

    if (!user || user.twoFactorCode !== code) {
      res.status(401).json({ error: "Invalid security code" });
      return;
    }

    if (user.twoFactorExpiry && user.twoFactorExpiry < new Date()) {
      res.status(401).json({ error: "Security code has expired" });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode: null, twoFactorExpiry: null }
    });

    const dbRole = user.role?.name || "User";
    const token = jwt.sign(
      { userId: user.id, role: dbRole },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "2FA verification failed" });
  }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(200).json({ message: "If that email exists, a reset link was sent." });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); 

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    });

    await sendSecurityEmail(
      user.email,
      "GOATalking Password Reset",
      `Hello,\n\nYou requested a password reset. Click the link below to securely reset your password:\n\nhttps://localhost:5173/reset-password?token=${resetToken}\n\nIf you did not request this, please ignore this email.`
    );

    res.status(200).json({ message: "If that email exists, a reset link was sent." });
  } catch (error) {
    res.status(500).json({ error: "Failed to process password reset" });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const user = await prisma.user.findFirst({
      where: { 
        resetToken: token,
        resetTokenExpiry: { gt: new Date() } 
      }
    });

    if (!user) {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordHash: newPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.status(200).json({ message: "Password has been successfully reset" });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset password" });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({ 
      skip, 
      take: limit,
      include: { role: true }
    });
    const totalItems = await prisma.user.count();

    res.status(200).json({
      data: users,
      meta: { totalItems, currentPage: page, totalPages: Math.ceil(totalItems / limit), itemsPerPage: limit }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.params.id as string },
      include: { role: true }
    });
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: "User not found or failed to delete" });
  }
};

export const getUserStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    res.status(200).json({ totalUsers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
};

export const getObservationList = async (req: Request, res: Response) => {
  try {
    const list = await prisma.observationList.findMany({
      include: { user: { select: { username: true, email: true } } },
      orderBy: { detectedAt: 'desc' }
    });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch observation list" });
  }
};
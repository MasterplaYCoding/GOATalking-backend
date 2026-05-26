import { Request, Response } from "express";
import { usersTable } from "../models/db";
import { prisma } from "../db";
import jwt from "jsonwebtoken";

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

    const dbRole = user.role?.name || "User";

    const token = jwt.sign(
      { userId: user.id, role: dbRole },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
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

export const deleteUser = (req: Request, res: Response): void => {
  const index = usersTable.findIndex(u => u.id === req.params.id);
  if (index === -1) { res.status(404).json({ message: "User not found" }); return; }
  usersTable.splice(index, 1);
  res.status(204).send();
};

export const getUserStats = (_req: Request, res: Response) => {
  res.status(200).json({ totalUsers: usersTable.length });
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
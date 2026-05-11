import { Request, Response } from "express";
import { usersTable } from "../models/db";
import { User } from "../models/user";
import { prisma } from "../db";

export const createUser = (req: Request, res: Response) => {
  const newUser: User = {
    id: Date.now().toString(),
    username: req.body.username,
    email: req.body.email,
    avatarUrl: req.body.avatarUrl || "",
    passwordHash: req.body.passwordHash
  };

  usersTable.push(newUser);
  res.status(201).json(newUser);
};

export const getUsers = (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedUsers = usersTable.slice(startIndex, endIndex);

  res.status(200).json({
    data: paginatedUsers,
    meta: {
      totalItems: usersTable.length,
      currentPage: page,
      totalPages: Math.ceil(usersTable.length / limit),
      itemsPerPage: limit
    }
  });
};

export const getUserById = (req: Request, res: Response): void => {
  const user = usersTable.find(u => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.status(200).json(user);
};

export const deleteUser = (req: Request, res: Response): void => {
  const index = usersTable.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  
  usersTable.splice(index, 1);
  res.status(204).send();
};

export const getUserStats = (_req: Request, res: Response) => {
  res.status(200).json({
    totalUsers: usersTable.length
  });
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: { include: { permissions: true } } } 
    });

    if (!user || user.passwordHash !== password) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const getObservationList = async (req: Request, res: Response) => {
  try {
    const list = await prisma.observationList.findMany({
      include: {
        user: { select: { username: true, email: true } }
      },
      orderBy: { detectedAt: 'desc' }
    });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch observation list" });
  }
};
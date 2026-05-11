import { Request, Response } from "express";
import { prisma } from "../db";

export const getLists = async (_req: Request, res: Response) => {
  try {
    const lists = await prisma.pollList.findMany();
    res.status(200).json(lists);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lists" });
  }
};

export const createList = async (req: Request, res: Response) => {
  try {
    const { name, description, ownerId } = req.body;
    const newList = await prisma.pollList.create({
      data: {
        name,
        description,
        ownerId: ownerId || "system-user"
      }
    });
    res.status(201).json(newList);
  } catch (error) {
    res.status(500).json({ error: "Failed to create list" });
  }
};

export const updateList = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const updatedList = await prisma.pollList.update({
      where: { id: req.params.id as string },
      data: { name, description }
    });
    res.status(200).json(updatedList);
  } catch (error) {
    res.status(404).json({ message: "List not found" });
  }
};

export const deleteList = async (req: Request, res: Response) => {
  try {
    await prisma.pollList.delete({
      where: { id: req.params.id as string }
    });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: "List not found" });
  }
};

export const assignPollToList = async (req: Request, res: Response) => {
  try {
    const { pollId, listId } = req.body;
    const updatedPoll = await prisma.poll.update({
      where: { id: pollId as string },
      data: { listId: listId || null }
    });
    res.status(200).json(updatedPoll);
  } catch (error) {
    res.status(404).json({ message: "Poll not found" });
  }
};
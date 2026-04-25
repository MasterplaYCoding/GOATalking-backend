import { Request, Response } from "express";
import { pollsTable } from "../models/db";
import { Poll } from "../models/poll";

export const createPoll = (req: Request, res: Response) => {
  const body = req.body;
  
  const newPoll: Poll = {
    id: body.id || Date.now().toString(),
    title: body.title,
    category: body.category,
    description: body.description,
    imageUrl: body.imageUrl || "/logo.png",
    dateCreated: body.dateCreated ? new Date(body.dateCreated) : new Date(),
    interactionCount: body.interactionCount ?? 0,
    ownerId: body.ownerId || "system-user",
    listId: body.listId ?? null,
    options: body.options.map((opt: any) => ({
      id: opt.id || Math.random().toString(36).substring(7),
      text: opt.text,
      votes: opt.votes ?? 0,
      userId: opt.userId
    }))
  };

  pollsTable.push(newPoll);
  res.status(201).json(newPoll);
};

export const getPolls = (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedPolls = pollsTable.slice(startIndex, endIndex);

  res.status(200).json({
    data: paginatedPolls,
    meta: {
      totalItems: pollsTable.length,
      currentPage: page,
      totalPages: Math.ceil(pollsTable.length / limit),
      itemsPerPage: limit
    }
  });
};

export const getPollById = (req: Request, res: Response): void => {
  const poll = pollsTable.find(p => p.id === req.params.id);
  if (!poll) {
    res.status(404).json({ message: "Poll not found" });
    return;
  }
  res.status(200).json(poll);
};

export const deletePoll = (req: Request, res: Response): void => {
  const index = pollsTable.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: "Poll not found" });
    return;
  }
  
  pollsTable.splice(index, 1);
  res.status(204).send(); 
};

export const getPollStats = (_req: Request, res: Response) => {
  const totalPolls = pollsTable.length;
  const totalInteractions = pollsTable.reduce((sum, poll) => sum + poll.interactionCount, 0);
  
  let mostPopular = null;
  if (totalPolls > 0) {
    mostPopular = [...pollsTable].sort((a, b) => b.interactionCount - a.interactionCount)[0];
  }

  res.status(200).json({
    totalPolls,
    totalInteractions,
    mostPopularPollId: mostPopular?.id || null
  });
};

export const updatePoll = (req: Request, res: Response): void => {
  const index = pollsTable.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    res.status(404).json({ message: "Poll not found" });
    return;
  }
  
  pollsTable[index] = { ...pollsTable[index], ...req.body };
  
  res.status(200).json(pollsTable[index]);
};

export const getPollsByUser = (req: Request, res: Response): void => {
  const userId = req.params.userId;
  const userPolls = pollsTable.filter(p => p.ownerId === userId);
  
  res.status(200).json(userPolls);
};

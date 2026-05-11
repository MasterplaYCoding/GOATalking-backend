import { Request, Response } from "express";
import { prisma } from "../db";

export const createPoll = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    
    const newPoll = await prisma.poll.create({
      data: {
        title: body.title,
        category: body.category,
        description: body.description,
        imageUrl: body.imageUrl || "/logo.png",
        interactionCount: body.interactionCount ?? 0,
        ownerId: body.ownerId || "system-user",
        options: {
          create: body.options.map((opt: any) => ({
            text: opt.text,
            votes: opt.votes ?? 0
          }))
        }
      },
      include: { options: true }
    });

    res.status(201).json(newPoll);
  } catch (error) {
    res.status(500).json({ error: "Failed to create poll" });
  }
};

export const getPolls = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [polls, totalItems] = await Promise.all([
    prisma.poll.findMany({ skip, take: limit, include: { options: true } }),
    prisma.poll.count()
  ]);

  res.status(200).json({
    data: polls,
    meta: { totalItems, currentPage: page, totalPages: Math.ceil(totalItems / limit), itemsPerPage: limit }
  });
};

export const getPollById = async (req: Request, res: Response): Promise<void> => {
  const poll = await prisma.poll.findUnique({
    where: { id: req.params.id as string},
    include: { options: true }
  });

  if (!poll) {
    res.status(404).json({ message: "Poll not found" });
    return;
  }
  
  res.status(200).json(poll);
};

export const deletePoll = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.poll.delete({
      where: { id: req.params.id as string}
    });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: "Poll not found" });
  }
};

export const getPollStats = async (_req: Request, res: Response) => {
  const totalPolls = await prisma.poll.count();
  const aggregate = await prisma.poll.aggregate({
    _sum: { interactionCount: true }
  });
  
  const mostPopular = await prisma.poll.findFirst({
    orderBy: { interactionCount: 'desc' }
  });

  res.status(200).json({
    totalPolls,
    totalInteractions: aggregate._sum.interactionCount || 0,
    mostPopularPollId: mostPopular?.id || null
  });
};

export const updatePoll = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedPoll = await prisma.poll.update({
      where: { id: req.params.id as string},
      data: req.body,
      include: { options: true }
    });
    res.status(200).json(updatedPoll);
  } catch (error) {
    res.status(404).json({ message: "Poll not found" });
  }
};

export const getPollsByUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.userId;
  const userPolls = await prisma.poll.findMany({
    where: { ownerId: userId as string},
    include: { options: true }
  });
  
  res.status(200).json(userPolls);
};


export const voteOnPoll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pollId, optionId, userId } = req.body;

    const existingVote = await prisma.pollVote.findUnique({
      where: { userId_pollId: { userId, pollId } }
    });

    if (existingVote) {
      if (existingVote.optionId === optionId) {
        res.status(200).send();
        return;
      }

      await prisma.pollOption.update({ where: { id: existingVote.optionId }, data: { votes: { decrement: 1 } } });
      await prisma.pollOption.update({ where: { id: optionId }, data: { votes: { increment: 1 } } });

      await prisma.pollVote.update({
        where: { id: existingVote.id },
        data: { optionId }
      });
    } else {
      await prisma.pollOption.update({ where: { id: optionId }, data: { votes: { increment: 1 } } });
      await prisma.pollVote.create({ data: { userId, pollId, optionId } });
      await prisma.poll.update({ where: { id: pollId }, data: { interactionCount: { increment: 1 } } });
    }

    const updatedPoll = await prisma.poll.findUnique({ 
      where: { id: pollId }, 
      include: { options: true } 
    });
    
    res.status(200).json(updatedPoll);
  } catch (error) {
    console.error("Vote failed:", error);
    res.status(500).json({ error: "Failed to process vote" });
  }
};
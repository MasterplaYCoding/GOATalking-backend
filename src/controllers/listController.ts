import { Request, Response } from "express";

// Controller scaffold for the future persisted one-to-many PollList -> Poll relation.
// The actual database hookup is intentionally left for the next step.

const notImplemented = (res: Response) => {
  res.status(501).json({ message: "Poll list persistence is not wired yet." });
};

export const getLists = (_req: Request, res: Response) => {
  notImplemented(res);
};

export const createList = (_req: Request, res: Response) => {
  notImplemented(res);
};

export const updateList = (_req: Request, res: Response) => {
  notImplemented(res);
};

export const deleteList = (_req: Request, res: Response) => {
  notImplemented(res);
};

export const assignPollToList = (_req: Request, res: Response) => {
  notImplemented(res);
};

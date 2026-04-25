import { Request, Response } from "express";
import { faker } from "@faker-js/faker";
import { broadcast } from "../socket";
import { pollsTable } from "../models/db";

let generatorInterval: NodeJS.Timeout | null = null;

export const startGenerator = (req: Request, res: Response) => {
  if (generatorInterval) {
    return res.status(400).json({ message: "Generator is already running" });
  }

  const { userId } = req.body;

  generatorInterval = setInterval(() => {
    const numOptions = faker.number.int({ min: 2, max: 4 });
    const generatedOptions = Array.from({ length: numOptions }).map(() => ({
      id: faker.string.uuid(),
      text: faker.word.words({ count: { min: 1, max: 3 } }),
      votes: faker.number.int({ min: 0, max: 50 })
    }));

    const totalVotes = generatedOptions.reduce((sum, opt) => sum + opt.votes, 0);

    const newPoll = {
      id: faker.string.uuid(),
      title: faker.lorem.sentence().replace('.', '?'),
      category: faker.commerce.department(),
      description: faker.lorem.paragraph(),
      imageUrl: faker.image.url(),
      dateCreated: new Date(),
      interactionCount: totalVotes,
      ownerId: userId || "system-user",
      options: generatedOptions,
      listId: null
    };

    pollsTable.push(newPoll);

    broadcast({ type: "NEW_POLL", payload: newPoll });
  }, 3000);

  res.status(200).json({ message: "Generator started" });
};

export const stopGenerator = (req: Request, res: Response) => {
  if (generatorInterval) {
    clearInterval(generatorInterval);
    generatorInterval = null;
  }
  res.status(200).json({ message: "Generator stopped" });
};
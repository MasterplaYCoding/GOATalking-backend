import { Request, Response } from "express";
import { faker } from "@faker-js/faker";
import { broadcast } from "../socket";
import { prisma } from "../db";

let generatorInterval: NodeJS.Timeout | null = null;

export const startGenerator = async (req: Request, res: Response) => {
  if (generatorInterval) {
    return res.status(400).json({ message: "Generator is already running" });
  }

  try {
    await prisma.user.upsert({
      where: { id: "demo-user" },
      update: {},
      create: {
        id: "demo-user",
        email: "demo@system.local",
        username: "System Generator",
        passwordHash: "dummy-hash",
        avatarUrl: "/logo.png"
      }
    });
    console.log("SUCCESS: demo-user is locked and loaded in the database.");
  } catch (err) {
    console.error("CRITICAL DATABASE ERROR: Could not create demo-user:", err);
    return res.status(500).json({ error: "Database failed to seed system user." });
  }

  generatorInterval = setInterval(async () => {
    try {
      const numOptions = faker.number.int({ min: 2, max: 4 });
      const generatedOptions = Array.from({ length: numOptions }).map(() => ({
        text: faker.word.words({ count: { min: 1, max: 3 } }),
        votes: faker.number.int({ min: 0, max: 50 })
      }));

      const totalVotes = generatedOptions.reduce((sum, opt) => sum + opt.votes, 0);

      const newPoll = await prisma.poll.create({
        data: {
          title: faker.lorem.sentence().replace('.', '?'),
          category: faker.commerce.department(),
          description: faker.lorem.paragraph(),
          imageUrl: faker.image.url(),
          interactionCount: totalVotes,
          ownerId: "demo-user",
          options: {
            create: generatedOptions
          }
        },
        include: { options: true }
      });

      console.log(`POLL GENERATED: ${newPoll.title}`);
      broadcast({ type: "NEW_POLL", payload: newPoll });
    } catch (error) {
      console.error("GENERATOR CRASHED during Poll creation:", error);
    }
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
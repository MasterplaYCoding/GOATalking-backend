import { Request, Response } from "express";
import { prisma } from "../db";

export const createTest = async (req: Request, res: Response) => {
  try {
    const newTest = await prisma.marginalityTest.create({
      data: {
        title: req.body.title,
        topic: req.body.topic,
        description: req.body.description,
        categoryDefs: {
          create: req.body.categoryDefinitions
        },
        questions: {
          create: req.body.questions
        }
      },
      include: { categoryDefs: true, questions: true }
    });

    res.status(201).json({ ...newTest, categoryDefinitions: newTest.categoryDefs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create test" });
  }
};

export const getTests = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [tests, totalItems] = await Promise.all([
      prisma.marginalityTest.findMany({
        skip,
        take: limit,
        include: { categoryDefs: true, questions: true }
      }),
      prisma.marginalityTest.count()
    ]);

    const parsedTests = tests.map((t: any) => {
      const parsedDefs = t.categoryDefs.map((def: any) => ({
        ...def,
        options: def.options ? JSON.parse(def.options) : undefined
      }));
      return { ...t, categoryDefinitions: parsedDefs };
    });

    res.status(200).json({
      data: parsedTests,
      meta: {
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tests" });
  }
};

export const getTestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const test = await prisma.marginalityTest.findUnique({
      where: { id: req.params.id as string },
      include: { categoryDefs: true, questions: true }
    });

    if (!test) {
      res.status(404).json({ message: "Test not found" });
      return;
    }
    
    const parsedDefs = test.categoryDefs.map((def: any) => ({
      ...def,
      options: def.options ? JSON.parse(def.options) : undefined
    }));

    res.status(200).json({ ...test, categoryDefinitions: parsedDefs });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch test" });
  }
};

export const deleteTest = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.marginalityTest.delete({
      where: { id: req.params.id as string }
    });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: "Test not found" });
  }
};

export const submitResponse = async (req: Request, res: Response) => {
  try {
    const { testId, userId, categoryValues, votes, startedAt } = req.body;

    if (startedAt) {
      const duration = (Date.now() - new Date(startedAt).getTime()) / 1000;
      if (duration < 60) {
        const newReason = "Test Speedrun (<60s)";
        const existingRecord = await prisma.observationList.findUnique({ where: { userId } });

        let finalReason = newReason;
        if (existingRecord) {
          finalReason = existingRecord.reason.includes(newReason)
            ? existingRecord.reason
            : `${existingRecord.reason} | ${newReason}`;
        }

        await prisma.observationList.upsert({
          where: { userId },
          update: { reason: finalReason, detectedAt: new Date() },
          create: { userId, reason: finalReason }
        });
        console.log(`🚨 SUSPICIOUS BEHAVIOR DETECTED: User ${userId} flagged for Test Speedrun (<60s).`);
      }
    }

    const existingResponse = await prisma.marginalityTestResponse.findFirst({
      where: { testId: testId, userId: userId }
    });

    const formattedCategoryValues = Object.entries(categoryValues).map(([key, val]) => ({
      definitionId: key, 
      value: String(val)
    }));

    let response;

    if (existingResponse) {
      response = await prisma.marginalityTestResponse.update({
        where: { id: existingResponse.id },
        data: {
          categoryValues: { deleteMany: {}, createMany: { data: formattedCategoryValues } },
          votes: { deleteMany: {}, createMany: { data: votes } }
        },
        include: { categoryValues: true, votes: true }
      });
    } else {
      response = await prisma.marginalityTestResponse.create({
        data: {
          testId: testId,
          userId: userId,
          categoryValues: { createMany: { data: formattedCategoryValues } },
          votes: { createMany: { data: votes } }
        },
        include: { categoryValues: true, votes: true }
      });
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Submit Response Error:", error); 
    res.status(500).json({ error: "Failed to submit response" });
  }
};

export const getResponses = async (_req: Request, res: Response) => {
  try {
    const responses = await prisma.marginalityTestResponse.findMany({
      include: { categoryValues: true, votes: true }
    });

    const formattedResponses = responses.map((response: any) => {
      const categoryDict: Record<string, string | number> = {};
      
      response.categoryValues.forEach((cv: any) => {
        categoryDict[cv.definitionId] = isNaN(Number(cv.value)) ? cv.value : Number(cv.value);
      });

      return {
        ...response,
        categoryValues: categoryDict
      };
    });

    res.status(200).json(formattedResponses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch responses" });
  }
};
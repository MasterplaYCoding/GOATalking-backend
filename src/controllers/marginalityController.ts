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

    const parsedTests = tests.map(t => {
      const parsedDefs = t.categoryDefs.map(def => ({
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
    
    const parsedDefs = test.categoryDefs.map(def => ({
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
    const { testId, userId, categoryValues, votes } = req.body;

    const existingResponse = await prisma.marginalityTestResponse.findFirst({
      where: { 
        testId: testId,
        userId: userId 
      }
    });

    let response;

    if (existingResponse) {
      response = await prisma.marginalityTestResponse.update({
        where: { id: existingResponse.id },
        data: {
          categoryValues: { deleteMany: {}, create: categoryValues },
          votes: { deleteMany: {}, create: votes }
        },
        include: { categoryValues: true, votes: true }
      });
    } else {
      const formattedCategoryValues = Object.entries(req.body.categoryValues).map(([key, val]) => ({
        definitionId: key, 
        value: String(val)
      }));

      response = await prisma.marginalityTestResponse.create({
        data: {
          testId: req.body.testId,
          userId: req.body.userId,
          categoryValues: {
            createMany: {
              data: formattedCategoryValues
            }
          },
          votes: {
            createMany: {
              data: req.body.votes
            }
          }
        },
        include: {
          categoryValues: true,
          votes: true
        }
      });
    }

    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit response" });
  }
};

export const getResponses = async (_req: Request, res: Response) => {
  try {
    const responses = await prisma.marginalityTestResponse.findMany({
      include: { categoryValues: true, votes: true }
    });

    // Transform Prisma's array back into the dictionary object the frontend expects
    const formattedResponses = responses.map(response => {
      const categoryDict: Record<string, string | number> = {};
      
      response.categoryValues.forEach(cv => {
        // Convert numeric strings back to numbers for age calculations
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
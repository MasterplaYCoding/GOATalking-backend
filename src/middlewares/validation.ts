import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const createPollSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  imageUrl: z.string().optional(),
  dateCreated: z.union([z.string(), z.date()]).optional(),
  interactionCount: z.number().optional(),
  ownerId: z.string().optional(),
  listId: z.string().nullable().optional(),
  options: z.array(
    z.object({
      id: z.string().optional(),
      text: z.string().min(1, "Option text cannot be empty"),
      votes: z.number().optional(),
      userId: z.string().optional(),
    })
  ).min(2, "At least 2 options are required"),
});

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Validation Failed", 
        errors: result.error.issues 
      });
      return;
    }

    req.body = result.data; 
    
    next();
  };
};

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  avatarUrl: z.string().optional(),
  passwordHash: z.string().min(6)
});

export const createMarginalityTestSchema = z.object({
  title: z.string().min(3).max(100),
  topic: z.string().min(1),
  description: z.string().max(1000),
  categoryDefinitions: z.array(
    z.object({
      key: z.string().min(1),
      label: z.string().min(1),
      inputType: z.enum(["text", "select", "number"])
    })
  ).min(1, "At least one category is required"),
  questions: z.array(
    z.object({
      id: z.string().min(1),
      text: z.string().min(5)
    })
  ).min(1, "At least one question is required")
});

export const submitResponseSchema = z.object({
  testId: z.string().min(1),
  userId: z.string().min(1),
  categoryValues: z.record(z.string(), z.union([z.string(), z.number()])),  
  votes: z.array(
    z.object({
      questionId: z.string().min(1),
      agreement: z.number().min(0).max(100) 
    })
  ).min(1),
  startedAt: z.number().optional() 
});
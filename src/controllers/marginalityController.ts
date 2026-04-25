import { Request, Response } from "express";
import { marginalityTestsTable, marginalityResponsesTable } from "../models/db";
import { MarginalityTest, MarginalityTestResponse } from "../models/marginalityTest";

export const createTest = (req: Request, res: Response) => {
  const newTest: MarginalityTest = {
    id: Date.now().toString(),
    title: req.body.title,
    topic: req.body.topic,
    description: req.body.description,
    categoryDefinitions: req.body.categoryDefinitions,
    questions: req.body.questions,
    createdAt: new Date()
  };

  marginalityTestsTable.push(newTest);
  res.status(201).json(newTest);
};

export const getTests = (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedTests = marginalityTestsTable.slice(startIndex, endIndex);

  res.status(200).json({
    data: paginatedTests,
    meta: {
      totalItems: marginalityTestsTable.length,
      currentPage: page,
      totalPages: Math.ceil(marginalityTestsTable.length / limit),
      itemsPerPage: limit
    }
  });
};

export const getTestById = (req: Request, res: Response): void => {
  const test = marginalityTestsTable.find(t => t.id === req.params.id);
  if (!test) {
    res.status(404).json({ message: "Test not found" });
    return;
  }
  res.status(200).json(test);
};

export const deleteTest = (req: Request, res: Response): void => {
  const index = marginalityTestsTable.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: "Test not found" });
    return;
  }
  
  marginalityTestsTable.splice(index, 1);
  res.status(204).send();
};

export const submitResponse = (req: Request, res: Response) => {
  const newResponse: MarginalityTestResponse = {
    id: Date.now().toString(),
    testId: req.body.testId,
    userId: req.body.userId,
    categoryValues: req.body.categoryValues,
    votes: req.body.votes,
    submittedAt: new Date()
  };

  const existingIndex = marginalityResponsesTable.findIndex(
    r => r.testId === newResponse.testId && r.userId === newResponse.userId
  );

  if (existingIndex !== -1) {
    marginalityResponsesTable[existingIndex] = newResponse;
  } else {
    marginalityResponsesTable.push(newResponse);
  }

  res.status(201).json(newResponse);
};

export const getResponses = (_req: Request, res: Response) => {
  res.status(200).json(marginalityResponsesTable);
};
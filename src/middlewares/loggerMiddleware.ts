import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";

export const actionLoggerAndDetector = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    
    if (!userId) return next();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) return next();
    
    const groupId = user.role?.name === "Admin" ? "ADMIN" : "USER";
    const actionInfo = `${req.method} request to ${req.originalUrl}`;
    
    await prisma.logEntry.create({
      data: {
        userId: user.id,
        groupId: groupId,
        actionInformation: actionInfo,
      }
    });

    const fiveSecondsAgo = new Date(Date.now() - 5000);
    
    const rapidActionsCount = await prisma.logEntry.count({
      where: {
        userId: user.id,
        timestamp: { gte: fiveSecondsAgo }
      }
    });

    if (rapidActionsCount > 10) {
      const newReason = "API Spamming (>10 requests/5s)";
      const existingRecord = await prisma.observationList.findUnique({ where: { userId: user.id } });
      
      let finalReason = newReason;
      if (existingRecord) {
        finalReason = existingRecord.reason.includes(newReason) 
          ? existingRecord.reason 
          : `${existingRecord.reason} | ${newReason}`;
      }

      await prisma.observationList.upsert({
        where: { userId: user.id },
        update: { 
          reason: finalReason,
          detectedAt: new Date()
        },
        create: { 
          userId: user.id, 
          reason: finalReason 
        }
      });
      console.log(`SUSPICIOUS BEHAVIOR DETECTED: User ${user.username} flagged for API Spamming.`);
    }

  } catch (error) {
    console.error("Logger Middleware Error:", error);
  }

  next();
};
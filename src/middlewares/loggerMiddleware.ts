import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";

async function askLocalLLM(username: string, actionLogs: string[]): Promise<boolean> {
  return false; // Placeholder for actual LLM integration
  const prompt = `You are a strict cybersecurity AI. Analyze this user's recent actions.
User: ${username}
Recent Actions: 
${actionLogs.map(a => `- ${a}`).join("\n")}

Are these actions indicative of a malicious bot, DDOS attack, or API spam?
Reply ONLY with the exact word YES or NO.`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3", 
        prompt: prompt,
        stream: false
      })
    });
    
    const data = await response.json();
    const aiResponse = data.response.trim().toUpperCase();
    
    console.log(`🧠 AI Evaluation for ${username}: ${aiResponse}`);
    return aiResponse.includes("YES");
  } catch (err) {
    console.error("⚠️ Local LLM is offline or unreachable.");
    return false;
  }
}

export const actionLoggerAndDetector = async (req: Request, res: Response, next: NextFunction) => {
  console.log(`[MIDDLEWARE] Caught request to: ${req.url}`);
  next();

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return; 

    const token = authHeader.split(" ")[1];
    if (!token) return;

    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return;
    
    const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) return;
    
    const groupId = user.role?.name === "Admin" ? "ADMIN" : "USER";
    const actionInfo = `${req.method} request to ${req.originalUrl}`;
    
    await prisma.logEntry.create({
      data: { userId: user.id, groupId: groupId, actionInformation: actionInfo }
    });

    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const recentLogs = await prisma.logEntry.findMany({
      where: { userId: user.id, timestamp: { gte: fiveSecondsAgo } },
      orderBy: { timestamp: 'desc' }
    });

    if (recentLogs.length > 8) {
      console.log(`🚨 Tripwire crossed by ${user.username}. Waking up AI...`);
      
      const logStrings = recentLogs.map((l: any) => l.actionInformation);

      const isMalicious = await askLocalLLM(user.username, logStrings);

      if (isMalicious) {
        const newReason = "AI Detected Malicious Bot/DDOS Behavior";
        const existingRecord = await prisma.observationList.findUnique({ where: { userId: user.id } });
        
        let finalReason = newReason;
        if (existingRecord) {
          finalReason = existingRecord.reason.includes(newReason) 
            ? existingRecord.reason 
            : `${existingRecord.reason} | ${newReason}`;
        }

        await prisma.observationList.upsert({
          where: { userId: user.id },
          update: { reason: finalReason, detectedAt: new Date() },
          create: { userId: user.id, reason: finalReason }
        });
        
        console.log(`🛑 SUSPICIOUS BEHAVIOR DETECTED: Added to Observation List!`);
      }
    }
  } catch (error) {
    console.error("Logger Middleware Background Error:", error);
  }
};
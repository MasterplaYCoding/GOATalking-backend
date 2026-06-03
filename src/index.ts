import express from "express";
import cors from "cors";
import https from "https";
import http from "http";
import mongoose from "mongoose";
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import pollRoutes from "./routes/pollRoutes";
import userRoutes from "./routes/userRoutes";
import marginalityRoutes from "./routes/marginalityRoutes";
import generatorRoutes from "./routes/generatorRoutes";
import { initWebSocket } from "./socket";
import { typeDefs, resolvers } from "./graphql";
import { prisma } from './db';
import { actionLoggerAndDetector } from "./middlewares/loggerMiddleware";
import "dotenv/config";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", actionLoggerAndDetector);

app.use("/api/polls", pollRoutes);
app.use("/api/users", userRoutes);
app.use("/api/marginality", marginalityRoutes);
app.use("/api/generator", generatorRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "Server is running perfectly in RAM!" });
});

const ensureSystemUserExists = async () => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: "demo-user" }
    });
    
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: "demo-user",
          email: "demo@system.local",
          username: "System Generator",
          passwordHash: "dummy-hash",
          avatarUrl: "/logo.png"
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 5000,
      family: 4 
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    cors(),
    express.json(),
    (req, res, next) => { req.body = req.body || {}; next(); },
    expressMiddleware(apolloServer)
  );

  let server;

  if (process.env.NODE_ENV === "production") {
    server = http.createServer(app);
  } else {
    const keyPath = path.join(process.cwd(), 'localhost+1-key.pem');
    const certPath = path.join(process.cwd(), 'localhost+1.pem');

    server = https.createServer({ 
      key: fs.readFileSync(keyPath), 
      cert: fs.readFileSync(certPath) 
    }, app);
  }

  initWebSocket(server);

  if (process.env.NODE_ENV !== "test") {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`GraphQL Sandbox is at port ${PORT}/graphql`);
    });
  }
};

startServer();

export default app;
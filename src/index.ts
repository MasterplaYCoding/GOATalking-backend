import express from "express";
import cors from "cors";
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

const app = express();
const PORT = 3000;

const server = http.createServer(app);

initWebSocket(server);

app.use(cors());
app.use(express.json());

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
      console.log("Seeded default 'demo-user' for the generator.");
    }
  } catch (error) {
    console.error("Error seeding system user:", error);
  }
};

const startServer = async () => {
  try {
    await mongoose.connect("mongodb+srv://matei_user:dbUserPassword@cluster0.cu5czfm.mongodb.net/?appName=Cluster0");
    console.log("Connected to NoSQL MongoDB for Chat");
  } catch (error) {
    console.error("MongoDB connection error:", error);
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

  // await ensureSystemUserExists();

  if (process.env.NODE_ENV !== "test") {
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`GraphQL Sandbox is at http://localhost:${PORT}/graphql`);
    });
  }
};

startServer();

export default app;
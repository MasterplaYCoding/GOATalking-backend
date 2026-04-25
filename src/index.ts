import express from "express";
import cors from "cors";
import http from "http";
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import pollRoutes from "./routes/pollRoutes";
import userRoutes from "./routes/userRoutes";
import marginalityRoutes from "./routes/marginalityRoutes";
import generatorRoutes from "./routes/generatorRoutes";
import { initWebSocket } from "./socket";
import { typeDefs, resolvers } from "./graphql";

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

const startServer = async () => {
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

  if (process.env.NODE_ENV !== "test") {
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`GraphQL Sandbox is at http://localhost:${PORT}/graphql`);
    });
  }
};

startServer();

export default app;

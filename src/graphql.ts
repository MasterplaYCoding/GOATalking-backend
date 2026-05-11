import { prisma } from "./db";

export const typeDefs = `#graphql
  type Option {
    id: ID!
    text: String!
    votes: Int!
  }

  type Poll {
    id: ID!
    title: String!
    category: String!
    description: String!
    imageUrl: String!
    dateCreated: String!
    interactionCount: Int!
    ownerId: String!
    options: [Option!]!
    listId: String
  }

  type PollStats {
    totalPolls: Int!
    totalInteractions: Int!
    mostPopularPollId: String
  }

  type PaginatedPolls {
    data: [Poll!]!
    meta: PaginationMeta!
  }

  type PaginationMeta {
    totalItems: Int!
    currentPage: Int!
    totalPages: Int!
    itemsPerPage: Int!
  }

  input OptionInput {
    text: String!
  }

  type Query {
    getPolls(page: Int, limit: Int): PaginatedPolls!
    getPollById(id: ID!): Poll
    getPollsByUser(userId: String!): [Poll!]!
    getPollStats: PollStats!
    getPollLists: [PollList!]!
    getPollListStats(listId: ID): PollListStats!
  }

  type Mutation {
    createPoll(title: String!, category: String!, description: String!, imageUrl: String, options: [OptionInput!]!): Poll!
    updatePoll(id: ID!, interactionCount: Int, options: [OptionInput]): Poll
    deletePoll(id: ID!): Boolean
    votePoll(pollId: ID!, optionId: ID!): Poll!
    createPollList(name: String!, description: String!, ownerId: String!): PollList!
    updatePollList(id: ID!, name: String, description: String): PollList
    deletePollList(id: ID!): Boolean
    assignPollToList(pollId: ID!, listId: String): Poll
  }

  type PollList {
    id: ID!
    name: String!
    description: String!
    createdAt: String!
    ownerId: String!
  }

  type PollListStats {
    listId: String
    pollCount: Int!
    totalInteractions: Int!
  }
`;

export const resolvers = {
  Query: {
    getPolls: async (_: any, { page = 1, limit = 10 }: { page: number; limit: number }) => {
      const skip = (page - 1) * limit;
      
      const [polls, totalItems] = await Promise.all([
        prisma.poll.findMany({
          skip,
          take: limit,
          include: { options: true }
        }),
        prisma.poll.count()
      ]);

      return {
        data: polls.map(p => ({ ...p, dateCreated: p.dateCreated.toISOString(), ownerId: p.ownerId || "" })),
        meta: {
          totalItems,
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          itemsPerPage: limit
        }
      };
    },
    
    getPollById: async (_: any, { id }: { id: string }) => {
      const poll = await prisma.poll.findUnique({
        where: { id },
        include: { options: true }
      });
      return poll ? { ...poll, dateCreated: poll.dateCreated.toISOString(), ownerId: poll.ownerId || "" } : null;
    },
    
    getPollsByUser: async (_: any, { userId }: { userId: string }) => {
      const polls = await prisma.poll.findMany({
        where: { ownerId: userId },
        include: { options: true }
      });
      return polls.map(p => ({ ...p, dateCreated: p.dateCreated.toISOString(), ownerId: p.ownerId || "" }));
    },
    
    getPollStats: async () => {
      const totalPolls = await prisma.poll.count();
      const aggregate = await prisma.poll.aggregate({
        _sum: { interactionCount: true }
      });
      const mostPopular = await prisma.poll.findFirst({
        orderBy: { interactionCount: 'desc' }
      });

      return {
        totalPolls,
        totalInteractions: aggregate._sum.interactionCount || 0,
        mostPopularPollId: mostPopular?.id || null
      };
    },
    
    getPollLists: async () => {
      const lists = await prisma.pollList.findMany();
      return lists.map(l => ({ ...l, createdAt: l.createdAt.toISOString(), ownerId: l.ownerId || "" }));
    },
    
    getPollListStats: async (_: any, { listId }: { listId?: string }) => {
      const whereClause = listId ? { listId } : { listId: null };
      
      const pollCount = await prisma.poll.count({ where: whereClause });
      const aggregate = await prisma.poll.aggregate({
        _sum: { interactionCount: true },
        where: whereClause
      });

      return {
        listId: listId || null,
        pollCount,
        totalInteractions: aggregate._sum.interactionCount || 0
      };
    }
  },
  
  Mutation: {
    createPoll: async (_: any, args: any) => {
      const newPoll = await prisma.poll.create({
        data: {
          title: args.title,
          category: args.category,
          description: args.description,
          imageUrl: args.imageUrl || "/logo.png",
          ownerId: "system-user",
          options: {
            create: args.options.map((opt: any) => ({
              text: opt.text,
              votes: 0
            }))
          }
        },
        include: { options: true }
      });

      return { ...newPoll, dateCreated: newPoll.dateCreated.toISOString(), ownerId: newPoll.ownerId || "" };
    },
    
    updatePoll: async (_: any, { id, interactionCount }: any) => {
      const data: any = {};
      if (interactionCount !== undefined) data.interactionCount = interactionCount;

      const updatedPoll = await prisma.poll.update({
        where: { id },
        data,
        include: { options: true }
      });
      return { ...updatedPoll, dateCreated: updatedPoll.dateCreated.toISOString(), ownerId: updatedPoll.ownerId || "" };
    },
    
    deletePoll: async (_: any, { id }: { id: string }) => {
      try {
        await prisma.poll.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
    
    votePoll: async (_: any, { pollId, optionId }: { pollId: string; optionId: string }) => {
      await prisma.pollOption.update({
        where: { id: optionId },
        data: { votes: { increment: 1 } }
      });

      const updatedPoll = await prisma.poll.update({
        where: { id: pollId },
        data: { interactionCount: { increment: 1 } },
        include: { options: true }
      });

      return { ...updatedPoll, dateCreated: updatedPoll.dateCreated.toISOString(), ownerId: updatedPoll.ownerId || "" };
    },
    
    createPollList: async (_: any, args: { name: string; description: string; ownerId: string }) => {
      const newList = await prisma.pollList.create({
        data: {
          name: args.name,
          description: args.description
        }
      });
      return { ...newList, createdAt: newList.createdAt.toISOString(), ownerId: args.ownerId };
    },

    updatePollList: async (_: any, { id, name, description }: { id: string; name?: string; description?: string }) => {
      const updatedList = await prisma.pollList.update({
        where: { id },
        data: { name, description }
      });
      return { ...updatedList, createdAt: updatedList.createdAt.toISOString(), ownerId: updatedList.ownerId || "" };
    },

    deletePollList: async (_: any, { id }: { id: string }) => {
      try {
        await prisma.pollList.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },

    assignPollToList: async (_: any, { pollId, listId }: { pollId: string; listId?: string }) => {
      const updatedPoll = await prisma.poll.update({
        where: { id: pollId },
        data: { listId: listId || null },
        include: { options: true }
      });
      return { ...updatedPoll, dateCreated: updatedPoll.dateCreated.toISOString(), ownerId: updatedPoll.ownerId || "" };
    }
  }
};
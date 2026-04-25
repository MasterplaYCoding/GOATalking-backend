import { pollListsTable, pollsTable } from "./models/db";
import { Poll } from "./models/poll";

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
    getPolls: (_: any, { page = 1, limit = 10 }: { page: number; limit: number }) => {
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedPolls = pollsTable.slice(startIndex, endIndex);
      
      return {
        data: paginatedPolls,
        meta: {
          totalItems: pollsTable.length,
          currentPage: page,
          totalPages: Math.ceil(pollsTable.length / limit),
          itemsPerPage: limit
        }
      };
    },
    getPollById: (_: any, { id }: { id: string }) => {
      return pollsTable.find(p => p.id === id);
    },
    getPollsByUser: (_: any, { userId }: { userId: string }) => {
      return pollsTable.filter(p => p.ownerId === userId);
    },
    getPollStats: () => {
      const totalPolls = pollsTable.length;
      const totalInteractions = pollsTable.reduce((sum, poll) => sum + poll.interactionCount, 0);
      
      let mostPopular = null;
      if (totalPolls > 0) {
        mostPopular = [...pollsTable].sort((a, b) => b.interactionCount - a.interactionCount)[0];
      }

      return {
        totalPolls,
        totalInteractions,
        mostPopularPollId: mostPopular?.id || null
      };
    },
    getPollLists: () => {
      return pollListsTable;
    },
    getPollListStats: (_: any, { listId }: { listId?: string }) => {
      const listPolls = pollsTable.filter(p => p.listId === listId || (!p.listId && !listId));
      
      const pollCount = listPolls.length;
      const totalInteractions = listPolls.reduce((sum, poll) => sum + poll.interactionCount, 0);

      return {
        listId: listId || null,
        pollCount,
        totalInteractions
      };
    }
  },
  Mutation: {
    createPoll: (_: any, args: any) => {
      const newPoll: Poll = {
        id: Date.now().toString(),
        title: args.title,
        category: args.category,
        description: args.description,
        imageUrl: args.imageUrl || "/logo.png",
        dateCreated: new Date(),        
        interactionCount: 0,
        ownerId: "system-user",
        options: args.options.map((opt: any) => ({
          id: Math.random().toString(36).substring(7),
          text: opt.text,
          votes: 0
        }))
      };

      pollsTable.push(newPoll);
      return newPoll;
    },
    updatePoll: (_: any, { id, ...updates }: any) => {
      const index = pollsTable.findIndex(p => p.id === id);
      if (index === -1) return null;
      
      pollsTable[index] = { ...pollsTable[index], ...updates };
      return pollsTable[index];
    },
    deletePoll: (_: any, { id }: { id: string }) => {
      const index = pollsTable.findIndex(p => p.id === id);
      if (index === -1) return false;
      
      pollsTable.splice(index, 1);
      return true;
    },
    votePoll: (_: any, { pollId, optionId }: { pollId: string; optionId: string }) => {
      const pollIndex = pollsTable.findIndex(p => p.id === pollId);
      if (pollIndex === -1) throw new Error("Poll not found");
      
      const poll = pollsTable[pollIndex];

      const option = poll.options.find(opt => opt.id === optionId);
      if (!option) throw new Error("Option not found");

      option.votes += 1;
      poll.interactionCount += 1;

      return poll;
    },
    createPollList: (_: any, args: { name: string; description: string; ownerId: string }) => {
      const newList = {
        id: Date.now().toString(),
        name: args.name,
        description: args.description,
        createdAt: new Date(),        
        ownerId: args.ownerId,
      };
      pollListsTable.push(newList);
      return newList;
    },

    updatePollList: (_: any, { id, name, description }: { id: string; name?: string; description?: string }) => {
      const index = pollListsTable.findIndex(l => l.id === id);
      if (index === -1) throw new Error("List not found");

      if (name !== undefined) pollListsTable[index].name = name;
      if (description !== undefined) pollListsTable[index].description = description;

      return pollListsTable[index];
    },

    deletePollList: (_: any, { id }: { id: string }) => {
      const index = pollListsTable.findIndex(l => l.id === id);
      if (index === -1) return false;

      pollListsTable.splice(index, 1);

      pollsTable.forEach(poll => {
        if (poll.listId === id) {
          poll.listId = null;
        }
      });

      return true;
    },

    assignPollToList: (_: any, { pollId, listId }: { pollId: string; listId?: string }) => {
      const poll = pollsTable.find(p => p.id === pollId);
      if (!poll) throw new Error("Poll not found");

      poll.listId = listId || null; 
      return poll;
    }
  }
};

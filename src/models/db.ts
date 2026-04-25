import { Poll } from "./poll";
import { User, UserVotes } from "./user";
import { MarginalityTest, MarginalityTestResponse } from "./marginalityTest";
import { PollList } from "./list";

export let usersTable: User[] = [
  {
    id: "demo-user",
    username: "demo-user",
    email: "demo@goatalking.com",
    passwordHash: "local-demo-password",
    avatarUrl: ""
  },
  {
    id: "other-user",
    username: "other-user",
    email: "other@goatalking.com",
    passwordHash: "local-demo-password",
    avatarUrl: ""
  },
  {
    id: "user-spain-1",
    username: "user-spain-1",
    email: "spain@goatalking.com",
    passwordHash: "local-demo-password",
    avatarUrl: ""
  },
  {
    id: "user-england-1",
    username: "user-england-1",
    email: "england@goatalking.com",
    passwordHash: "local-demo-password",
    avatarUrl: ""
  },
  {
    id: "user-germany-1",
    username: "user-germany-1",
    email: "germany@goatalking.com",
    passwordHash: "local-demo-password",
    avatarUrl: ""
  },
  {
    id: "user-argentina-1",
    username: "user-argentina-1",
    email: "argentina@goatalking.com",
    passwordHash: "local-demo-password",
    avatarUrl: ""
  }
];

export let pollsTable: Poll[] = [
  {
    id: "poll-1",
    title: "Who is the greatest football player of all time?",
    category: "Sports",
    description: "Use this page to shape the final poll details view and interactions.",
    imageUrl: "https://www.livemint.com/lm-img/img/2025/06/20/optimize/lionel_messi_Cristiano_ronaldo_1750427785706_1750427788080.jpg",
    options: [
      { id: "p1-o1", text: "Lionel Messi", votes: 120 },
      { id: "p1-o2", text: "Cristiano Ronaldo", votes: 95 },
      { id: "p1-o3", text: "Pelé", votes: 40 },
      { id: "p1-o4", text: "Diego Maradona", votes: 25 },
      { id: "p1-o5", text: "Johan Cruyff", votes: 15 },
      { id: "p1-o6", text: "Zinedine Zidane", votes: 5 }
    ],
    dateCreated: new Date(),
    interactionCount: 300,
    ownerId: "other-user"
  },
  {
    id: "poll-2",
    title: "What is the best programming language for beginners?",
    category: "Technology",
    description: "Cast your vote on the best language to start a software engineering journey.",
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=1000",
    options: [
      { id: "p2-o1", text: "Python", votes: 55 },
      { id: "p2-o2", text: "JavaScript", votes: 30 },
      { id: "p2-o3", text: "TypeScript", votes: 20 },
      { id: "p2-o4", text: "Java", votes: 10 },
      { id: "p2-o5", text: "C++", votes: 3 },
      { id: "p2-o6", text: "Ruby", votes: 2 }
    ],
    dateCreated: new Date(),
    interactionCount: 120,
    ownerId: "other-user"
  },
  {
    id: "poll-3",
    title: "Which sci-fi franchise is the absolute best?",
    category: "Entertainment",
    description: "From lightsabers to the spice melange, which universe reigns supreme?",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1000",
    options: [
      { id: "p3-o1", text: "Star Wars", votes: 200 },
      { id: "p3-o2", text: "Star Trek", votes: 195 },
      { id: "p3-o3", text: "The Matrix", votes: 190 },
      { id: "p3-o4", text: "Dune", votes: 150 },
      { id: "p3-o5", text: "Alien", votes: 65 }
    ],
    dateCreated: new Date(),
    interactionCount: 800,
    ownerId: "other-user"
  },
  {
    id: "poll-4",
    title: "What is the ultimate fast food burger?",
    category: "Food",
    description: "The debate that tears friendships apart. Vote for your favorite tier-1 burger.",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1000",
    options: [
      { id: "p4-o1", text: "Five Guys", votes: 420 },
      { id: "p4-o2", text: "In-N-Out", votes: 150 },
      { id: "p4-o3", text: "Shake Shack", votes: 100 },
      { id: "p4-o4", text: "McDonald's Quarter Pounder", votes: 50 },
      { id: "p4-o5", text: "Burger King Whopper", votes: 30 }
    ],
    dateCreated: new Date(),
    interactionCount: 750,
    ownerId: "other-user"
  },
  {
    id: "poll-5",
    title: "Where is your dream travel destination?",
    category: "Travel",
    description: "If money and time were no object, where are you booking your next flight?",
    imageUrl: "https://images.unsplash.com/photo-1488646953014-c8bf21d49246?auto=format&fit=crop&q=80&w=1000",
    options: [
      { id: "p5-o1", text: "Japan", votes: 28 },
      { id: "p5-o2", text: "Italy", votes: 5 },
      { id: "p5-o3", text: "New Zealand", votes: 4 },
      { id: "p5-o4", text: "Iceland", votes: 2 },
      { id: "p5-o5", text: "Peru (Machu Picchu)", votes: 1 }
    ],
    dateCreated: new Date(),
    interactionCount: 40,
    ownerId: "other-user"
  },
  {
    id: "poll-6",
    title: "What is your go-to morning beverage?",
    category: "Lifestyle",
    description: "How do you start your day?",
    imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1000",
    options: [
      { id: "p6-o1", text: "Coffee", votes: 2 },
      { id: "p6-o2", text: "Tea", votes: 2 },
      { id: "p6-o3", text: "Water", votes: 2 },
      { id: "p6-o4", text: "Juice", votes: 2 }
    ],
    dateCreated: new Date(),
    interactionCount: 8,
    ownerId: "demo-user"
  },
  {
    id: "poll-7",
    title: "What is the best season of the year?",
    category: "General",
    description: "Which season has the best vibes, weather, and holidays?",
    imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1000",
    options: [
      { id: "p7-o1", text: "Autumn", votes: 24 },
      { id: "p7-o2", text: "Summer", votes: 4 },
      { id: "p7-o3", text: "Spring", votes: 3 },
      { id: "p7-o4", text: "Winter", votes: 1 }
    ],
    dateCreated: new Date(),
    interactionCount: 32,
    ownerId: "demo-user"
  },
  {
    id: "poll-8",
    title: "Are you a dog person or a cat person?",
    category: "Pets",
    description: "The classic debate. Pick your side.",
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1000",
    options: [
      { id: "p8-o1", text: "Dogs", votes: 75 },
      { id: "p8-o2", text: "Cats", votes: 5 },
      { id: "p8-o3", text: "Neither", votes: 5 }
    ],
    dateCreated: new Date(),
    interactionCount: 85,
    ownerId: "demo-user"
  },
  {
    id: "poll-9",
    title: "Which superpower would you choose?",
    category: "Entertainment",
    description: "If you could only pick one superpower to have for the rest of your life.",
    imageUrl: "https://images.unsplash.com/photo-1612450371728-6617594fa7a0?auto=format&fit=crop&q=80&w=1000",
    options: [
      { id: "p9-o1", text: "Teleportation", votes: 80 },
      { id: "p9-o2", text: "Flight", votes: 60 },
      { id: "p9-o3", text: "Time Travel", votes: 40 },
      { id: "p9-o4", text: "Invisibility", votes: 20 }
    ],
    dateCreated: new Date(),
    interactionCount: 200,
    ownerId: "demo-user"
  },
  {
    id: "poll-10",
    title: "What is the best streaming service right now?",
    category: "Entertainment",
    description: "Considering price, original content, and UI, who is winning the streaming wars?",
    imageUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=1000",
    options: [
      { id: "p10-o1", text: "Netflix", votes: 330 },
      { id: "p10-o2", text: "HBO Max", votes: 150 },
      { id: "p10-o3", text: "Hulu", votes: 70 },
      { id: "p10-o4", text: "Disney+", votes: 50 }
    ],
    dateCreated: new Date(),
    interactionCount: 600,
    ownerId: "demo-user"
  }
];

export let marginalityTestsTable: MarginalityTest[] = [
  {
    id: "football-tribalism-and-legacy",
    title: "Football Tribalism and Legacy",
    topic: "Football",
    description: "Measure how your football opinions compare with supporters from different age groups, countries, and viewing habits.",
    createdAt: new Date(),
    categoryDefinitions: [
      {
        key: "age",
        label: "Age",
        inputType: "number",
        required: true,
        min: 13,
        max: 100,
        placeholder: "e.g. 27",
        includeInReport: false,
        includeInQuestionStats: false
      },
      {
        key: "ageGroup",
        label: "Generation",
        inputType: "select",
        isDerived: true,
        derivedFromKey: "age",
        derivedStrategy: "ageGroupFromAge",
        includeInQuestionStats: true,
        includeInReport: true
      },
      {
        key: "country",
        label: "Country",
        inputType: "text",
        required: true,
        placeholder: "e.g. Romania",
        includeInQuestionStats: true,
        includeInReport: true
      },
      {
        key: "footballWatchingLevel",
        label: "Football Watching Level",
        inputType: "select",
        required: true,
        options: ["Rarely", "Casual", "Weekly", "Obsessed"],
        includeInQuestionStats: true,
        includeInReport: true
      },
      {
        key: "favoriteClub",
        label: "Favorite Club",
        inputType: "text",
        required: false,
        placeholder: "Optional",
        includeInQuestionStats: false,
        includeInReport: true
      }
    ],
    questions: [
      { id: "football-q-1", text: "Modern football is too tactical and less creative than it used to be." },
      { id: "football-q-2", text: "International trophies should matter more than club trophies in legacy debates." },
      { id: "football-q-3", text: "A player can be world-class even without elite pace." },
      { id: "football-q-4", text: "Financial power has damaged competitive balance in football." },
      { id: "football-q-5", text: "VAR has improved football more than it has harmed it." },
      { id: "football-q-6", text: "Managers matter more than star players in winning major trophies." },
      { id: "football-q-7", text: "The Ballon d'Or overvalues attacking statistics." },
      { id: "football-q-8", text: "Local fans understand a club's identity better than global fans." },
      { id: "football-q-9", text: "A player should stay loyal to one club if they want legendary status." },
      { id: "football-q-10", text: "Football debates online are more tribal than analytical." }
    ]
  }
];

export let marginalityResponsesTable: MarginalityTestResponse[] = [
  {
    id: "resp-1",
    testId: "football-tribalism-and-legacy",
    userId: "demo-user",
    categoryValues: { age: 31, country: "Romania", footballWatchingLevel: "Weekly", favoriteClub: "Barcelona" },
    submittedAt: new Date(),
    votes: [
      { questionId: "football-q-1", agreement: 82 },
      { questionId: "football-q-2", agreement: 68 },
      { questionId: "football-q-3", agreement: 90 },
      { questionId: "football-q-4", agreement: 74 },
      { questionId: "football-q-5", agreement: 40 },
      { questionId: "football-q-6", agreement: 63 },
      { questionId: "football-q-7", agreement: 79 },
      { questionId: "football-q-8", agreement: 58 },
      { questionId: "football-q-9", agreement: 25 },
      { questionId: "football-q-10", agreement: 88 }
    ]
  },
  {
    id: "resp-2",
    testId: "football-tribalism-and-legacy",
    userId: "user-spain-1",
    categoryValues: { age: 24, country: "Spain", footballWatchingLevel: "Obsessed", favoriteClub: "Real Madrid" },
    submittedAt: new Date(),
    votes: [
      { questionId: "football-q-1", agreement: 51 },
      { questionId: "football-q-2", agreement: 44 },
      { questionId: "football-q-3", agreement: 67 },
      { questionId: "football-q-4", agreement: 58 },
      { questionId: "football-q-5", agreement: 35 },
      { questionId: "football-q-6", agreement: 49 },
      { questionId: "football-q-7", agreement: 72 },
      { questionId: "football-q-8", agreement: 36 },
      { questionId: "football-q-9", agreement: 19 },
      { questionId: "football-q-10", agreement: 84 }
    ]
  },
  {
    id: "resp-3",
    testId: "football-tribalism-and-legacy",
    userId: "user-england-1",
    categoryValues: { age: 49, country: "England", footballWatchingLevel: "Weekly", favoriteClub: "Liverpool" },
    submittedAt: new Date(),
    votes: [
      { questionId: "football-q-1", agreement: 76 },
      { questionId: "football-q-2", agreement: 83 },
      { questionId: "football-q-3", agreement: 63 },
      { questionId: "football-q-4", agreement: 71 },
      { questionId: "football-q-5", agreement: 48 },
      { questionId: "football-q-6", agreement: 55 },
      { questionId: "football-q-7", agreement: 61 },
      { questionId: "football-q-8", agreement: 64 },
      { questionId: "football-q-9", agreement: 47 },
      { questionId: "football-q-10", agreement: 67 }
    ]
  },
  {
    id: "resp-4",
    testId: "football-tribalism-and-legacy",
    userId: "user-germany-1",
    categoryValues: { age: 66, country: "Germany", footballWatchingLevel: "Casual" },
    submittedAt: new Date(),
    votes: [
      { questionId: "football-q-1", agreement: 69 },
      { questionId: "football-q-2", agreement: 72 },
      { questionId: "football-q-3", agreement: 52 },
      { questionId: "football-q-4", agreement: 65 },
      { questionId: "football-q-5", agreement: 54 },
      { questionId: "football-q-6", agreement: 60 },
      { questionId: "football-q-7", agreement: 57 },
      { questionId: "football-q-8", agreement: 71 },
      { questionId: "football-q-9", agreement: 59 },
      { questionId: "football-q-10", agreement: 46 }
    ]
  },
  {
    id: "resp-5",
    testId: "football-tribalism-and-legacy",
    userId: "user-argentina-1",
    categoryValues: { age: 36, country: "Argentina", footballWatchingLevel: "Obsessed", favoriteClub: "River Plate" },
    submittedAt: new Date(),
    votes: [
      { questionId: "football-q-1", agreement: 61 },
      { questionId: "football-q-2", agreement: 79 },
      { questionId: "football-q-3", agreement: 86 },
      { questionId: "football-q-4", agreement: 62 },
      { questionId: "football-q-5", agreement: 29 },
      { questionId: "football-q-6", agreement: 51 },
      { questionId: "football-q-7", agreement: 70 },
      { questionId: "football-q-8", agreement: 43 },
      { questionId: "football-q-9", agreement: 21 },
      { questionId: "football-q-10", agreement: 81 }
    ]
  }
];

export let userVotesTable: UserVotes = {};

export const resetDatabase = () => {
  usersTable = [];
  pollsTable = [];
  marginalityTestsTable = [];
  marginalityResponsesTable = [];
  userVotesTable = {};
};

export const pollListsTable: PollList[] = [];
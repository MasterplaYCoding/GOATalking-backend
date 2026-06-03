import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// We instantiate a local prisma client here just for the seed script 
// to avoid any import path issues with src/db.ts
const prisma = new PrismaClient();

async function main() {
  console.log('Starting full database seed...');

  console.log('Seeding Roles and Permissions...');
  
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin" }
  });

  const userRole = await prisma.role.upsert({
    where: { name: "User" },
    update: {},
    create: { name: "User" }
  });

  const baseEmail = process.env.SEED_BASE_EMAIL || "fallback@gmail.com";
  const [name, domain] = baseEmail.split('@');

  const adminEmail = `${name}+admin@${domain}`;
  const user1Email = `${name}+user1@${domain}`;
  const user2Email = `${name}+user2@${domain}`;
  const user3Email = `${name}+user3@${domain}`;
  const user4Email = `${name}+user4@${domain}`;
  const user5Email = `${name}+user5@${domain}`;

  await prisma.permission.upsert({
    where: { name: "FULL_ACCESS" },
    update: { roles: { connect: { id: adminRole.id } } },
    create: { name: "FULL_ACCESS", roles: { connect: { id: adminRole.id } } }
  });

  await prisma.permission.upsert({
    where: { name: "RESTRICTED_ACCESS" },
    update: { roles: { connect: { id: userRole.id } } },
    create: { name: "RESTRICTED_ACCESS", roles: { connect: { id: userRole.id } } }
  });

  const users = [
    { id: "demo-user", username: "demo-user", email: adminEmail, passwordHash: "parola", avatarUrl: "", roleId: adminRole.id },
    { id: "other-user", username: "other-user", email: user1Email, passwordHash: "parola", avatarUrl: "", roleId: userRole.id },
    { id: "user-spain-1", username: "user-spain-1", email: user2Email, passwordHash: "parola", avatarUrl: "", roleId: userRole.id },
    { id: "user-england-1", username: "user-england-1", email: user3Email, passwordHash: "parola", avatarUrl: "", roleId: userRole.id },
    { id: "user-germany-1", username: "user-germany-1", email: user4Email, passwordHash: "parola", avatarUrl: "", roleId: userRole.id },
    { id: "user-argentina-1", username: "user-argentina-1", email: user5Email, passwordHash: "parola", avatarUrl: "", roleId: userRole.id }
  ];

  for (const u of users) {
    await prisma.user.upsert({ 
      where: { id: u.id }, 
      update: { 
        email: u.email, 
        passwordHash: u.passwordHash, 
        username: u.username,
        roleId: u.roleId 
      }, 
      create: u 
    });
  }
  console.log('✅ Roles, Permissions, and 6 Users seeded');

  const polls = [
    {
      id: "poll-1", title: "Who is the greatest football player of all time?", category: "Sports", description: "Use this page to shape the final poll details view and interactions.", imageUrl: "https://www.livemint.com/lm-img/img/2025/06/20/optimize/lionel_messi_Cristiano_ronaldo_1750427785706_1750427788080.jpg", ownerId: "other-user",
      options: [ { text: "Lionel Messi", votes: 120 }, { text: "Cristiano Ronaldo", votes: 95 }, { text: "Pelé", votes: 40 }, { text: "Diego Maradona", votes: 25 }, { text: "Johan Cruyff", votes: 15 }, { text: "Zinedine Zidane", votes: 5 } ]
    },
    {
      id: "poll-4", title: "What is the ultimate fast food burger?", category: "Food", description: "The debate that tears friendships apart. Vote for your favorite tier-1 burger.", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1000", ownerId: "other-user",
      options: [ { text: "Five Guys", votes: 420 }, { text: "In-N-Out", votes: 150 }, { text: "Shake Shack", votes: 100 }, { text: "McDonald's Quarter Pounder", votes: 50 }, { text: "Burger King Whopper", votes: 30 } ]
    },
    {
      id: "poll-2", title: "What is the best programming language for beginners?", category: "Technology", description: "Cast your vote on the best language to start a software engineering journey.", imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=1000", ownerId: "other-user",
      options: [ { text: "Python", votes: 55 }, { text: "JavaScript", votes: 30 }, { text: "TypeScript", votes: 20 }, { text: "Java", votes: 10 }, { text: "C++", votes: 3 }, { text: "Ruby", votes: 2 } ]
    },
    {
      id: "poll-3", title: "Which sci-fi franchise is the absolute best?", category: "Entertainment", description: "From lightsabers to the spice melange, which universe reigns supreme?", imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1000", ownerId: "other-user",
      options: [ { text: "Star Wars", votes: 200 }, { text: "Star Trek", votes: 195 }, { text: "The Matrix", votes: 190 }, { text: "Dune", votes: 150 }, { text: "Alien", votes: 65 } ]
    },
    {
      id: "poll-5", title: "Where is your dream travel destination?", category: "Travel", description: "If money and time were no object, where are you booking your next flight?", imageUrl: "https://images.unsplash.com/photo-1488646953014-c8bf21d49246?auto=format&fit=crop&q=80&w=1000", ownerId: "other-user",
      options: [ { text: "Japan", votes: 28 }, { text: "Italy", votes: 5 }, { text: "New Zealand", votes: 4 }, { text: "Iceland", votes: 2 }, { text: "Peru (Machu Picchu)", votes: 1 } ]
    },
    {
      id: "poll-6", title: "What is your go-to morning beverage?", category: "Lifestyle", description: "How do you start your day?", imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1000", ownerId: "demo-user",
      options: [ { text: "Coffee", votes: 2 }, { text: "Tea", votes: 2 }, { text: "Water", votes: 2 }, { text: "Juice", votes: 2 } ]
    },
    {
      id: "poll-7", title: "What is the best season of the year?", category: "General", description: "Which season has the best vibes, weather, and holidays?", imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1000", ownerId: "demo-user",
      options: [ { text: "Autumn", votes: 24 }, { text: "Summer", votes: 4 }, { text: "Spring", votes: 3 }, { text: "Winter", votes: 1 } ]
    },
    {
      id: "poll-8", title: "Are you a dog person or a cat person?", category: "Pets", description: "The classic debate. Pick your side.", imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1000", ownerId: "demo-user",
      options: [ { text: "Dogs", votes: 75 }, { text: "Cats", votes: 5 }, { text: "Neither", votes: 5 } ]
    },
    {
      id: "poll-9", title: "Which superpower would you choose?", category: "Entertainment", description: "If you could only pick one superpower to have for the rest of your life.", imageUrl: "https://images.unsplash.com/photo-1612450371728-6617594fa7a0?auto=format&fit=crop&q=80&w=1000", ownerId: "demo-user",
      options: [ { text: "Teleportation", votes: 80 }, { text: "Flight", votes: 60 }, { text: "Time Travel", votes: 40 }, { text: "Invisibility", votes: 20 } ]
    },
    {
      id: "poll-10", title: "What is the best streaming service right now?", category: "Entertainment", description: "Considering price, original content, and UI, who is winning the streaming wars?", imageUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=1000", ownerId: "demo-user",
      options: [ { text: "Netflix", votes: 330 }, { text: "HBO Max", votes: 150 }, { text: "Hulu", votes: 70 }, { text: "Disney+", votes: 50 } ]
    }
  ];

  for (const p of polls) {
    const totalVotes = p.options.reduce((sum, opt) => sum + opt.votes, 0);

    await prisma.pollOption.deleteMany({ where: { pollId: p.id } });
    await prisma.poll.upsert({
      where: { id: p.id },
      update: {
        title: p.title, description: p.description, imageUrl: p.imageUrl, interactionCount: totalVotes, options: { create: p.options }
      },
      create: {
        id: p.id, title: p.title, category: p.category, description: p.description, imageUrl: p.imageUrl, ownerId: p.ownerId, interactionCount: totalVotes,
        options: { create: p.options }
      }
    });
  }
  console.log('✅ 10 Polls seeded');

  const mTestId = "football-tribalism-and-legacy";
  await prisma.marginalityTestResponse.deleteMany({ where: { testId: mTestId } });
  await prisma.marginalityTest.deleteMany({ where: { id: mTestId } });

  await prisma.marginalityTest.create({
    data: {
      id: mTestId,
      title: "Football Tribalism and Legacy",
      topic: "Football",
      description: "Measure how your football opinions compare with supporters from different age groups, countries, and viewing habits.",
      categoryDefs: {
        create: [
          { id: "age", key: "age", label: "Age", inputType: "number", includeInQuestionStats: true, includeInReport: true },
          { 
            id: "ageGroup", key: "ageGroup", label: "Generation", inputType: "select",
            isDerived: true, derivedFromKey: "age", derivedStrategy: "ageGroupFromAge",
            includeInQuestionStats: true, includeInReport: true
          },
          { id: "country", key: "country", label: "Country", inputType: "text", includeInQuestionStats: true, includeInReport: true },
          { id: "footballWatchingLevel", key: "footballWatchingLevel", label: "Football Watching Level", inputType: "select", options: JSON.stringify(["Rarely", "Casual", "Weekly", "Obsessed"]), includeInQuestionStats: true, includeInReport: true },
          { id: "favoriteClub", key: "favoriteClub", label: "Favorite Club", inputType: "text", includeInQuestionStats: true, includeInReport: true }
        ]
      },
      questions: {
        create: [
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
    }
  });
  console.log('✅ Marginality Test seeded');

  const responses = [
    {
      userId: "demo-user",
      cats: [ { definitionId: "age", value: "31" }, { definitionId: "ageGroup", value: "Millennial" }, { definitionId: "country", value: "Romania" }, { definitionId: "footballWatchingLevel", value: "Weekly" }, { definitionId: "favoriteClub", value: "Barcelona" } ],
      votes: [ { questionId: "football-q-1", agreement: 82 }, { questionId: "football-q-2", agreement: 68 }, { questionId: "football-q-3", agreement: 90 }, { questionId: "football-q-4", agreement: 74 }, { questionId: "football-q-5", agreement: 40 }, { questionId: "football-q-6", agreement: 63 }, { questionId: "football-q-7", agreement: 79 }, { questionId: "football-q-8", agreement: 58 }, { questionId: "football-q-9", agreement: 25 }, { questionId: "football-q-10", agreement: 88 } ]
    },
    {
      userId: "user-spain-1",
      cats: [ { definitionId: "age", value: "24" }, { definitionId: "ageGroup", value: "GenZ" }, { definitionId: "country", value: "Spain" }, { definitionId: "footballWatchingLevel", value: "Obsessed" }, { definitionId: "favoriteClub", value: "Real Madrid" } ],
      votes: [ { questionId: "football-q-1", agreement: 51 }, { questionId: "football-q-2", agreement: 44 }, { questionId: "football-q-3", agreement: 67 }, { questionId: "football-q-4", agreement: 58 }, { questionId: "football-q-5", agreement: 35 }, { questionId: "football-q-6", agreement: 49 }, { questionId: "football-q-7", agreement: 72 }, { questionId: "football-q-8", agreement: 36 }, { questionId: "football-q-9", agreement: 19 }, { questionId: "football-q-10", agreement: 84 } ]
    },
    {
      userId: "user-england-1",
      cats: [ { definitionId: "age", value: "49" }, { definitionId: "ageGroup", value: "GenX" }, { definitionId: "country", value: "England" }, { definitionId: "footballWatchingLevel", value: "Weekly" }, { definitionId: "favoriteClub", value: "Liverpool" } ],
      votes: [ { questionId: "football-q-1", agreement: 76 }, { questionId: "football-q-2", agreement: 83 }, { questionId: "football-q-3", agreement: 63 }, { questionId: "football-q-4", agreement: 71 }, { questionId: "football-q-5", agreement: 48 }, { questionId: "football-q-6", agreement: 55 }, { questionId: "football-q-7", agreement: 61 }, { questionId: "football-q-8", agreement: 64 }, { questionId: "football-q-9", agreement: 47 }, { questionId: "football-q-10", agreement: 67 } ]
    },
    {
      userId: "user-germany-1",
      cats: [ { definitionId: "age", value: "66" }, { definitionId: "ageGroup", value: "Boomer" }, { definitionId: "country", value: "Germany" }, { definitionId: "footballWatchingLevel", value: "Casual" } ],
      votes: [ { questionId: "football-q-1", agreement: 69 }, { questionId: "football-q-2", agreement: 72 }, { questionId: "football-q-3", agreement: 52 }, { questionId: "football-q-4", agreement: 65 }, { questionId: "football-q-5", agreement: 54 }, { questionId: "football-q-6", agreement: 60 }, { questionId: "football-q-7", agreement: 57 }, { questionId: "football-q-8", agreement: 71 }, { questionId: "football-q-9", agreement: 59 }, { questionId: "football-q-10", agreement: 46 } ]
    },
    {
      userId: "user-argentina-1",
      cats: [ { definitionId: "age", value: "36" }, { definitionId: "ageGroup", value: "Millennial" }, { definitionId: "country", value: "Argentina" }, { definitionId: "footballWatchingLevel", value: "Obsessed" }, { definitionId: "favoriteClub", value: "River Plate" } ],
      votes: [ { questionId: "football-q-1", agreement: 61 }, { questionId: "football-q-2", agreement: 79 }, { questionId: "football-q-3", agreement: 86 }, { questionId: "football-q-4", agreement: 62 }, { questionId: "football-q-5", agreement: 29 }, { questionId: "football-q-6", agreement: 51 }, { questionId: "football-q-7", agreement: 70 }, { questionId: "football-q-8", agreement: 43 }, { questionId: "football-q-9", agreement: 21 }, { questionId: "football-q-10", agreement: 81 } ]
    }
  ];

  for (const resp of responses) {
    await prisma.marginalityTestResponse.create({
      data: {
        testId: mTestId,
        userId: resp.userId,
        categoryValues: { createMany: { data: resp.cats } },
        votes: { createMany: { data: resp.votes } }
      }
    });
  }
  console.log('✅ 5 Marginality Responses seeded');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    // @ts-ignore
    process.exit(1);
  });
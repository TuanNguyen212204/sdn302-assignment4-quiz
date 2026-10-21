require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("./models/user");
const Question = require("./models/question");
const Quiz = require("./models/quiz");
const database = require("./config/database");

const sampleQuestions = [
  {
    text: "Who developed the theory of relativity?",
    options: [
      "Albert Einstein",
      "Isaac Newton",
      "Galileo Galilei",
      "Nikola Tesla",
    ],
    correctAnswerIndex: 0,
    keywords: ["science", "physics"],
  },
  {
    text: "What is the symbol for iron on the periodic table?",
    options: ["Fe", "I", "Au", "Ag"],
    correctAnswerIndex: 0,
    keywords: ["science", "chemistry"],
  },
  {
    text: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    correctAnswerIndex: 0,
    keywords: ["capital", "France"],
  },
  {
    text: "What is the capital of England?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    correctAnswerIndex: 1,
    keywords: ["capital", "England"],
  },
  {
    text: "What is the capital of Germany?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    correctAnswerIndex: 2,
    keywords: ["capital", "Germany"],
  },
];

async function createUser(username, password, admin) {
  const existingUser = await User.findOne({ username: username });
  if (existingUser) {
    console.log("Keeping existing account: " + username);
    return;
  }
  if (!password || password.length < 6 || Buffer.byteLength(password) > 72) {
    throw new Error("Set valid seed passwords in .env before seeding");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    username: username,
    password: passwordHash,
    admin: admin,
  });
  console.log("Created " + (admin ? "admin" : "user") + ": " + username);
}

async function seed() {
  await database.connectDatabase();
  await createUser(
    process.env.SEED_ADMIN_USERNAME || "Mary",
    process.env.SEED_ADMIN_PASSWORD,
    true,
  );
  await createUser(
    process.env.SEED_USER_USERNAME || "John",
    process.env.SEED_USER_PASSWORD,
    false,
  );

  const questionIds = [];
  for (const sample of sampleQuestions) {
    let question = await Question.findOne({ text: sample.text });
    if (!question) {
      question = await Question.create(sample);
    }
    questionIds.push(question._id);
  }

  const existingQuiz = await Quiz.findOne({ title: "General Knowledge" });
  if (!existingQuiz) {
    await Quiz.create({
      title: "General Knowledge",
      description: "Five questions about science and world capitals.",
      questions: questionIds,
    });
  }
  console.log("Sample data is ready. Existing records were kept.");
}

seed()
  .catch(function (error) {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async function () {
    await database.disconnectDatabase();
  });

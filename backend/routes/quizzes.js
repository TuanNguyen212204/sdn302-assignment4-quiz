const express = require("express");
const mongoose = require("mongoose");
const Quiz = require("../models/quiz");
const Question = require("../models/question");
const authenticate = require("../authenticate");

const router = express.Router();
router.use(authenticate.verifyUser);

function quizFields(body) {
  const fields = {};
  const names = ["title", "description", "questions"];
  for (const name of names) {
    if (body[name] !== undefined) {
      fields[name] = body[name];
    }
  }
  return fields;
}

async function validateQuestionIds(fields) {
  if (fields.questions === undefined) {
    return;
  }
  if (!Array.isArray(fields.questions)) {
    throw Object.assign(
      new Error("Questions must be an array of question IDs"),
      { status: 400 },
    );
  }
  for (const questionId of fields.questions) {
    if (!mongoose.isValidObjectId(questionId)) {
      throw Object.assign(new Error("Invalid question ID"), { status: 400 });
    }
  }
  const uniqueIds = [...new Set(fields.questions)];
  const count = await Question.countDocuments({ _id: { $in: uniqueIds } });
  if (
    count !== uniqueIds.length ||
    uniqueIds.length !== fields.questions.length
  ) {
    throw Object.assign(
      new Error("Questions must exist and must not be repeated"),
      { status: 400 },
    );
  }
}

function populateQuestions(user) {
  if (user.admin) {
    return { path: "questions" };
  }
  return { path: "questions", select: "-correctAnswerIndex" };
}

router.get("/", async function (req, res) {
  const quizzes = await Quiz.find()
    .populate(populateQuestions(req.user))
    .sort({ createdAt: 1 });
  res.json(quizzes);
});

router.post("/", authenticate.verifyAdmin, async function (req, res) {
  const fields = quizFields(req.body);
  await validateQuestionIds(fields);
  const quiz = await Quiz.create(fields);
  await quiz.populate("questions");
  res.status(201).json(quiz);
});

router.post("/:quizId/submit", async function (req, res) {
  const quiz = await Quiz.findById(req.params.quizId).populate("questions");
  if (!quiz) {
    res.status(404).json({ message: "Quiz not found" });
    return;
  }
  if (quiz.questions.length === 0) {
    res.status(400).json({ message: "This quiz has no questions" });
    return;
  }

  const answers = req.body.answers;
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
    res.status(400).json({ message: "Please answer every question" });
    return;
  }

  let score = 0;
  for (let index = 0; index < quiz.questions.length; index += 1) {
    const question = quiz.questions[index];
    const answer = answers[index];
    if (
      !Number.isInteger(answer) ||
      answer < 0 ||
      answer >= question.options.length
    ) {
      res
        .status(400)
        .json({ message: "An answer does not match an available option" });
      return;
    }
    if (answer === question.correctAnswerIndex) {
      score += 1;
    }
  }
  res.json({ score: score, total: quiz.questions.length });
});

router.get("/:quizId", async function (req, res) {
  const quiz = await Quiz.findById(req.params.quizId).populate(
    populateQuestions(req.user),
  );
  if (!quiz) {
    res.status(404).json({ message: "Quiz not found" });
    return;
  }
  res.json(quiz);
});

router.put("/:quizId", authenticate.verifyAdmin, async function (req, res) {
  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) {
    res.status(404).json({ message: "Quiz not found" });
    return;
  }
  const fields = quizFields(req.body);
  await validateQuestionIds(fields);
  quiz.set(fields);
  await quiz.save();
  await quiz.populate("questions");
  res.json(quiz);
});

router.delete("/:quizId", authenticate.verifyAdmin, async function (req, res) {
  const quiz = await Quiz.findByIdAndDelete(req.params.quizId);
  if (!quiz) {
    res.status(404).json({ message: "Quiz not found" });
    return;
  }
  res.json({ message: "Quiz deleted" });
});

module.exports = router;

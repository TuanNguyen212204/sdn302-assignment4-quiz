const express = require("express");
const Question = require("../models/question");
const Quiz = require("../models/quiz");
const authenticate = require("../authenticate");

const router = express.Router();

function questionFields(body) {
  const fields = {};
  const names = ["text", "options", "keywords", "correctAnswerIndex"];
  for (const name of names) {
    if (body[name] !== undefined) {
      fields[name] = body[name];
    }
  }
  return fields;
}

// Regular users get questions only as part of a quiz, without answer keys.
router.use(authenticate.verifyUser, authenticate.verifyAdmin);

router.get("/", async function (req, res) {
  const questions = await Question.find().sort({ createdAt: -1 });
  res.json(questions);
});

router.post("/", async function (req, res) {
  const question = await Question.create(questionFields(req.body));
  res.status(201).json(question);
});

router.get("/:questionId", async function (req, res) {
  const question = await Question.findById(req.params.questionId);
  if (!question) {
    res.status(404).json({ message: "Question not found" });
    return;
  }
  res.json(question);
});

router.put("/:questionId", async function (req, res) {
  const question = await Question.findById(req.params.questionId);
  if (!question) {
    res.status(404).json({ message: "Question not found" });
    return;
  }
  question.set(questionFields(req.body));
  await question.save();
  res.json(question);
});

router.delete("/:questionId", async function (req, res) {
  const question = await Question.findByIdAndDelete(req.params.questionId);
  if (!question) {
    res.status(404).json({ message: "Question not found" });
    return;
  }
  await Quiz.updateMany(
    { questions: question._id },
    { $pull: { questions: question._id } },
  );
  res.json({ message: "Question deleted" });
});

module.exports = router;

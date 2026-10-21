import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  fetchQuiz,
  nextQuestion,
  restartQuiz,
  selectAnswer,
  submitQuiz,
} from "../store/quizSlice";

export default function TakeQuizPage() {
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const quizState = useSelector(function (state) {
    return state.quizzes;
  });

  useEffect(
    function () {
      dispatch(fetchQuiz(quizId));
    },
    [dispatch, quizId],
  );

  if (quizState.status === "loading") {
    return <p className="text-center my-5">Loading quiz...</p>;
  }
  if (!quizState.currentQuiz) {
    return (
      <div className="alert alert-danger my-4" role="alert">
        {quizState.error || "Quiz not found"}{" "}
        <Link to="/dashboard/quiz">Back to quizzes</Link>
      </div>
    );
  }
  if (quizState.result) {
    return (
      <section className="quiz-completed">
        <h2>Quiz Completed</h2>
        <p>Your score: {quizState.result.score}</p>
        <p className="score-total">
          {quizState.result.score} / {quizState.result.total} correct answers
        </p>
        <button
          className="btn btn-primary"
          onClick={function () {
            dispatch(restartQuiz());
          }}
        >
          Restart Quiz
        </button>
        <div className="mt-3">
          <Link to="/dashboard/quiz">Back to quizzes</Link>
        </div>
      </section>
    );
  }

  const quiz = quizState.currentQuiz;
  if (quiz.questions.length === 0) {
    return (
      <p className="my-5 text-center">
        This quiz has no questions.{" "}
        <Link to="/dashboard/quiz">Back to quizzes</Link>
      </p>
    );
  }
  const question = quiz.questions[quizState.questionIndex];
  const selectedAnswer = quizState.answers[quizState.questionIndex];

  function handleSubmit(event) {
    event.preventDefault();
    if (selectedAnswer === undefined) {
      return;
    }
    const lastQuestion = quizState.questionIndex === quiz.questions.length - 1;
    if (lastQuestion) {
      dispatch(submitQuiz());
    } else {
      dispatch(nextQuestion());
    }
  }

  return (
    <section className="take-quiz">
      <h2>Quiz</h2>
      <p className="question-progress">
        Question {quizState.questionIndex + 1} of {quiz.questions.length}
      </p>
      {quizState.error && (
        <div className="alert alert-danger" role="alert">
          {quizState.error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>{question.text}</legend>
          {question.options.map(function (option, index) {
            return (
              <div className="form-check" key={index}>
                <input
                  className="form-check-input"
                  id={"answer-" + index}
                  type="radio"
                  name="answer"
                  checked={selectedAnswer === index}
                  onChange={function () {
                    dispatch(selectAnswer(index));
                  }}
                />
                <label className="form-check-label" htmlFor={"answer-" + index}>
                  {option}
                </label>
              </div>
            );
          })}
        </fieldset>
        <button
          className="btn btn-primary mt-4"
          disabled={selectedAnswer === undefined || quizState.submitting}
        >
          {quizState.submitting ? "Submitting..." : "Submit Answer"}
        </button>
      </form>
    </section>
  );
}

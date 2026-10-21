import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchQuizzes } from "../store/quizSlice";

export default function QuizListPage() {
  const dispatch = useDispatch();
  const quizzes = useSelector(function (state) {
    return state.quizzes;
  });

  useEffect(
    function () {
      dispatch(fetchQuizzes());
    },
    [dispatch],
  );

  return (
    <section className="content-section">
      <h2>Quizzes</h2>
      {quizzes.status === "loading" && <p>Loading quizzes...</p>}
      {quizzes.error && (
        <div className="alert alert-danger" role="alert">
          {quizzes.error}
          <button
            className="btn btn-link"
            onClick={function () {
              dispatch(fetchQuizzes());
            }}
          >
            Try again
          </button>
        </div>
      )}
      {quizzes.status === "succeeded" && quizzes.items.length === 0 && (
        <p>No quizzes are available yet.</p>
      )}
      <div className="list-group">
        {quizzes.items.map(function (quiz) {
          return (
            <div key={quiz._id} className="list-group-item quiz-list-item">
              <div>
                <h3 className="h4">{quiz.title}</h3>
                <p className="mb-1">{quiz.description}</p>
                <small>{quiz.questions.length} questions</small>
              </div>
              {quiz.questions.length > 0 ? (
                <Link
                  className="btn btn-primary"
                  to={"/dashboard/quiz/" + quiz._id}
                >
                  Start Quiz
                </Link>
              ) : (
                <span className="text-muted">No questions</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

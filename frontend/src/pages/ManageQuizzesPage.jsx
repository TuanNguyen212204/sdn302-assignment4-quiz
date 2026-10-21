import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiRequest } from "../services/api";

const emptyForm = { title: "", description: "", questions: [] };

export default function ManageQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = useSelector(function (state) {
    return state.auth.token;
  });

  useEffect(
    function () {
      let active = true;
      Promise.all([
        apiRequest("/quizzes", { token: token }),
        apiRequest("/questions", { token: token }),
      ])
        .then(function (data) {
          if (active) {
            setQuizzes(data[0]);
            setQuestions(data[1]);
          }
        })
        .catch(function (requestError) {
          if (active) {
            setError(requestError.message);
          }
        })
        .finally(function () {
          if (active) {
            setLoading(false);
          }
        });
      return function () {
        active = false;
      };
    },
    [token],
  );

  function updateField(name, value) {
    setForm(function (previous) {
      return { ...previous, [name]: value };
    });
  }

  function toggleQuestion(questionId, checked) {
    let selectedQuestions;
    if (checked) {
      selectedQuestions = [...form.questions, questionId];
    } else {
      selectedQuestions = form.questions.filter(function (id) {
        return id !== questionId;
      });
    }
    updateField("questions", selectedQuestions);
  }

  function cancelEditing() {
    setEditingId("");
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const path = editingId ? "/quizzes/" + editingId : "/quizzes";
      const method = editingId ? "PUT" : "POST";
      await apiRequest(path, { method: method, token: token, body: form });
      setQuizzes(await apiRequest("/quizzes", { token: token }));
      setMessage(editingId ? "Quiz updated." : "Quiz added.");
      cancelEditing();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  function startEditing(quiz) {
    setEditingId(quiz._id);
    setForm({
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions.map(function (question) {
        return question._id;
      }),
    });
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteQuiz(quiz) {
    if (
      !window.confirm(
        "Delete this quiz? Its questions will stay in the question bank.",
      )
    ) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiRequest("/quizzes/" + quiz._id, {
        method: "DELETE",
        token: token,
      });
      setQuizzes(
        quizzes.filter(function (item) {
          return item._id !== quiz._id;
        }),
      );
      if (editingId === quiz._id) {
        cancelEditing();
      }
      setMessage("Quiz deleted.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="content-section">
      <h2>Quizzes</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}
      <form className="border rounded p-3 mb-4" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="quizTitle">
            Title
          </label>
          <input
            id="quizTitle"
            className="form-control"
            required
            value={form.title}
            onChange={function (event) {
              updateField("title", event.target.value);
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="form-control"
            required
            value={form.description}
            onChange={function (event) {
              updateField("description", event.target.value);
            }}
          />
        </div>
        <fieldset className="mb-3 question-picker">
          <legend className="fs-5">Questions</legend>
          {questions.map(function (question) {
            return (
              <div className="form-check" key={question._id}>
                <input
                  id={"question-" + question._id}
                  className="form-check-input"
                  type="checkbox"
                  checked={form.questions.includes(question._id)}
                  onChange={function (event) {
                    toggleQuestion(question._id, event.target.checked);
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor={"question-" + question._id}
                >
                  {question.text}
                </label>
              </div>
            );
          })}
          {!loading && questions.length === 0 && (
            <p>Create a question first, or save an empty quiz.</p>
          )}
        </fieldset>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : editingId ? "Update Quiz" : "Add Quiz"}
        </button>
        {editingId && (
          <button
            className="btn btn-secondary ms-2"
            type="button"
            onClick={cancelEditing}
          >
            Cancel
          </button>
        )}
      </form>
      {loading && <p>Loading quizzes...</p>}
      {!loading && quizzes.length === 0 && <p>No quizzes yet.</p>}
      <div className="list-group">
        {quizzes.map(function (quiz) {
          return (
            <article className="list-group-item p-3" key={quiz._id}>
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <ul>
                {quiz.questions.map(function (question) {
                  return <li key={question._id}>{question.text}</li>;
                })}
              </ul>
              <button
                className="btn btn-warning me-1"
                disabled={saving}
                onClick={function () {
                  startEditing(quiz);
                }}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                disabled={saving}
                onClick={function () {
                  deleteQuiz(quiz);
                }}
              >
                Delete
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiRequest } from "../services/api";

function emptyForm() {
  return {
    text: "",
    options: ["", "", "", ""],
    keywords: "",
    correctAnswerIndex: 0,
  };
}

export default function ManageQuestionsPage() {
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
      apiRequest("/questions", { token: token })
        .then(function (data) {
          if (active) {
            setQuestions(data);
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

  function updateOption(index, value) {
    const options = [...form.options];
    options[index] = value;
    updateField("options", options);
  }

  function startEditing(question) {
    setEditingId(question._id);
    setForm({
      text: question.text,
      options: [...question.options],
      keywords: question.keywords.join(", "),
      correctAnswerIndex: question.correctAnswerIndex,
    });
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingId("");
    setForm(emptyForm());
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    const keywords = form.keywords
      .split(",")
      .map(function (keyword) {
        return keyword.trim();
      })
      .filter(Boolean);
    const body = {
      text: form.text.trim(),
      options: form.options,
      keywords: keywords,
      correctAnswerIndex: Number(form.correctAnswerIndex),
    };

    try {
      const path = editingId ? "/questions/" + editingId : "/questions";
      const method = editingId ? "PUT" : "POST";
      await apiRequest(path, { method: method, token: token, body: body });
      setQuestions(await apiRequest("/questions", { token: token }));
      setMessage(editingId ? "Question updated." : "Question added.");
      cancelEditing();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion(question) {
    if (
      !window.confirm(
        "Delete this question? It will also be removed from its quizzes.",
      )
    ) {
      return;
    }
    setError("");
    setMessage("");
    setSaving(true);
    try {
      await apiRequest("/questions/" + question._id, {
        method: "DELETE",
        token: token,
      });
      setQuestions(
        questions.filter(function (item) {
          return item._id !== question._id;
        }),
      );
      if (editingId === question._id) {
        cancelEditing();
      }
      setMessage("Question deleted.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="content-section question-management">
      <h2>Questions</h2>
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
      <form
        className="border rounded p-3 mb-4 question-form"
        onSubmit={handleSubmit}
      >
        <div className="form-row">
          <label htmlFor="questionText">Question Text:</label>
          <input
            id="questionText"
            className="form-control"
            required
            value={form.text}
            onChange={function (event) {
              updateField("text", event.target.value);
            }}
          />
        </div>
        <div className="form-row align-items-start">
          <span>Options:</span>
          <div>
            {form.options.map(function (option, index) {
              return (
                <input
                  key={index}
                  className="form-control mb-2"
                  aria-label={"Option " + (index + 1)}
                  required
                  value={option}
                  onChange={function (event) {
                    updateOption(index, event.target.value);
                  }}
                />
              );
            })}
          </div>
        </div>
        <div className="form-row">
          <label htmlFor="answerIndex">Correct Answer Index:</label>
          <input
            id="answerIndex"
            className="form-control"
            type="number"
            min="0"
            max={form.options.length - 1}
            step="1"
            required
            value={form.correctAnswerIndex}
            onChange={function (event) {
              updateField("correctAnswerIndex", event.target.value);
            }}
          />
        </div>
        <div className="form-row">
          <label htmlFor="keywords">Keywords:</label>
          <input
            id="keywords"
            className="form-control"
            placeholder="capital, geography"
            value={form.keywords}
            onChange={function (event) {
              updateField("keywords", event.target.value);
            }}
          />
        </div>
        <button className="btn btn-primary w-100" disabled={saving}>
          {saving
            ? "Saving..."
            : editingId
              ? "Update Question"
              : "Add Question"}
        </button>
        {editingId && (
          <button
            className="btn btn-secondary mt-2"
            type="button"
            onClick={cancelEditing}
          >
            Cancel
          </button>
        )}
      </form>
      {loading && <p>Loading questions...</p>}
      {!loading && questions.length === 0 && <p>No questions yet.</p>}
      <div className="list-group">
        {questions.map(function (question) {
          return (
            <article className="list-group-item p-3" key={question._id}>
              <h3>{question.text}</h3>
              <ul>
                {question.options.map(function (option, index) {
                  return <li key={index}>{option}</li>;
                })}
              </ul>
              <button
                className="btn btn-warning me-1"
                disabled={saving}
                onClick={function () {
                  startEditing(question);
                }}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                disabled={saving}
                onClick={function () {
                  deleteQuestion(question);
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

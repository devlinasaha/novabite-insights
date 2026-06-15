import { useState } from "react";
import { postChat } from "../api";

function Chat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const result = await postChat(question);
      setAnswer(result.answer);
      setHistory((prev) => [
        { question, answer: result.answer },
        ...prev,
      ]);
      setQuestion("");
    } catch (err) {
      console.error(err);
      setError("Something went wrong reaching the chat API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const exampleQuestions = [
    "Which region had the highest net revenue in Q1 2024?",
    "What is the gross profit margin for the Snacks category?",
    "Which sales rep closed the most units in 2025?",
    "Compare E-Commerce vs Modern Trade net revenue.",
    "What was the best performing product in the West region?",
  ];

  return (
    <div>
      <h1>Ask NovaBite Insights</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Which region had the highest net revenue in Q1 2024?"
          style={{ flex: 1, padding: "0.6rem", fontSize: "1rem" }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          style={{
            padding: "0.6rem 1.2rem",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      <div style={{ marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "0.85rem", color: "#666" }}>Try: </span>
        {exampleQuestions.map((q) => (
          <button
            key={q}
            onClick={() => setQuestion(q)}
            disabled={loading}
            style={{
              fontSize: "0.8rem",
              margin: "0.25rem",
              padding: "0.3rem 0.6rem",
              borderRadius: "4px",
              border: "1px solid #ddd",
              background: "#f9f9f9",
              color: "#333",
              cursor: "pointer",
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {loading && <p>Loading answer...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {answer && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1.5rem",
            background: "#f5f7ff",
          }}
        >
          <strong>Answer:</strong>
          <p style={{ marginTop: "0.5rem", lineHeight: 1.5 }}>{answer}</p>
        </div>
      )}

      {history.length > 1 && (
        <div>
          <h3>Previous questions</h3>
          {history.slice(1).map((item, i) => (
            <div key={i} style={{ marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #eee" }}>
              <div style={{ fontWeight: "bold" }}>{item.question}</div>
              <div style={{ marginTop: "0.25rem", color: "#444" }}>{item.answer}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Chat;
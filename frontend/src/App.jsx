import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <nav style={{ display: "flex", gap: "1rem", padding: "1rem", borderBottom: "1px solid #ddd" }}>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/chat">Chat</NavLink>
      </nav>

      <div style={{ padding: "1.5rem" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
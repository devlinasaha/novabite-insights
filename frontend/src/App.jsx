import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
          Dashboard
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => (isActive ? "active" : "")}>
          Chat
        </NavLink>
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
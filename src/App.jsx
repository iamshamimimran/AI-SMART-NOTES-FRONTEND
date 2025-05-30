import Login from "./components/Auth/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Auth/Register";
import Notes from "./components/Pages/Notes";
import Summeries from "./components/Pages/Summeries";
import Flashcards from "./components/Pages/Flashcards";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/summaries" element={<Summeries />} />
        <Route path="/flashcards" element={<Flashcards />} />
      </Routes>
    </Router>
  );
}

export default App;

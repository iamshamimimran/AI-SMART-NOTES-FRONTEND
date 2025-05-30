import { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { loginUser } from "../../services/authService";
import { useNavigate } from "react-router";
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await loginUser({ email, password });
      //   console.log("Login success:", data);
      sessionStorage.setItem("token", data.token);
      navigate("/notes");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-80 backdrop-blur-md rounded-lg p-8 max-w-md w-full shadow-lg"
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center tracking-wide">
          Welcome Back
        </h2>

        {error && (
          <p className="text-red-500 text-center mb-4 font-semibold">{error}</p>
        )}

        <div className="mb-5">
          <label
            htmlFor="email"
            className="flex items-center gap-2 text-gray-700 font-semibold mb-2"
          >
            <FaEnvelope /> Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
          />
        </div>

        <div className="mb-7">
          <label
            htmlFor="password"
            className="flex items-center gap-2 text-gray-700 font-semibold mb-2"
          >
            <FaLock /> Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your secure password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-pink-600 font-semibold hover:underline"
          >
            Register here
          </a>
        </p>
      </form>
    </div>
  );
}

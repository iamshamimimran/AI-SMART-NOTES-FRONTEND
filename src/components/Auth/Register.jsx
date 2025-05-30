import { useState } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { registerUser } from "../../services/authService";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await registerUser(formData);
      setSuccess("Registration successful! You can now log in.");
      setFormData({ username: "", email: "", password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
          Create Account
        </h2>

        {error && (
          <p className="text-red-500 text-center mb-4 font-semibold">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-center mb-4 font-semibold">
            {success}
          </p>
        )}

        <div className="mb-5">
          <label
            htmlFor="name"
            className="flex items-center gap-2 text-gray-700 font-semibold mb-2"
          >
            <FaUser /> Name
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={formData.username}
            onChange={handleChange}
            placeholder="Your full name"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
          />
        </div>

        <div className="mb-5">
          <label
            htmlFor="email"
            className="flex items-center gap-2 text-gray-700 font-semibold mb-2"
          >
            <FaEnvelope /> Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
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
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Choose a strong password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-pink-600 font-semibold hover:underline"
          >
            Login here
          </a>
        </p>
      </form>
    </div>
  );
}

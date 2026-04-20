import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      return alert("Fill all fields");
    }

    try {
      setLoading(true);

      await api.post("/register", {
        username,
        email,
        password
      });

      alert("Account created!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.error || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="bg-[#111827] p-8 rounded-2xl shadow-xl w-[350px] space-y-5 border border-gray-800">
        <h2 className="text-xl font-semibold text-white text-center">
          Task<span className="text-indigo-500">Pilot</span>
        </h2>

        <p className="text-gray-400 text-sm text-center">
          Create your account
        </p>

        <input
          className="w-full bg-gray-900 border border-gray-700 text-white p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full bg-gray-900 border border-gray-700 text-white p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full bg-gray-900 border border-gray-700 text-white p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-sm text-center text-gray-400">
          Already have an account?{" "}
          <Link to="/" className="text-indigo-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
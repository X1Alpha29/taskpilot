import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, Outlet } from "react-router-dom";
import api from "../services/api";

export default function Layout() {
  const { user, logout } = useAuth();
  console.log("USER:", user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This will delete your account permanently.")) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete("/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      logout();
      navigate("/");

    } catch (err) {
      console.log(err.response?.data);
      alert("Failed to delete account");
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-[#e5e7eb]">
      
      {/* 🔥 SIDEBAR */}
      <aside className="w-64 bg-[#111827] border-r border-gray-800 flex flex-col p-5">
        <h2 className="text-2xl font-bold mb-10 text-white">
          Task<span className="text-indigo-500">Pilot</span>
        </h2>

        <nav className="flex flex-col gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-indigo-400 transition">
            Dashboard
          </Link>

          <Link to="/projects" className="text-gray-400 hover:text-indigo-400 transition">
            Projects
          </Link>
        </nav>

        <div className="mt-auto">
          {user && (
            <div className="mb-4 flex items-center gap-3">
              
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                {user.username?.charAt(0).toUpperCase()}
              </div>

              <div className="text-sm text-gray-400">
                {user.username}
              </div>

            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full mt-2 border border-red-500/40 text-red-400 py-2 rounded-lg text-sm hover:bg-red-500/10 transition"
          >
            Delete Account
          </button>
        </div>
      </aside>

      {/* 🔥 MAIN AREA */}
      <div className="flex-1 flex flex-col">
        
        {/* HEADER */}
        <header className="bg-[#111827] border-b border-gray-800 px-6 py-4 flex justify-between items-center">
          <h3 className="font-semibold text-lg text-white">
            Task<span className="text-indigo-500">Pilot</span>
          </h3>
        </header>

        {/* CONTENT */}
        <main className="p-6 overflow-auto bg-[#0f172a]">
          <div className="max-w-6xl mx-auto">
            <Outlet /> {/* ✅ THIS FIXES EVERYTHING */}
          </div>
        </main>

      </div>
    </div>
  );
}
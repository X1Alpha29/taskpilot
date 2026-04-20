import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [projectStats, setProjectStats] = useState({});
  const [name, setName] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteProjectId, setDeleteProjectId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await api.get("/projects", {
      headers: { Authorization: `Bearer ${token}` }
    });

    setProjects(res.data);

    const stats = {};

    for (const p of res.data) {
      const t = await api.get(`/projects/${p.id}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const tasks = t.data;

      const total = tasks.length;
      const done = tasks.filter((x) => x.status === "done").length;
      const inProgress = tasks.filter((x) => x.status === "in-progress").length;
      const todo = tasks.filter((x) => x.status === "todo").length;

      const progress = total === 0 ? 0 : Math.round((done / total) * 100);

      stats[p.id] = {
        total,
        done,
        inProgress,
        todo,
        progress
      };
    }

    setProjectStats(stats);
  };

  const createProject = async () => {
    if (!name) return;

    await api.post(
      "/projects",
      { name },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setName("");
    fetchProjects();
  };

  const updateProject = async () => {
    await api.put(
      `/projects/${editingProject}`,
      { name: editName },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setEditingProject(null);
    setEditName("");
    fetchProjects();
  };

  const deleteProject = async () => {
    await api.delete(`/projects/${deleteProjectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setDeleteProjectId(null);
    fetchProjects();
  };

  return (
    <div className="space-y-6 text-white">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Projects</h2>

        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New project"
            className="bg-gray-900 border border-gray-700 text-white p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={createProject}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg text-sm transition"
          >
            Create
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-5">
        {projects.map((p) => {
          const stats = projectStats[p.id] || {
            total: 0,
            done: 0,
            inProgress: 0,
            todo: 0,
            progress: 0
          };

          return (
            <div
              key={p.id}
              className="bg-[#111827] p-5 rounded-xl border border-gray-800 hover:border-indigo-500 transition relative"
            >
              {/* ACTION BUTTONS */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProject(p.id);
                    setEditName(p.name);
                  }}
                  className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                >
                  ✏️
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteProjectId(p.id);
                  }}
                  className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                >
                  🗑
                </button>
              </div>

              {/* CLICKABLE AREA */}
              <div onClick={() => navigate(`/projects/${p.id}`)} className="cursor-pointer">
                <h3 className="font-semibold text-lg">{p.name}</h3>

                <p className="text-sm text-gray-400 mt-1">
                  {stats.total} tasks
                </p>

                {/* PROGRESS */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1 text-gray-500">
                    <span>Progress</span>
                    <span>{stats.progress}%</span>
                  </div>

                  <div className="w-full bg-gray-800 h-2 rounded">
                    <div
                      className="bg-indigo-500 h-2 rounded transition-all"
                      style={{ width: `${stats.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs mt-4 text-gray-500">
                  <span>📝 {stats.todo}</span>
                  <span>⚡ {stats.inProgress}</span>
                  <span>✅ {stats.done}</span>
                </div>

                <div className="text-xs text-gray-500 mt-4 hover:text-white transition">
                  Open project →
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY */}
      {projects.length === 0 && (
        <div className="text-center text-gray-400 mt-10">
          No projects yet — create your first one 🚀
        </div>
      )}

      {/* EDIT MODAL */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-[#111827] p-6 rounded-xl w-[350px] space-y-4 border border-gray-800 text-white">
            <h3 className="font-semibold">Edit Project</h3>

            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-white p-2 rounded-lg w-full"
            />

            <div className="flex gap-2">
              <button
                onClick={updateProject}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded"
              >
                Save
              </button>

              <button
                onClick={() => setEditingProject(null)}
                className="flex-1 bg-gray-700 text-white hover:bg-gray-600 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteProjectId && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-[#111827] p-6 rounded-xl w-[350px] space-y-4 text-center border border-gray-800 text-white">
            <h3 className="font-semibold text-lg text-white">
              Delete Project?
            </h3>

            <p className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition">
              This action cannot be undone.
            </p>

            <div className="flex gap-2">
              <button
                onClick={deleteProject}
                className="flex-1 bg-red-500 text-white py-2 rounded"
              >
                Delete
              </button>

              <button
                onClick={() => setDeleteProjectId(null)}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
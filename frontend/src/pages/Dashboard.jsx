import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await api.get("/projects", {
      headers: { Authorization: `Bearer ${token}` }
    });

    setProjects(res.data);

    // 🔥 Fetch tasks for all projects
    let allTasks = [];

    for (const p of res.data) {
      const t = await api.get(`/projects/${p.id}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      allTasks = [...allTasks, ...t.data];
    }

    setTasks(allTasks);
  };

  const stats = {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length
  };

  return (
    <div className="space-y-6 text-white">
      
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 text-sm">
          Overview of your workspace
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card title="Projects" value={stats.totalProjects} color="blue" />
        <Card title="Tasks" value={stats.totalTasks} color="purple" />
        <Card title="To Do" value={stats.todo} color="yellow" />
        <Card title="In Progress" value={stats.inProgress} color="blue" />
        <Card title="Done" value={stats.done} color="green" />
      </div>

      {/* RECENT TASKS */}
      <div>
        <h3 className="font-semibold mb-2">Recent Tasks</h3>

        <div className="bg-[#111827] rounded-xl border border-gray-800 divide-y divide-gray-800">
          {tasks.slice(0, 5).map((t) => (
            <div key={t.id} className="p-3 flex justify-between text-sm text-gray-300">
              <span className="text-sm">{t.title}</span>
              <span className="text-xs text-gray-500">{t.status}</span>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="p-4 text-sm text-gray-500">
              No tasks yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color }) {
  const colors = {
    blue: "text-blue-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    purple: "text-purple-400"
  };
  return (
    <div className="bg-[#111827] p-4 rounded-xl border border-gray-800">
      <div className="text-sm text-gray-400">{title}</div>
      <div className={`text-xl font-bold mt-1 ${colors[color]}`}>
        {value}
      </div>
    </div>
  );
}
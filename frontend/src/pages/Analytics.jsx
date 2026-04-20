import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Analytics() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    api
      .get(`/projects/${id}/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => setData(res.data))
      .catch((err) => console.log(err.response?.data));
  }, [id]);

  if (!data) return <h2>Loading analytics...</h2>;

  const chartData = [
    { name: "Todo", value: data.todo },
    { name: "In Progress", value: data.in_progress },
    { name: "Done", value: data.completed }
  ];

  const progress =
  data.total_tasks === 0
    ? 0
    : Math.round((data.completed / data.total_tasks) * 100);

  const COLORS = ["#facc15", "#3b82f6", "#22c55e"];

  return (
  <div className="space-y-6 text-white">
    
    <h2 className="text-2xl font-semibold text-white">
      📊 Analytics
    </h2>

    {/* 🔥 TOP CARDS */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-[#111827] p-4 rounded-xl border border-gray-800">
        <p className="text-sm text-gray-400">Total</p>
        <h2 className="text-2xl font-bold text-white">{data.total_tasks}</h2>
      </div>

      <div className="bg-[#111827] p-4 rounded-xl border border-gray-800">
        <p className="text-sm text-gray-400">Todo</p>
        <h2 className="text-2xl font-bold text-yellow-600">{data.todo}</h2>
      </div>

      <div className="bg-[#111827] p-4 rounded-xl border border-gray-800">
        <p className="text-sm text-gray-400">In Progress</p>
        <h2 className="text-2xl font-bold text-blue-600">{data.in_progress}</h2>
      </div>

      <div className="bg-[#111827] p-4 rounded-xl border border-gray-800">
        <p className="text-sm text-gray-400">Done</p>
        <h2 className="text-2xl font-bold text-green-600">{data.completed}</h2>
      </div>
    </div>

    <div className="bg-[#111827] p-5 rounded-xl border border-gray-800">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>Project Completion</span>
        <span>{progress}%</span>
      </div>

      <div className="w-full bg-gray-800 h-3 rounded">
        <div
          className="bg-indigo-500 h-3 rounded transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* BAR */}
      <div className="bg-[#111827] p-5 rounded-xl border border-gray-800">
        <h3 className="font-semibold mb-4 text-white">Tasks Overview</h3>

        <BarChart width={350} height={250} data={chartData}>
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip contentStyle={{ backgroundColor: "#111827", border: "none" }} />
          <Bar dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </div>

      {/* PIE */}
      <div className="bg-[#111827] p-5 rounded-xl border border-gray-800">
        <h3 className="font-semibold mb-4 text-white">Distribution</h3>

        <PieChart width={350} height={250}>
          <Pie data={chartData} dataKey="value" nameKey="name" label>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </div>

    </div>

  </div>
);
}
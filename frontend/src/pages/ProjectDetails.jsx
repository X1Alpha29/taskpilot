import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";

import { useRef } from "react";

function DraggableTask({ task, updateTask }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id.toString()
  });

  // INLINE STATES
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  const priority = task.priority?.toLowerCase() || "medium";
    const priorityStyles = {
    low: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-red-500/20 text-red-400"
  };

  const today = new Date().toISOString().split("T")[0];
  const isOverdue = task.due_date && task.due_date < today;
  const isToday = task.due_date === today;

  

  const priorityColors = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700"
  };

  // SAVE FUNCTIONS
  const saveTitle = () => {
    if (title !== task.title) {
      updateTask(task.id, { title });
    }
    setIsEditingTitle(false);
  };

  const saveDescription = () => {
    if (description !== task.description) {
      updateTask(task.id, { description });
    }
    setIsEditingDesc(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
        opacity: isDragging ? 0.5 : 1
      }}
      className={`relative p-3 rounded-xl shadow-sm hover:shadow-lg transition border bg-[#1f2937]

        ${isDragging ? "scale-105" : ""}

      ${isOverdue
        ? "border-red-500"
        : isToday
        ? "border-orange-400"
        : "border-gray-700"}
      `}
    >
      {/* 🔥 DRAG HANDLE ONLY */}
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab text-xs text-gray-400 mb-2 select-none"
      >
        ⠿ Drag
      </div>

      {/* 🔥 TITLE */}
      <div className="group relative">
        {isEditingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === "Enter" && saveTitle()}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 p-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <div
            className="font-medium text-sm text-white cursor-pointer hover:bg-gray-800 px-1 rounded flex justify-between items-center"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingTitle(true);
            }}
          >
            {task.title}
            <div className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded ${priorityStyles[priority]}`}>
              {priority}
            </div>

            {/* ✏️ EDIT ICON */}
            <span className="opacity-0 group-hover:opacity-100 text-xs text-gray-400">
              ✏️
            </span>
          </div>
        )}
      </div>

      {/* 🔥 DESCRIPTION */}
      <div className="group relative">
        {isEditingDesc ? (
          <textarea
            autoFocus
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={saveDescription}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-gray-900 border border-gray-700 text-white p-1 rounded text-xs mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <div
            className="text-xs text-gray-400 mt-1 cursor-pointer hover:bg-gray-800 px-1 rounded flex justify-between items-center"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingDesc(true);
            }}
          >
            {task.description || "Add description..."}

            <span className="opacity-0 group-hover:opacity-100 text-xs text-gray-400">
              ✏️
            </span>
          </div>
        )}
      </div>

      {/* 🔥 META ROW */}
      <div className="flex justify-between mt-3 gap-2">
        
        {/* PRIORITY */}
        <select
          value={priority}
          onChange={(e) =>
            updateTask(task.id, { priority: e.target.value })
          }
          onClick={(e) => e.stopPropagation()}
          className="text-xs px-2 py-1 rounded-md border bg-white text-gray-600"
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>

        {/* DATE */}
        <input
          type="date"
          value={task.due_date || ""}
          onChange={(e) =>
            updateTask(task.id, { due_date: e.target.value })
          }
          onClick={(e) => e.stopPropagation()}
          className="text-xs border rounded-md px-2 py-1 text-gray-600"
        />
      </div>

      {/* 🔥 BUTTON (keeps modal working) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          task.onClick(task); // 👉 THIS OPENS MODAL
        }}
        className="mt-3 w-full text-xs text-gray-400 hover:text-white py-1"
      >
        Open Details →
      </button>
    </div>
  );
}

function DroppableColumn({ status, children }) {
  const { setNodeRef } = useDroppable({ id: status });

  const config = {
    todo: {
      title: "To Do",
      icon: "📝",
      border: "border-yellow-500/40",
      text: "text-yellow-400"
    },
    "in-progress": {
      title: "In Progress",
      icon: "⚡",
      border: "border-blue-500/40",
      text: "text-blue-400"
    },
    done: {
      title: "Done",
      icon: "✅",
      border: "border-green-500/40",
      text: "text-green-400"
    }
  };

  const c = config[status];

  return (
    <div className="flex-1">
      <div className={`flex items-center justify-between mb-3 px-2`}>
        <div className={`flex items-center gap-2 ${c.text}`}>
          <span>{c.icon}</span>
          <h3 className="font-semibold">{c.title}</h3>
        </div>

        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
          {children.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`p-4 rounded-2xl min-h-[420px] space-y-3 bg-[#111827] border ${c.border} transition hover:shadow-lg`}
      >
        {children}
      </div>
    </div>
  );
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const insightsRef = useRef(null);

  const [insights, setInsights] = useState("");
  const [loadingInsights, setLoadingInsights] = useState(false);  

  /* AI INTEGRATION */
  const [aiIdea, setAiIdea] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const generateTasksAI = async () => {
    if (!aiIdea) return;

    setLoadingAI(true);

    try {
      await api.post(
        "/ai/generate-tasks",
        {
          project_id: id,
          idea: aiIdea
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAiIdea("");
      fetchTasks();
    } catch (err) {
      console.log(err.response?.data);
    } finally {
      setLoadingAI(false);
    }
  };
   /* AI INTEGRATION */

  const [title, setTitle] = useState("");

  const [selectedTask, setSelectedTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const [file, setFile] = useState(null);
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const token = localStorage.getItem("token");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchTasks = () => {
    api
      .get(`/projects/${id}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setTasks(res.data));
  };

  const fetchComments = (taskId) => {
    api
      .get(`/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setComments(res.data || []));
  };

  useEffect(() => {
    api
      .get(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setProject(res.data));

    fetchTasks();
  }, [id]);

  useEffect(() => {
    if (insights && insightsRef.current) {
      insightsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, [insights]);

  const createTask = () => {
    if (!title) return;

    api
      .post(
        `/projects/${id}/tasks`,
        { title },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setTitle("");
        fetchTasks();
      });
  };

  const updateTask = (taskId, updates) => {
    api
      .put(`/tasks/${taskId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(fetchTasks);
  };

  const handleDragEnd = (event) => {
  const { active, over } = event;

  if (!over) return;

  const taskId = parseInt(active.id);

  let newStatus = over.id;

  // 🔥 If dropped on another task → get its column
  if (!["todo", "in-progress", "done"].includes(newStatus)) {
    const targetTask = tasks.find(
      (t) => t.id.toString() === over.id
    );

    if (!targetTask) return;

    newStatus = targetTask.status;
  }

  updateTask(taskId, { status: newStatus });
};

  const saveTask = () => {
    api
      .put(
        `/tasks/${selectedTask.id}`,
        {
          title: editTitle,
          description: editDescription,
          status: selectedTask.status,
          priority,
          due_date: dueDate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setSelectedTask(null);
        fetchTasks();
      });
  };

  const deleteTask = () => {
    api
      .delete(`/tasks/${selectedTask.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        setSelectedTask(null);
        fetchTasks();
      });
  };

  const addComment = () => {
    if (!newComment) return;

    api
      .post(
        `/tasks/${selectedTask.id}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setNewComment("");
        fetchComments(selectedTask.id);
      });
  };

  const uploadFile = async () => {
  if (!file || !selectedTask) return;

  setUploading(true);
  setUploadSuccess(false);

  try {
    const formData = new FormData();
    formData.append("file", file);

    await api.post(
      `/tasks/${selectedTask.id}/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    setUploadSuccess(true);
    setFile(null);

    // Optional: refresh task to show file immediately
    fetchTasks();

    // Auto-hide success after 2s
    setTimeout(() => setUploadSuccess(false), 2000);

  } catch (err) {
    console.error("Upload failed:", err);
  } finally {
    setUploading(false);
  }
};

  if (!project) return <h2>Loading...</h2>;

  const priorityOrder = { high: 3, medium: 2, low: 1 };

  const sortTasks = (tasks) =>
    [...tasks].sort(
      (a, b) =>
        (priorityOrder[b.priority || "medium"] || 0) -
        (priorityOrder[a.priority || "medium"] || 0)
    );

  const groupedTasks = {
    todo: sortTasks(tasks.filter((t) => t.status === "todo")),
    "in-progress": sortTasks(tasks.filter((t) => t.status === "in-progress")),
    done: sortTasks(tasks.filter((t) => t.status === "done"))
  };

  const today = new Date().toISOString().split("T")[0];

  const isOverdue = dueDate && dueDate < today;
  const isToday = dueDate === today;
  

  const getInsights = async () => {
    setInsights(""); 
    setLoadingInsights(true);

    try {
      const res = await api.post(
        "/ai/project-insights",
        { project_id: id },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setInsights(res.data.insights); // 🔥 THIS WAS MISSING

    } catch (err) {
      console.log(err.response?.data);
      setInsights("Failed to generate insights");
    } finally {
      setLoadingInsights(false);
    }
  };
    

  return (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold text-white">
      {project.name}
    </h2>

    <div className="flex gap-3">
      <button
        onClick={() => navigate(`/projects/${id}/analytics`)}
        className="flex items-center gap-2 bg-[#111827] border border-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm hover:border-indigo-500 hover:text-white transition"
      >
        📊 Analytics
      </button>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="New task"
      />

      <button
        onClick={createTask}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition"
      >
        Add
      </button>
    </div>

    {/* 🔥 AI BLOCK */}
    <div className="flex gap-2 mt-3">

      <input
        value={aiIdea}
        onChange={(e) => setAiIdea(e.target.value)}
        placeholder="Describe project (e.g. Build weather app)"
        className="flex-1 bg-gray-900 border border-gray-700 text-white p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <button
        onClick={generateTasksAI}
        disabled={loadingAI}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg text-sm transition"
      >
        {loadingAI ? "Thinking..." : "✨ AI"}
      </button>

      <button
        onClick={getInsights}
        className="bg-[#111827] border border-gray-700 text-gray-300 px-4 rounded-lg text-sm hover:border-indigo-500 hover:text-white transition"
      >
        🧠
      </button>

    </div>
    

    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4">
        {Object.keys(groupedTasks).map((status) => (
          <DroppableColumn key={status} status={status}>
            {groupedTasks[status].map((t) => (
              <DraggableTask
                key={t.id}
                task={{
                  ...t,
                  onClick: (task) => {
                    setSelectedTask(task);
                    setEditTitle(task.title);
                    setEditDescription(task.description || "");
                    setPriority(task.priority || "medium");
                    setDueDate(task.due_date || "");
                    fetchComments(task.id);
                  }
                }}
                updateTask={updateTask}
              />
            ))}
          </DroppableColumn>
        ))}
      </div>
    </DndContext>

    {(loadingInsights || insights !== "") && (
      <div
        ref={insightsRef}
        className="bg-[#111827] border border-gray-800 rounded-xl p-4"
      >
        
        <h3 className="text-sm font-semibold text-gray-300 mb-2">
          🧠 AI Insights
        </h3>

        {loadingInsights ? (
          <p className="text-gray-400 text-sm">
            Analyzing project...
          </p>
        ) : (
          <p className="text-gray-300 text-sm whitespace-pre-line">
            {insights}
          </p>
        )}

      </div>
    )}

    {selectedTask && (
  <div
    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setSelectedTask(null);
      }
    }}
  >
    <div
      className="w-[420px] rounded-2xl shadow-2xl p-6 space-y-6 border bg-[#111827] border-gray-800"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          Edit Task
        </h3>
        <button
          onClick={() => setSelectedTask(null)}
          className="text-gray-400 hover:text-white text-lg"
        >
          ✕
        </button>
      </div>

      {/* TITLE */}
      <input
        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        placeholder="Task title"
      />

      {/* FILE UPLOAD */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-gray-400">
          Attachment
        </h4>

        <input
          type="file"
          className="text-sm text-gray-300"
          onChange={(e) => {
            e.stopPropagation();
            setFile(e.target.files[0]);
          }}
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            uploadFile();
          }}
          disabled={uploading}
          className={`mt-3 w-full py-2 rounded-lg text-sm transition
            ${
              uploading
                ? "bg-gray-600 text-white cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
        >
          {uploading ? "Uploading..." : "Upload file"}
        </button>

        {uploadSuccess && (
          <p className="text-green-400 text-sm mt-2">
            ✅ File uploaded successfully
          </p>
        )}

        {selectedTask.file_path && (
          <a
            href={`http://127.0.0.1:5000/uploads/${selectedTask.file_path}`}
            target="_blank"
            rel="noreferrer"
            className="block text-indigo-400 text-sm mt-2 hover:underline"
          >
            📎 View File
          </a>
        )}
      </div>

      {/* COMMENTS */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-gray-400">
          Comments
        </h4>

        <div className="max-h-[150px] overflow-y-auto rounded-lg bg-gray-900 p-3 space-y-2 border border-gray-800">
          {comments.length === 0 && (
            <p className="text-sm text-gray-500">
              No comments yet
            </p>
          )}

          {comments
            .filter((c) => c && c.content)
            .map((c) => (
              <div
                key={c.id}
                className="bg-gray-800 p-2 rounded-md border border-gray-700 text-sm text-gray-300"
              >
                <div className="text-xs text-gray-500 mb-1">
                  User {c.user_id}
                </div>
                <div>{c.content}</div>
              </div>
            ))}
        </div>

        <div className="flex gap-2 mt-3">
          <input
            className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Add comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            onClick={addComment}
            className="bg-indigo-600 text-white px-4 rounded-lg text-sm hover:bg-indigo-700 transition"
          >
            Add
          </button>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={saveTask}
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          Save
        </button>

        <button
          onClick={deleteTask}
          className="flex-1 border border-red-500/40 text-red-400 py-2 rounded-lg text-sm font-medium hover:bg-red-500/10 transition"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
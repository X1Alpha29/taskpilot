from flask import Blueprint, jsonify, request
from .extensions import db
from .models import User, Project, Task, Comment
from .extensions import bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask import send_from_directory
from flask import current_app
import os
import json
from .utils.email import send_welcome_email

import threading

from flask_jwt_extended import jwt_required, get_jwt_identity

from groq import Groq

main = Blueprint("main", __name__)

@main.route("/")
def home():
    return jsonify({"message": "API is running"})

@main.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    existing_user = User.query.filter(
        (User.email == email) | (User.username == username)
    ).first()

    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    user = User(
        username=username,
        email=email,
        password=hashed_password
    )

    db.session.add(user)
    db.session.commit()

    # 🔥 SEND EMAIL (after user is saved)
    threading.Thread(
        target=send_welcome_email,
        args=(email, username)
    ).start()

    return jsonify({"message": "User registered successfully"}), 201

@main.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({"access_token": access_token}), 200

@main.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    user_id = get_jwt_identity()

    return jsonify({
        "message": "Access granted",
        "user_id": user_id
    })

@main.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email
    }), 200

@main.route("/projects", methods=["POST"])
@jwt_required()
def create_project():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    name = data.get("name")

    if not name:
        return jsonify({"error": "Project name required"}), 400

    project = Project(name=name, user_id=user_id)

    db.session.add(project)
    db.session.commit()

    return jsonify({"message": "Project created"}), 201

@main.route("/projects", methods=["GET"])
@jwt_required()
def get_projects():
    user_id = int(get_jwt_identity())

    projects = Project.query.filter_by(user_id=user_id).all()

    return jsonify([
        {"id": p.id, "name": p.name}
        for p in projects
    ])

@main.route("/projects/<int:project_id>", methods=["GET"])
@jwt_required()
def get_project(project_id):
    user_id = int(get_jwt_identity())

    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    return jsonify({
        "id": project.id,
        "name": project.name
    }), 200

@main.route("/projects/<int:project_id>/tasks", methods=["POST"])
@jwt_required()
def create_task(project_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()

    title = data.get("title")

    if not title:
        return jsonify({"error": "Title required"}), 400

    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    task = Task(
        title=title,
        project_id=project_id,
        status="todo"
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({"message": "Task created"}), 201

@main.route("/projects/<int:project_id>/tasks", methods=["GET"])
@jwt_required()
def get_tasks(project_id):
    user_id = int(get_jwt_identity())

    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    tasks = Task.query.filter_by(project_id=project_id).all()

    return jsonify([
        {
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "description": t.description,
            "file_path": t.file_path,
            "priority": t.priority,
            "due_date": t.due_date
        }
        for t in tasks
    ])

@main.route("/tasks/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()

    task = Task.query.get(task_id)

    if not task:
        return jsonify({"error": "Task not found"}), 404

    project = Project.query.filter_by(id=task.project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Unauthorized"}), 403

    # ✅ EXISTING
    task.status = data.get("status", task.status)
    task.title = data.get("title", task.title)
    task.description = data.get("description", task.description)

    # 🔥 ADD THESE (THIS FIXES YOUR ISSUE)
    task.priority = data.get("priority", task.priority)
    task.due_date = data.get("due_date", task.due_date)

    db.session.commit()

    return jsonify({"message": "Task updated"}), 200

@main.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    user_id = int(get_jwt_identity())

    task = Task.query.get(task_id)

    if not task:
        return jsonify({"error": "Task not found"}), 404

    project = Project.query.filter_by(id=task.project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(task)
    db.session.commit()

    return jsonify({"message": "Task deleted"}), 200

@main.route("/tasks/<int:task_id>/comments", methods=["POST"])
@jwt_required()
def create_comment(task_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()

    content = data.get("content")

    task = Task.query.get(task_id)

    if not task:
        return jsonify({"error": "Task not found"}), 404

    project = Project.query.filter_by(id=task.project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Unauthorized"}), 403

    comment = Comment(
        content=content,
        task_id=task_id,
        user_id=user_id
    )

    db.session.add(comment)
    db.session.commit()

    return jsonify({"message": "Comment added"}), 201

@main.route("/tasks/<int:task_id>/comments", methods=["GET"])
@jwt_required()
def get_comments(task_id):
    user_id = int(get_jwt_identity())

    task = Task.query.get(task_id)

    if not task:
        return jsonify({"error": "Task not found"}), 404

    project = Project.query.filter_by(id=task.project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Unauthorized"}), 403

    comments = Comment.query.filter_by(task_id=task_id).all()

    return jsonify([
        {
            "id": c.id,
            "content": c.content,
            "user_id": c.user_id,
            "created_at": c.created_at
        }
        for c in comments
    ])

@main.route("/tasks/<int:task_id>/upload", methods=["POST"])
@jwt_required()
def upload_file(task_id):
    user_id = int(get_jwt_identity())

    task = Task.query.get(task_id)

    if not task:
        return jsonify({"error": "Task not found"}), 404

    project = Project.query.filter_by(id=task.project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Unauthorized"}), 403

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    filename = f"task_{task_id}_{file.filename}"
    filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)

    file.save(filepath)

    task.file_path = filename
    db.session.commit()

    return jsonify({"message": "File uploaded", "file": filename}), 200

@main.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(
    current_app.config["UPLOAD_FOLDER"],
    filename
)

@main.route("/projects/<int:project_id>/analytics", methods=["GET"])
@jwt_required()
def project_analytics(project_id):
    user_id = int(get_jwt_identity())

    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Project not forund"}), 404
    
    tasks = Task.query.filter_by(project_id=project_id).all()

    total = len(tasks)
    completed = len([t for t in tasks if t.status == "done"])
    in_progress = len([t for t in tasks if t.status == "in-progress"])
    todo = len([t for t in tasks if t.status == "todo"])

    return jsonify({
        "total_tasks": total,
        "completed": completed,
        "in_progress": in_progress,
        "todo": todo
    })


@main.route("/projects/<int:project_id>", methods=["PUT"])
@jwt_required()
def update_project(project_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()

    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Not found"}), 404

    project.name = data.get("name", project.name)
    db.session.commit()

    return jsonify({"message": "Updated"}), 200


@main.route("/projects/<int:project_id>", methods=["DELETE"])
@jwt_required()
def delete_project(project_id):
    user_id = int(get_jwt_identity())

    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Not found"}), 404

    db.session.delete(project)
    db.session.commit()

    return jsonify({"message": "Deleted"}), 200

# AI Integration routes

@main.route("/ai/generate-tasks", methods=["POST"])
@jwt_required()
def ai_generate_tasks():
    from groq import Groq
    import os

    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    user_id = int(get_jwt_identity())
    data = request.get_json()

    project_id = data.get("project_id")
    idea = data.get("idea")

    if not idea:
        return jsonify({"error": "Idea required"}), 400

    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        prompt = f"""
        Break this idea into 5-7 clear actionable tasks.

        Return ONLY a JSON array like this:
        [
        {{"title": "Task name", "priority": "low|medium|high"}}
        ]

        Rules:
        - Max 7 tasks
        - Keep tasks short
        - No explanations

        Idea:
        {idea}
        """

        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}]
            )
        except:
            response = client.chat.completions.create(
                model="mixtral-8x7b-32768",
                messages=[{"role": "user", "content": prompt}]
            )

        content = response.choices[0].message.content

        try:
            tasks = json.loads(content)
            tasks = tasks[:7]
        except Exception as e:
            print("JSON ERROR:", content)
            return jsonify({"error": "AI returned invalid JSON"}), 500
        
        for t in tasks:
            title = t.get("title")

            if not title:
                continue

            db.session.add(Task(
                title=title,
                priority=t.get("priority", "medium"),
                project_id=project_id,
                status="todo"
            ))

        db.session.commit()

        return jsonify({"message": "Tasks generated"}), 200

    except Exception as e:
        print("🔥 GROQ ERROR:", str(e))
        return jsonify({"error": str(e)}), 500
    
@main.route("/ai/project-insights", methods=["POST"])
@jwt_required()
def project_insights():
    from groq import Groq
    import os

    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    user_id = int(get_jwt_identity())
    data = request.get_json()
    project_id = data.get("project_id")

    project = Project.query.filter_by(id=project_id, user_id=user_id).first()

    if not project:
        return jsonify({"error": "Unauthorized"}), 403

    # 🔥 GET TASKS
    tasks = Task.query.filter_by(project_id=project_id).all()

    if not tasks:
        return jsonify({
            "insights": "No tasks yet. Start by adding tasks to get insights."
        }), 200

    # 🔥 BUILD SUMMARY
    summary = "\n".join([
        f"{t.title} - {t.status} - {t.priority}"
        for t in tasks
    ])

    # 🔥 PROMPT
    prompt = f"""
    Analyze this project:

    {summary}

    Be specific and practical.

    Use bullet points.

    Mention:
    - exact tasks causing slowdown
    - what should be done next (1–3 actions)
    - any overdue or high priority risks

    Keep it short and actionable.
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )

        return jsonify({
            "insights": response.choices[0].message.content
        })

    except Exception as e:
        print("🔥 GROQ ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


@main.route("/me", methods=["DELETE"])
@jwt_required()
def delete_account():
    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    # 🔥 delete all projects + tasks + comments
    projects = Project.query.filter_by(user_id=user_id).all()

    for project in projects:
        tasks = Task.query.filter_by(project_id=project.id).all()

        for task in tasks:
            Comment.query.filter_by(task_id=task.id).delete()
            db.session.delete(task)

        db.session.delete(project)

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "Account deleted"}), 200






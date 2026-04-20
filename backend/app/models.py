from .extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=True)

    create_at = db.Column(db.DateTime, default=datetime.utcnow)

class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 🔥 ADD THIS
    tasks = db.relationship(
        "Task",
        backref="project",
        cascade="all, delete-orphan"
    )

class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default="todo")
    description = db.Column(db.Text)
    priority = db.Column(db.String(20), default="medium")
    due_date = db.Column(db.String(20)) 

    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))

    file_path = db.Column(db.String(255))

    # 🔥 ADD THIS
    comments = db.relationship(
        "Comment",
        backref="task",
        cascade="all, delete-orphan"
    )

class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)

    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)



from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    color = Column(String, default="#00FFC2")

    tasks = relationship(
        "Task", back_populates="project", cascade="all, delete-orphan"
    )


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    title = Column(String, nullable=False)
    notes = Column(String, default="")
    priority = Column(Integer, default=2)  # 1=urgent, 2=normal, 3=low
    estimated_minutes = Column(Integer, default=30)
    deadline = Column(DateTime, nullable=True)
    status = Column(String, default="todo")  # todo | doing | done
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="tasks")

from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Depends, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Project, Task
from what_now import what_now
from calendar_sync import get_free_minutes_until_next_event, calendar_is_configured

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FocusDeck")
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


def seed_default_project(db: Session):
    if db.query(Project).count() == 0:
        defaults = [
            Project(name="BizSure", color="#00FFC2"),
            Project(name="Matatu Mayhem", color="#FF6B35"),
            Project(name="Beat Platform", color="#B084F5"),
            Project(name="Signalworks Content", color="#FFD23F"),
        ]
        db.add_all(defaults)
        db.commit()


@app.on_event("startup")
def startup():
    db = next(get_db())
    seed_default_project(db)


# ---------- Pages ----------

@app.get("/", response_class=HTMLResponse)
def index(request: Request, db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return templates.TemplateResponse(request, "index.html", {"projects": projects})


# ---------- Tasks ----------

@app.get("/api/tasks", response_class=HTMLResponse)
def list_tasks(request: Request, db: Session = Depends(get_db)):
    tasks = (
        db.query(Task)
        .filter(Task.status != "done")
        .order_by(Task.priority.asc(), Task.created_at.desc())
        .all()
    )
    return templates.TemplateResponse(request, "_tasks_list.html", {"tasks": tasks})


@app.post("/api/tasks", response_class=HTMLResponse)
def create_task(
    request: Request,
    db: Session = Depends(get_db),
    title: str = Form(...),
    project_id: Optional[int] = Form(None),
    priority: int = Form(2),
    estimated_minutes: int = Form(30),
    deadline: Optional[str] = Form(None),
    notes: str = Form(""),
):
    deadline_dt = None
    if deadline:
        try:
            deadline_dt = datetime.fromisoformat(deadline)
        except ValueError:
            deadline_dt = None

    task = Task(
        title=title.strip(),
        project_id=project_id if project_id else None,
        priority=priority,
        estimated_minutes=estimated_minutes,
        deadline=deadline_dt,
        notes=notes.strip(),
    )
    db.add(task)
    db.commit()

    tasks = (
        db.query(Task)
        .filter(Task.status != "done")
        .order_by(Task.priority.asc(), Task.created_at.desc())
        .all()
    )
    return templates.TemplateResponse(request, "_tasks_list.html", {"tasks": tasks})


@app.post("/api/tasks/{task_id}/done", response_class=HTMLResponse)
def complete_task(task_id: int, request: Request, db: Session = Depends(get_db)):
    task = db.query(Task).get(task_id)
    if task:
        task.status = "done"
        db.commit()

    tasks = (
        db.query(Task)
        .filter(Task.status != "done")
        .order_by(Task.priority.asc(), Task.created_at.desc())
        .all()
    )
    return templates.TemplateResponse(request, "_tasks_list.html", {"tasks": tasks})


@app.post("/api/tasks/{task_id}/delete", response_class=HTMLResponse)
def delete_task(task_id: int, request: Request, db: Session = Depends(get_db)):
    task = db.query(Task).get(task_id)
    if task:
        db.delete(task)
        db.commit()

    tasks = (
        db.query(Task)
        .filter(Task.status != "done")
        .order_by(Task.priority.asc(), Task.created_at.desc())
        .all()
    )
    return templates.TemplateResponse(request, "_tasks_list.html", {"tasks": tasks})


# ---------- Projects ----------

@app.post("/api/projects", response_class=HTMLResponse)
def create_project(request: Request, db: Session = Depends(get_db), name: str = Form(...)):
    name = name.strip()
    if name and not db.query(Project).filter(Project.name == name).first():
        db.add(Project(name=name))
        db.commit()

    projects = db.query(Project).all()
    return templates.TemplateResponse(request, "_project_options.html", {"projects": projects})


# ---------- What Now ----------

@app.get("/api/what-now", response_class=HTMLResponse)
def get_what_now(
    request: Request,
    db: Session = Depends(get_db),
    manual_minutes: Optional[int] = None,
):
    if manual_minutes is not None:
        free_minutes, source = manual_minutes, "manual"
    else:
        free_minutes, source = get_free_minutes_until_next_event()

    tasks = db.query(Task).filter(Task.status != "done").all()
    pick, runners_up = what_now(tasks, free_minutes)

    return templates.TemplateResponse(
        request,
        "_what_now.html",
        {
            "pick": pick,
            "runners_up": runners_up,
            "free_minutes": free_minutes,
            "source": source,
            "calendar_configured": calendar_is_configured(),
        },
    )

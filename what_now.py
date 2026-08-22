from datetime import datetime


def score_task(task, free_minutes: int) -> float:
    """Higher score = do this now."""
    score = 0.0

    if task.deadline:
        hours_left = (task.deadline - datetime.utcnow()).total_seconds() / 3600
        if hours_left < 0:
            score += 100  # overdue — surface it loudly
        elif hours_left < 24:
            score += 50
        elif hours_left < 72:
            score += 20
        elif hours_left < 168:
            score += 8

    score += {1: 30, 2: 15, 3: 5}.get(task.priority, 10)

    if task.estimated_minutes and task.estimated_minutes <= free_minutes:
        score += 20
    elif task.estimated_minutes and task.estimated_minutes > free_minutes:
        score -= 10  # penalize tasks you can't realistically finish right now

    # Slight nudge for older tasks so nothing rots forever in the backlog
    age_days = (datetime.utcnow() - task.created_at).days if task.created_at else 0
    score += min(age_days * 0.5, 10)

    return score


def what_now(tasks, free_minutes: int):
    """Returns (top_pick, [runner_up, runner_up, runner_up]) or (None, [])."""
    todo = [t for t in tasks if t.status != "done"]
    if not todo:
        return None, []

    ranked = sorted(todo, key=lambda t: score_task(t, free_minutes), reverse=True)
    return ranked[0], ranked[1:4]

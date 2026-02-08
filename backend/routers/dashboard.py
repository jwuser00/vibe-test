import calendar
from datetime import datetime
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models, schemas, database, auth

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
)


@router.get("/", response_model=schemas.DashboardData)
def get_dashboard(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    # Upcoming races: status == "예정", ordered by race_date ASC, limit 2
    upcoming_races = (
        db.query(models.Race)
        .filter(
            models.Race.user_id == current_user.id,
            models.Race.status == models.RaceStatus.upcoming,
        )
        .order_by(models.Race.race_date.asc())
        .limit(2)
        .all()
    )

    # Monthly running: ALL days of the current month
    now = datetime.utcnow()
    first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    days_in_month = calendar.monthrange(now.year, now.month)[1]

    activities = (
        db.query(models.Activity)
        .filter(
            models.Activity.user_id == current_user.id,
            models.Activity.start_time >= first_of_month,
        )
        .all()
    )

    # Group by date
    daily: dict[str, list] = defaultdict(list)
    for a in activities:
        date_key = a.start_time.strftime("%Y-%m-%d")
        daily[date_key].append(a)

    # Build all days of month
    monthly_running = []
    for day in range(1, days_in_month + 1):
        date_key = f"{now.year}-{now.month:02d}-{day:02d}"
        if date_key in daily:
            day_activities = daily[date_key]
            total_distance_km = sum(a.total_distance for a in day_activities) / 1000
            paces = [a.avg_pace for a in day_activities if a.avg_pace]
            avg_pace = sum(paces) / len(paces) if paces else None
            monthly_running.append(
                schemas.MonthlyRunningDay(
                    date=date_key,
                    distance_km=round(total_distance_km, 2),
                    avg_pace=round(avg_pace, 1) if avg_pace else None,
                )
            )
        else:
            monthly_running.append(
                schemas.MonthlyRunningDay(
                    date=date_key,
                    distance_km=0,
                    avg_pace=None,
                )
            )

    # Recent 5 activities
    recent_activities = (
        db.query(models.Activity)
        .filter(models.Activity.user_id == current_user.id)
        .order_by(models.Activity.start_time.desc())
        .limit(5)
        .all()
    )

    return schemas.DashboardData(
        upcoming_races=upcoming_races,
        monthly_running=monthly_running,
        recent_activities=recent_activities,
    )

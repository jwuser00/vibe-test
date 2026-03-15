"""Factory functions for creating test data in the database."""

from datetime import date, datetime

from sqlalchemy.orm import Session

import auth
import models


def make_user(
    db: Session,
    email: str = "test@example.com",
    password: str = "TestPass123!",
    nickname: str = "TestUser",
    google_id: str | None = None,
    birth_year: int = 1990,
    birth_month: int = 1,
    gender: str = "남성",
) -> models.User:
    """Create and persist a User."""
    hashed_password = auth.get_password_hash(password) if password else None
    user = models.User(
        email=email,
        hashed_password=hashed_password,
        nickname=nickname,
        google_id=google_id,
        birth_year=birth_year,
        birth_month=birth_month,
        gender=gender,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def make_activity(
    db: Session,
    user: models.User,
    start_time: datetime | None = None,
    total_distance: float = 5000,
    total_time: float = 1500,
    avg_pace: float = 300,
    avg_hr: float | None = 150,
    avg_cadence: float | None = 88,
    tcx_data: str | None = None,
    is_treadmill: bool = False,
    llm_evaluation: str | None = None,
    llm_evaluation_status: models.LLMEvaluationStatus | None = None,
    plan_session_id: int | None = None,
) -> models.Activity:
    """Create and persist an Activity."""
    if start_time is None:
        start_time = datetime(2024, 1, 15, 10, 0, 0)
    activity = models.Activity(
        user_id=user.id,
        start_time=start_time,
        total_distance=total_distance,
        total_time=total_time,
        avg_pace=avg_pace,
        avg_hr=avg_hr,
        avg_cadence=avg_cadence,
        tcx_data=tcx_data,
        is_treadmill=is_treadmill,
        llm_evaluation=llm_evaluation,
        llm_evaluation_status=llm_evaluation_status,
        plan_session_id=plan_session_id,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


def make_race(
    db: Session,
    user: models.User,
    race_name: str = "서울 마라톤",
    race_date: datetime | None = None,
    location: str = "서울",
    distance_type: models.DistanceType = models.DistanceType.full,
    target_time: float | None = 14400,
    status: models.RaceStatus = models.RaceStatus.upcoming,
    activity_id: int | None = None,
) -> models.Race:
    """Create and persist a Race."""
    if race_date is None:
        race_date = datetime(2024, 4, 15, 8, 0, 0)
    race = models.Race(
        user_id=user.id,
        race_name=race_name,
        race_date=race_date,
        location=location,
        distance_type=distance_type,
        target_time=target_time,
        status=status,
        activity_id=activity_id,
    )
    db.add(race)
    db.commit()
    db.refresh(race)
    return race


def make_plan(
    db: Session,
    user: models.User,
    user_prompt: str = "이번 주 러닝 계획 세워줘",
    status: models.PlanStatus = models.PlanStatus.active,
    generation_status: models.LLMEvaluationStatus = models.LLMEvaluationStatus.completed,
    llm_plan_text: str | None = "테스트 계획",
    start_date: date | None = None,
    end_date: date | None = None,
) -> models.Plan:
    """Create and persist a Plan."""
    if start_date is None:
        start_date = date(2024, 1, 15)
    if end_date is None:
        end_date = date(2024, 1, 21)
    plan = models.Plan(
        user_id=user.id,
        created_at=datetime.utcnow(),
        user_prompt=user_prompt,
        status=status,
        generation_status=generation_status,
        llm_plan_text=llm_plan_text,
        start_date=start_date,
        end_date=end_date,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def make_plan_session(
    db: Session,
    plan: models.Plan,
    session_date: date | None = None,
    session_type: models.SessionType = models.SessionType.Easy,
    title: str = "이지 런",
    description: str | None = "가볍게 5km",
    target_distance: float | None = 5000,
    target_pace: float | None = 360,
) -> models.PlanSession:
    """Create and persist a PlanSession."""
    if session_date is None:
        session_date = date(2024, 1, 15)
    session = models.PlanSession(
        plan_id=plan.id,
        date=session_date,
        session_type=session_type,
        title=title,
        description=description,
        target_distance=target_distance,
        target_pace=target_pace,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

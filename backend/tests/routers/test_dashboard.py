"""Endpoint tests for /dashboard — aggregation queries."""

from datetime import datetime

import pytest
from freezegun import freeze_time

import models
from tests.fixtures.sample_data import make_user, make_activity, make_race


@freeze_time("2024-01-15 12:00:00")
class TestDashboard:
    def test_empty(self, authenticated_client, db_session, test_user):
        resp = authenticated_client.get("/dashboard/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["upcoming_races"] == []
        assert data["recent_activities"] == []
        assert len(data["monthly_running"]) == 31  # January has 31 days

    def test_upcoming_races(self, authenticated_client, db_session, test_user):
        make_race(db_session, test_user, race_name="Race 1",
                  race_date=datetime(2024, 2, 1, 8, 0), status=models.RaceStatus.upcoming)
        make_race(db_session, test_user, race_name="Race 2",
                  race_date=datetime(2024, 3, 1, 8, 0), status=models.RaceStatus.upcoming)
        make_race(db_session, test_user, race_name="Race 3",
                  race_date=datetime(2024, 4, 1, 8, 0), status=models.RaceStatus.upcoming)
        make_race(db_session, test_user, race_name="Finished",
                  race_date=datetime(2024, 1, 1, 8, 0), status=models.RaceStatus.finished)

        resp = authenticated_client.get("/dashboard/")
        data = resp.json()
        assert len(data["upcoming_races"]) == 2
        assert data["upcoming_races"][0]["race_name"] == "Race 1"

    def test_monthly_running_with_activities(self, authenticated_client, db_session, test_user):
        make_activity(db_session, test_user,
                      start_time=datetime(2024, 1, 5, 7, 0),
                      total_distance=5000, avg_pace=300)
        make_activity(db_session, test_user,
                      start_time=datetime(2024, 1, 10, 7, 0),
                      total_distance=10000, avg_pace=330)

        resp = authenticated_client.get("/dashboard/")
        data = resp.json()
        running = {d["date"]: d for d in data["monthly_running"]}

        assert running["2024-01-05"]["distance_km"] == 5.0
        assert running["2024-01-10"]["distance_km"] == 10.0
        assert running["2024-01-01"]["distance_km"] == 0

    def test_recent_activities_max_5(self, authenticated_client, db_session, test_user):
        for i in range(7):
            make_activity(db_session, test_user,
                          start_time=datetime(2024, 1, 1 + i, 7, 0))

        resp = authenticated_client.get("/dashboard/")
        data = resp.json()
        assert len(data["recent_activities"]) == 5

    def test_unauthenticated(self, client):
        resp = client.get("/dashboard/")
        assert resp.status_code == 401

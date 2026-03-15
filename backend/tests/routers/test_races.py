"""Endpoint tests for /races/* — CRUD, image upload, TCX upload."""

import os
from datetime import datetime

import pytest

import models
from tests.fixtures.sample_tcx import make_tcx
from tests.fixtures.sample_data import make_user, make_activity, make_race


class TestRaceCrud:
    def test_create_race(self, authenticated_client, db_session, test_user):
        resp = authenticated_client.post("/races/", json={
            "race_name": "서울 마라톤",
            "race_date": "2024-04-15T08:00:00",
            "location": "서울",
            "distance_type": "full",
            "target_time": 14400,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["race_name"] == "서울 마라톤"
        assert data["status"] == "예정"

    def test_list_races(self, authenticated_client, db_session, test_user):
        make_race(db_session, test_user, race_name="Race 1")
        make_race(db_session, test_user, race_name="Race 2",
                  race_date=datetime(2024, 5, 1, 8, 0))

        resp = authenticated_client.get("/races/")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_list_filter_by_status(self, authenticated_client, db_session, test_user):
        make_race(db_session, test_user, race_name="Upcoming", status=models.RaceStatus.upcoming)
        make_race(db_session, test_user, race_name="Finished", status=models.RaceStatus.finished,
                  race_date=datetime(2024, 3, 1, 8, 0))

        resp = authenticated_client.get("/races/?status=예정")
        data = resp.json()
        assert len(data) == 1
        assert data[0]["race_name"] == "Upcoming"

    def test_get_race(self, authenticated_client, db_session, test_user):
        race = make_race(db_session, test_user)
        resp = authenticated_client.get(f"/races/{race.id}")
        assert resp.status_code == 200
        assert resp.json()["race_name"] == "서울 마라톤"

    def test_get_race_not_found(self, authenticated_client, db_session, test_user):
        resp = authenticated_client.get("/races/99999")
        assert resp.status_code == 404

    def test_get_race_other_user(self, authenticated_client, db_session, test_user):
        other = make_user(db_session, email="raceother@test.com")
        race = make_race(db_session, other, race_date=datetime(2024, 6, 1, 8, 0))
        resp = authenticated_client.get(f"/races/{race.id}")
        assert resp.status_code == 404

    def test_update_race(self, authenticated_client, db_session, test_user):
        race = make_race(db_session, test_user)
        resp = authenticated_client.put(f"/races/{race.id}", json={
            "race_name": "부산 마라톤",
        })
        assert resp.status_code == 200
        assert resp.json()["race_name"] == "부산 마라톤"

    def test_update_race_partial(self, authenticated_client, db_session, test_user):
        race = make_race(db_session, test_user)
        original_location = race.location
        resp = authenticated_client.put(f"/races/{race.id}", json={
            "race_name": "변경",
        })
        assert resp.json()["location"] == original_location

    def test_delete_race(self, authenticated_client, db_session, test_user):
        race = make_race(db_session, test_user)
        resp = authenticated_client.delete(f"/races/{race.id}")
        assert resp.status_code == 200
        assert db_session.query(models.Race).get(race.id) is None


class TestRaceResult:
    def test_update_result(self, authenticated_client, db_session, test_user):
        race = make_race(db_session, test_user)
        resp = authenticated_client.put(f"/races/{race.id}/result", json={
            "status": "완주",
            "actual_time": 13800,
            "review": "잘 뛰었다",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "완주"
        assert data["actual_time"] == 13800
        assert data["review"] == "잘 뛰었다"


class TestRaceTcxUpload:
    def test_creates_activity_and_links(self, authenticated_client, db_session, test_user):
        race = make_race(db_session, test_user)
        tcx = make_tcx(start_time="2024-08-01T06:00:00.000Z")

        resp = authenticated_client.post(
            f"/races/{race.id}/upload-tcx",
            files={"file": ("race.tcx", tcx, "application/xml")},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["activity_id"] is not None

    def test_links_existing_activity(self, authenticated_client, db_session, test_user):
        race = make_race(db_session, test_user)
        existing = make_activity(
            db_session, test_user,
            start_time=datetime(2024, 1, 15, 10, 0, 0),
        )
        tcx = make_tcx(start_time="2024-01-15T10:00:00.000Z")

        resp = authenticated_client.post(
            f"/races/{race.id}/upload-tcx",
            files={"file": ("race.tcx", tcx, "application/xml")},
        )
        assert resp.status_code == 200
        assert resp.json()["activity_id"] == existing.id

    def test_invalid_tcx(self, authenticated_client, db_session, test_user):
        race = make_race(db_session, test_user)
        resp = authenticated_client.post(
            f"/races/{race.id}/upload-tcx",
            files={"file": ("bad.tcx", b"not xml", "application/xml")},
        )
        assert resp.status_code == 400

    def test_empty_tcx(self, authenticated_client, db_session, test_user):
        race = make_race(db_session, test_user)
        empty = b"""<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities/>
</TrainingCenterDatabase>"""
        resp = authenticated_client.post(
            f"/races/{race.id}/upload-tcx",
            files={"file": ("empty.tcx", empty, "application/xml")},
        )
        assert resp.status_code == 400


class TestRaceImages:
    def test_upload_image(self, authenticated_client, db_session, test_user, tmp_path, monkeypatch):
        monkeypatch.setattr("routers.races.UPLOAD_DIR", str(tmp_path))
        race = make_race(db_session, test_user)

        resp = authenticated_client.post(
            f"/races/{race.id}/images",
            files={"file": ("photo.jpg", b"\xff\xd8\xff\xe0" + b"\x00" * 100, "image/jpeg")},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["original_name"] == "photo.jpg"

    def test_upload_max_limit(self, authenticated_client, db_session, test_user, tmp_path, monkeypatch):
        monkeypatch.setattr("routers.races.UPLOAD_DIR", str(tmp_path))
        race = make_race(db_session, test_user)

        for i in range(5):
            authenticated_client.post(
                f"/races/{race.id}/images",
                files={"file": (f"photo{i}.jpg", b"\xff\xd8" + b"\x00" * 100, "image/jpeg")},
            )

        resp = authenticated_client.post(
            f"/races/{race.id}/images",
            files={"file": ("photo6.jpg", b"\xff\xd8" + b"\x00" * 100, "image/jpeg")},
        )
        assert resp.status_code == 400

    def test_upload_invalid_extension(self, authenticated_client, db_session, test_user, tmp_path, monkeypatch):
        monkeypatch.setattr("routers.races.UPLOAD_DIR", str(tmp_path))
        race = make_race(db_session, test_user)

        resp = authenticated_client.post(
            f"/races/{race.id}/images",
            files={"file": ("anim.gif", b"\x00" * 100, "image/gif")},
        )
        assert resp.status_code == 400

    def test_upload_too_large(self, authenticated_client, db_session, test_user, tmp_path, monkeypatch):
        monkeypatch.setattr("routers.races.UPLOAD_DIR", str(tmp_path))
        race = make_race(db_session, test_user)

        big_content = b"\x00" * (6 * 1024 * 1024)  # 6MB
        resp = authenticated_client.post(
            f"/races/{race.id}/images",
            files={"file": ("big.jpg", big_content, "image/jpeg")},
        )
        assert resp.status_code == 400

    def test_delete_image(self, authenticated_client, db_session, test_user, tmp_path, monkeypatch):
        monkeypatch.setattr("routers.races.UPLOAD_DIR", str(tmp_path))
        race = make_race(db_session, test_user)

        upload_resp = authenticated_client.post(
            f"/races/{race.id}/images",
            files={"file": ("del.jpg", b"\xff\xd8" + b"\x00" * 100, "image/jpeg")},
        )
        image_id = upload_resp.json()["id"]

        resp = authenticated_client.delete(f"/races/{race.id}/images/{image_id}")
        assert resp.status_code == 200

    def test_delete_image_not_found(self, authenticated_client, db_session, test_user):
        race = make_race(db_session, test_user)
        resp = authenticated_client.delete(f"/races/{race.id}/images/99999")
        assert resp.status_code == 404

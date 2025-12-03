from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, auth, tcx_parser

router = APIRouter(
    prefix="/activities",
    tags=["activities"],
)

@router.post("/upload", response_model=List[schemas.Activity])
async def upload_tcx(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    content = await file.read()
    try:
        parsed_activities = tcx_parser.parse_tcx(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid TCX file: {str(e)}")
    
    saved_activities = []
    for activity_data in parsed_activities:
        db_activity = models.Activity(
            user_id=current_user.id,
            start_time=activity_data['start_time'],
            total_distance=activity_data['total_distance'],
            total_time=activity_data['total_time'],
            avg_pace=activity_data['avg_pace'],
            avg_hr=activity_data['avg_hr'],
            avg_cadence=activity_data['avg_cadence']
        )
        db.add(db_activity)
        db.commit()
        db.refresh(db_activity)
        
        for lap_data in activity_data['laps']:
            db_lap = models.Lap(
                activity_id=db_activity.id,
                lap_number=lap_data['lap_number'],
                distance=lap_data['distance'],
                time=lap_data['time'],
                pace=lap_data['pace'],
                avg_hr=lap_data['avg_hr'],
                max_hr=lap_data['max_hr'],
                avg_cadence=lap_data['avg_cadence']
            )
            db.add(db_lap)
        
        db.commit()
        db.refresh(db_activity)
        saved_activities.append(db_activity)
        
    return saved_activities

@router.get("/", response_model=List[schemas.Activity])
def read_activities(skip: int = 0, limit: int = 100, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    activities = db.query(models.Activity).filter(models.Activity.user_id == current_user.id).offset(skip).limit(limit).all()
    return activities

@router.get("/{activity_id}", response_model=schemas.Activity)
def read_activity(activity_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    activity = db.query(models.Activity).filter(models.Activity.id == activity_id, models.Activity.user_id == current_user.id).first()
    if activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity

@router.delete("/{activity_id}")
def delete_activity(activity_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    activity = db.query(models.Activity).filter(models.Activity.id == activity_id, models.Activity.user_id == current_user.id).first()
    if activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(activity)
    db.commit()
    return {"message": "Activity deleted successfully"}

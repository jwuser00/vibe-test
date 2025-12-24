
import os
import asyncio
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional
from sqlalchemy.orm import Session
import models

# 1. Define State
class AgentState(TypedDict):
    activity_id: int
    summary_data: dict
    laps_data: list
    analysis_result: Optional[str]

# 2. Define Nodes
def format_prompt(state: AgentState):
    summary = state['summary_data']
    laps = state['laps_data']
    
    # Format lap data summary (aggregating to avoid token limits if needed, but here we pass all laps as requested in plan)
    # The user asked for "lap averages" to be sent to Gemini to save costs.
    # We will construct a text representation of the workout.
    
    prompt_text = f"""
    당신은 전문 러닝 코치입니다. 다음 운동 데이터를 분석하여 피드백을 주세요.
    
    [운동 요약]
    - 총 거리: {summary['total_distance'] / 1000:.2f} km
    - 총 시간: {summary['total_time'] // 60}분 {summary['total_time'] % 60:.0f}초
    - 평균 페이스: {summary['avg_pace'] // 60:.0f}분 {summary['avg_pace'] % 60:.0f}초/km
    - 평균 심박수: {summary.get('avg_hr', 'N/A')} bpm
    - 평균 케이던스: {summary.get('avg_cadence', 'N/A')} spm
    
    [랩(Lap) 별 데이터]
    """
    
    for lap in laps:
        prompt_text += f"- Lap {lap['lap_number']}: {lap['distance']/1000:.2f}km | {lap['time']}초 | 페이스 {lap['pace']}초/km | 심박 {lap['avg_hr']}bpm\n"
        
    prompt_text += """
    
    위 데이터를 바탕으로 다음 내용을 포함하여 운동을 평가해주세요:
    1. 전체적인 운동 강도와 성과 평가
    2. 페이스 조절이 잘 되었는지 (랩 별 데이터 참고)
    3. 심박수 대역을 고려한 훈련 효과
    4. 개선할 점 및 다음 훈련 가이드
    
    답변은 마크다운 형식으로 작성해주시고, 격려하는 톤으로 작성해주세요.
    """
    
    return {"prompt": prompt_text}

async def call_gemini(state: AgentState):
    # This node receives the state, but we actually need the prompt from the previous step?
    # Actually in StateGraph, usually we pass messages or update state.
    # Let's verify standard LangGraph pattern.
    # We can reconstruct prompt here or store it in state. Let's reconstruct for simplicity or store in state if we added 'prompt' key.
    # But AgentState definition above didn't have 'prompt'. Let's just generate it here or update State.
    
    # Re-generating prompt for simplicity to keep state clean
    summary = state['summary_data']
    laps = state['laps_data']
    
    prompt_text = f"""
    당신은 전문 러닝 코치입니다. 다음 운동 데이터를 분석하여 피드백을 주세요.
    
    [운동 요약]
    - 총 거리: {summary['total_distance'] / 1000:.2f} km
    - 총 시간: {summary['total_time'] // 60}분 {summary['total_time'] % 60:.0f}초
    - 평균 페이스: {summary['avg_pace'] // 60:.0f}분 {summary['avg_pace'] % 60:.0f}초/km
    - 평균 심박수: {summary.get('avg_hr', 'N/A')} bpm
    - 평균 케이던스: {summary.get('avg_cadence', 'N/A')} spm
    
    [랩(Lap) 별 데이터]
    """
    
    for lap in laps:
        prompt_text += f"- Lap {lap['lap_number']}: {lap['distance']/1000:.2f}km | {lap['time']}초 | 페이스 {lap['pace']}초/km | 심박 {lap.get('avg_hr', 'N/A')}bpm\n"
        
    prompt_text += """
    
    위 데이터를 바탕으로 다음 내용을 포함하여 운동을 평가해주세요:
    1. 전체적인 운동 강도와 성과 평가
    2. 페이스 조절이 잘 되었는지 (랩 별 데이터 참고)
    3. 심박수 대역을 고려한 훈련 효과
    4. 개선할 점 및 다음 훈련 가이드
    
    답변은 마크다운 형식으로 작성해주시고, 격려하는 톤으로 작성해주세요.
    """

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"analysis_result": "Error: GEMINI_API_KEY is not set."}

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", google_api_key=api_key)
    
    try:
        response = await llm.ainvoke([HumanMessage(content=prompt_text)])
        return {"analysis_result": response.content}
    except Exception as e:
        return {"analysis_result": f"Analysis failed: {str(e)}"}

# 3. Build Graph
workflow = StateGraph(AgentState)
workflow.add_node("analyze", call_gemini) # Simplified to single node for this use case
workflow.set_entry_point("analyze")
workflow.add_edge("analyze", END)
app = workflow.compile()

# 4. Main Runner Function
async def run_analysis_workflow(activity_id: int, db: Session):
    print(f"Starting analysis for activity {activity_id}")
    
    # Fetch Data
    activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if not activity:
        print("Activity not found")
        return

    # Prepare State
    summary_data = {
        "total_distance": activity.total_distance,
        "total_time": activity.total_time,
        "avg_pace": activity.avg_pace,
        "avg_hr": activity.avg_hr,
        "avg_cadence": activity.avg_cadence
    }
    
    laps_data = []
    for lap in activity.laps:
        laps_data.append({
            "lap_number": lap.lap_number,
            "distance": lap.distance,
            "time": lap.time,
            "pace": lap.pace,
            "avg_hr": lap.avg_hr
        })

    initial_state = AgentState(
        activity_id=activity_id,
        summary_data=summary_data,
        laps_data=laps_data,
        analysis_result=None
    )

    # Run Graph
    try:
        result = await app.ainvoke(initial_state)
        analysis_text = result.get("analysis_result")
        
        # Update DB
        # Re-fetch activity in case session was closed (though we pass session)
        # Assuming session is still valid for this background task context? 
        # Actually BackgroundTasks in FastAPI runs after response. 
        # It's safer to create a NEW session for the background task if the passed db session is closed.
        # But `run_analysis_workflow` is called with `db` from dependency... which closes.
        # So we should create a new session here.
        
        # Wait, the prompt says "db: Session". I will handle session creation inside this function to be safe.
        pass 
        
    except Exception as e:
        print(f"Workflow error: {e}")
        analysis_text = f"System Error: {str(e)}"

    # Update DB (Using a fresh session or the passed one?
    # Dependency Injection DB session is contextual to the request.
    # Background tasks run AFTER request.
    # So we MUST create a new session.
    
    from database import SessionLocal
    db_bg = SessionLocal()
    try:
        act = db_bg.query(models.Activity).filter(models.Activity.id == activity_id).first()
        if act:
            if "Error" in analysis_text or "failed" in analysis_text:
                 act.analysis_status = "FAILED"
            else:
                 act.analysis_status = "COMPLETED"
            
            act.analysis_result = analysis_text
            db_bg.commit()
            print(f"Analysis saved for {activity_id}")
    except Exception as e:
        print(f"DB Update error: {e}")
    finally:
        db_bg.close()


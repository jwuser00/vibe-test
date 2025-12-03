import { Link } from 'react-router-dom';
import { Activity, Clock, MapPin, Heart, Trash2 } from 'lucide-react';

export default function ActivityCard({ activity, toKST, onDelete }) {
    return (
        <Link to={`/activity/${activity.id}`} className="activity-card__link">
            <div className="card activity-card">
                <div className="activity-card__header">
                    <div className="activity-card__meta">
                        <div className="activity-card__icon">
                            <Activity size={24} />
                        </div>
                        <div>
                            <div className="activity-card__date">{toKST(activity.start_time).toLocaleDateString('ko-KR')}</div>
                            <div className="activity-card__time">{toKST(activity.start_time).toLocaleTimeString('ko-KR')}</div>
                        </div>
                    </div>
                    <button
                        onClick={(e) => onDelete(e, activity.id)}
                        className="btn-icon-danger"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                <div className="metric-grid">
                    <div>
                        <div className="metric-label">
                            <MapPin size={12} style={{ marginRight: '0.25rem' }} /> Distance
                        </div>
                        <div className="metric-value">{(activity.total_distance / 1000).toFixed(2)} km</div>
                    </div>
                    <div>
                        <div className="metric-label">
                            <Clock size={12} style={{ marginRight: '0.25rem' }} /> Time
                        </div>
                        <div className="metric-value">{new Date(activity.total_time * 1000).toISOString().substr(11, 8)}</div>
                    </div>
                    <div>
                        <div className="metric-label">
                            <Activity size={12} style={{ marginRight: '0.25rem' }} /> Pace
                        </div>
                        <div className="metric-value">{Math.floor(activity.avg_pace / 60)}:{(activity.avg_pace % 60).toFixed(0).padStart(2, '0')} /km</div>
                    </div>
                    <div>
                        <div className="metric-label">
                            <Heart size={12} style={{ marginRight: '0.25rem' }} /> Avg HR
                        </div>
                        <div className="metric-value">{activity.avg_hr ? Math.round(activity.avg_hr) : '-'} bpm</div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

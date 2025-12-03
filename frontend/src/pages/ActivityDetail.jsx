import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getActivity } from '../api';
import { ArrowLeft, Clock, MapPin, Activity, Heart, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ActivityDetail() {
    const { id } = useParams();
    const [activity, setActivity] = useState(null);

    useEffect(() => {
        loadActivity();
    }, [id]);

    const loadActivity = async () => {
        try {
            const data = await getActivity(id);
            setActivity(data);
        } catch (error) {
            console.error('Failed to load activity');
        }
    };

    if (!activity) return <div className="container">Loading...</div>;

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatPace = (secondsPerKm) => {
        const m = Math.floor(secondsPerKm / 60);
        const s = Math.floor(secondsPerKm % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="container">
            <Link to="/" className="btn back-link">
                <ArrowLeft size={20} className="icon-inline" /> Back to Dashboard
            </Link>

            <div className="card card-spaced">
                <h1 className="title section-title">Activity Analysis</h1>

                <div className="stats-grid">
                    <div>
                        <div className="stats-label">
                            <MapPin size={16} className="icon-inline" /> Total Distance
                        </div>
                        <div className="stats-value">
                            {(activity.total_distance / 1000).toFixed(2)} <span className="stats-subtext">km</span>
                        </div>
                    </div>
                    <div>
                        <div className="stats-label">
                            <Clock size={16} className="icon-inline" /> Total Time
                        </div>
                        <div className="stats-value">{formatTime(activity.total_time)}</div>
                    </div>
                    <div>
                        <div className="stats-label">
                            <Activity size={16} className="icon-inline" /> Avg Pace
                        </div>
                        <div className="stats-value">
                            {formatPace(activity.avg_pace)} <span className="stats-subtext">/km</span>
                        </div>
                    </div>
                    <div>
                        <div className="stats-label">
                            <Heart size={16} className="icon-inline" /> Avg HR
                        </div>
                        <div className="stats-value">
                            {activity.avg_hr ? Math.round(activity.avg_hr) : '-'} <span className="stats-subtext">bpm</span>
                        </div>
                    </div>
                    <div>
                        <div className="stats-label">
                            <Zap size={16} className="icon-inline" /> Avg Cadence
                        </div>
                        <div className="stats-value">
                            {activity.avg_cadence ? Math.round(activity.avg_cadence) : '-'} <span className="stats-subtext">spm</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card card-spaced">
                <h2 className="section-title">Lap Analysis</h2>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Lap</th>
                                <th>Distance</th>
                                <th>Time</th>
                                <th>Pace</th>
                                <th>Avg HR</th>
                                <th>Max HR</th>
                                <th>Cadence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activity.laps.map((lap) => (
                                <tr key={lap.id}>
                                    <td>{lap.lap_number}</td>
                                    <td>{(lap.distance / 1000).toFixed(2)} km</td>
                                    <td>{formatTime(lap.time)}</td>
                                    <td>{formatPace(lap.pace)} /km</td>
                                    <td>{lap.avg_hr ? Math.round(lap.avg_hr) : '-'}</td>
                                    <td>{lap.max_hr ? Math.round(lap.max_hr) : '-'}</td>
                                    <td>{lap.avg_cadence ? Math.round(lap.avg_cadence) : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <h2 className="section-title">Pace & Heart Rate</h2>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={activity.laps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="lap_number" stroke="var(--text-secondary)" />
                            <YAxis yAxisId="left" stroke="var(--primary)" label={{ value: 'Pace (sec/km)', angle: -90, position: 'insideLeft', fill: 'var(--primary)' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="var(--error)" label={{ value: 'HR (bpm)', angle: 90, position: 'insideRight', fill: 'var(--error)' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                                labelStyle={{ color: 'var(--text)' }}
                            />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="pace" stroke="var(--primary)" name="Pace (sec/km)" strokeWidth={2} />
                            <Line yAxisId="right" type="monotone" dataKey="avg_hr" stroke="var(--error)" name="Avg HR" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

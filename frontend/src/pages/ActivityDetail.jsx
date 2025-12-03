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
            <Link to="/" className="btn" style={{ marginBottom: '1rem', paddingLeft: 0, color: 'var(--text-secondary)' }}>
                <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
            </Link>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h1 className="title" style={{ marginBottom: '1.5rem' }}>Activity Analysis</h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <MapPin size={16} style={{ marginRight: '0.5rem' }} /> Total Distance
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{(activity.total_distance / 1000).toFixed(2)} <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-secondary)' }}>km</span></div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <Clock size={16} style={{ marginRight: '0.5rem' }} /> Total Time
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{formatTime(activity.total_time)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <Activity size={16} style={{ marginRight: '0.5rem' }} /> Avg Pace
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{formatPace(activity.avg_pace)} <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-secondary)' }}>/km</span></div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <Heart size={16} style={{ marginRight: '0.5rem' }} /> Avg HR
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{activity.avg_hr ? Math.round(activity.avg_hr) : '-'} <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-secondary)' }}>bpm</span></div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <Zap size={16} style={{ marginRight: '0.5rem' }} /> Avg Cadence
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{activity.avg_cadence ? Math.round(activity.avg_cadence) : '-'} <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-secondary)' }}>spm</span></div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Lap Analysis</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Lap</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Distance</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Time</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Pace</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Avg HR</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Max HR</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Cadence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activity.laps.map((lap) => (
                                <tr key={lap.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>{lap.lap_number}</td>
                                    <td style={{ padding: '1rem' }}>{(lap.distance / 1000).toFixed(2)} km</td>
                                    <td style={{ padding: '1rem' }}>{formatTime(lap.time)}</td>
                                    <td style={{ padding: '1rem' }}>{formatPace(lap.pace)} /km</td>
                                    <td style={{ padding: '1rem' }}>{lap.avg_hr ? Math.round(lap.avg_hr) : '-'}</td>
                                    <td style={{ padding: '1rem' }}>{lap.max_hr ? Math.round(lap.max_hr) : '-'}</td>
                                    <td style={{ padding: '1rem' }}>{lap.avg_cadence ? Math.round(lap.avg_cadence) : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Pace & Heart Rate</h2>
                <div style={{ height: '400px' }}>
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

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getActivities, uploadActivity, deleteActivity } from '../api';
import { Upload, Activity, Clock, MapPin, Heart, Trash2 } from 'lucide-react';

export default function Dashboard() {
    const [activities, setActivities] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            const data = await getActivities();
            setActivities(data);
        } catch (error) {
            console.error('Failed to load activities');
        }
    };

    const uploadFile = async (file) => {
        if (!file || !file.name.endsWith('.tcx')) {
            alert('TCX 파일만 업로드 가능합니다');
            return;
        }

        setUploading(true);
        try {
            await uploadActivity(file);
            await loadActivities();
        } catch (error) {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (file) await uploadFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only hide if leaving the container itself
        if (e.target === e.currentTarget) {
            setIsDragging(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) await uploadFile(file);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const handleDelete = async (e, activityId) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('정말로 이 활동을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await deleteActivity(activityId);
            await loadActivities();
        } catch (error) {
            alert('삭제에 실패했습니다');
        }
    };

    // The backend stores time as-is from TCX (which is UTC)
    // Browser interprets it as local time, making it 9 hours ahead
    // So we need to subtract 9 hours to get the correct KST time
    const toKST = (dateString) => {
        const date = new Date(dateString);
        return new Date(date.getTime() + (9 * 60 * 60 * 1000));
    };



    return (
        <div
            className="container"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ position: 'relative' }}
        >
            {isDragging && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    border: '3px dashed var(--primary)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    pointerEvents: 'none'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: 'var(--primary)',
                        textAlign: 'center'
                    }}>
                        <Upload size={64} style={{ marginBottom: '1rem' }} />
                        <div>TCX 파일을 여기에 드롭하세요</div>
                    </div>
                </div>
            )}
            <div className="header">
                <h1 className="title">My Activities</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <label className="btn btn-primary">
                        {uploading ? 'Uploading...' : <><Upload size={20} style={{ marginRight: '0.5rem' }} /> Upload TCX</>}
                        <input type="file" accept=".tcx" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
                    </label>
                    <button className="btn" onClick={handleLogout} style={{ backgroundColor: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                        Logout
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {activities.map((activity) => (
                    <Link key={activity.id} to={`/activity/${activity.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="card" style={{ transition: 'transform 0.2s', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', marginRight: '1rem' }}>
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{toKST(activity.start_time).toLocaleDateString('ko-KR')}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{toKST(activity.start_time).toLocaleTimeString('ko-KR')}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, activity.id)}
                                    style={{
                                        padding: '0.5rem',
                                        borderRadius: '0.5rem',
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        color: 'var(--error)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                                        <MapPin size={12} style={{ marginRight: '0.25rem' }} /> Distance
                                    </div>
                                    <div style={{ fontWeight: '600' }}>{(activity.total_distance / 1000).toFixed(2)} km</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                                        <Clock size={12} style={{ marginRight: '0.25rem' }} /> Time
                                    </div>
                                    <div style={{ fontWeight: '600' }}>{new Date(activity.total_time * 1000).toISOString().substr(11, 8)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                                        <Activity size={12} style={{ marginRight: '0.25rem' }} /> Pace
                                    </div>
                                    <div style={{ fontWeight: '600' }}>{Math.floor(activity.avg_pace / 60)}:{(activity.avg_pace % 60).toFixed(0).padStart(2, '0')} /km</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                                        <Heart size={12} style={{ marginRight: '0.25rem' }} /> Avg HR
                                    </div>
                                    <div style={{ fontWeight: '600' }}>{activity.avg_hr ? Math.round(activity.avg_hr) : '-'} bpm</div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

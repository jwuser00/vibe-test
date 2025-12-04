import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getActivities, uploadActivity, deleteActivity } from '../api';
import { Upload } from 'lucide-react';
import ActivityCard from '../components/ActivityCard';

export default function Dashboard() {
    const [activities, setActivities] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            const data = await getActivities();
            const sorted = [...data].sort(
                (a, b) => new Date(b.start_time) - new Date(a.start_time)
            );
            setActivities(sorted);
        } catch (error) {
            showToast('활동을 불러오지 못했습니다', 'error');
        }
    };

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2500);
    };

    const years = Array.from(
        new Set(activities.map((a) => new Date(a.start_time).getFullYear()))
    ).sort((a, b) => b - a);

    const months = Array.from(
        new Set(
            activities
                .filter((a) => selectedYear === 'all' || new Date(a.start_time).getFullYear() === selectedYear)
                .map((a) => new Date(a.start_time).getMonth() + 1)
        )
    ).sort((a, b) => b - a);

    const uploadFile = async (file) => {
        if (!file || !file.name.endsWith('.tcx')) {
            showToast('TCX 파일만 업로드 가능합니다', 'error');
            return;
        }

        setUploading(true);
        try {
            await uploadActivity(file);
            showToast('업로드가 완료되었습니다', 'success');
            await loadActivities();
        } catch (error) {
            const detail = error?.response?.data?.detail;
            if (error?.response?.status === 409 && detail) {
                showToast(detail, 'warning');
            } else {
                showToast('업로드에 실패했습니다', 'error');
            }
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

    const handleDelete = async (e, activityId) => {
        e.preventDefault();
        e.stopPropagation();

        setConfirmDeleteId(activityId);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            await deleteActivity(confirmDeleteId);
            showToast('활동이 삭제되었습니다', 'success');
            await loadActivities();
        } catch (error) {
            showToast('삭제에 실패했습니다', 'error');
        }
        setConfirmDeleteId(null);
    };

    // The backend stores time as-is from TCX (which is UTC)
    // Browser interprets it as local time, making it 9 hours ahead
    // So we need to subtract 9 hours to get the correct KST time
    const toKST = (dateString) => {
        const date = new Date(dateString);
        return new Date(date.getTime() + (9 * 60 * 60 * 1000));
    };

    const filteredActivities = activities.filter((activity) => {
        const date = new Date(activity.start_time);
        const yearMatch = selectedYear === 'all' || date.getFullYear() === selectedYear;
        const monthMatch = selectedMonth === 'all' || (date.getMonth() + 1) === selectedMonth;
        return yearMatch && monthMatch;
    });



    return (
        <div
            className="container"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ position: 'relative' }}
        >
            {isDragging && (
                <div className="drag-overlay">
                    <div className="drag-overlay__content">
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
                </div>
            </div>

            <div className="filter-section">
                <div className="filter-row">
                    <span className="filter-label">연도</span>
                    <div className="filter-pills">
                        <button
                            className={`btn pill ${selectedYear === 'all' ? 'pill--active' : ''}`}
                            onClick={() => { setSelectedYear('all'); setSelectedMonth('all'); }}
                        >
                            전체
                        </button>
                        {years.map((year) => (
                            <button
                                key={year}
                                className={`btn pill ${selectedYear === year ? 'pill--active' : ''}`}
                                onClick={() => { setSelectedYear(year); setSelectedMonth('all'); }}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="filter-row">
                    <span className="filter-label">월</span>
                    <div className="filter-pills">
                        <button
                            className={`btn pill ${selectedMonth === 'all' ? 'pill--active' : ''}`}
                            onClick={() => setSelectedMonth('all')}
                        >
                            전체
                        </button>
                        {months.map((month) => (
                            <button
                                key={month}
                                className={`btn pill ${selectedMonth === month ? 'pill--active' : ''}`}
                                onClick={() => setSelectedMonth(month)}
                            >
                                {month.toString().padStart(2, '0')}월
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card-grid">
                {filteredActivities.map((activity) => (
                    <ActivityCard
                        key={activity.id}
                        activity={activity}
                        toKST={toKST}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {toast && (
                <div className={`app-toast app-toast--${toast.type}`}>
                    <div className="app-toast__title">
                        {toast.type === 'success' ? '성공' : toast.type === 'warning' ? '안내' : '알림'}
                    </div>
                    <div className="app-toast__message">{toast.message}</div>
                </div>
            )}

            {confirmDeleteId && (
                <div className="modal-overlay">
                    <div className="card modal">
                        <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>활동을 삭제할까요?</h3>
                        <p style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                            삭제하면 되돌릴 수 없습니다.
                        </p>
                        <div className="modal__actions">
                            <button
                                className="btn"
                                onClick={() => setConfirmDeleteId(null)}
                                style={{ backgroundColor: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
                            >
                                취소
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={confirmDelete}
                                style={{ backgroundColor: 'var(--error)', color: '#fff', border: 'none' }}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

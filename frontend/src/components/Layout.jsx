import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { LogOut, Home } from 'lucide-react';

const menuItems = [
    { label: '대시보드', icon: Home, path: '/' },
];

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="sidebar__brand">
                    <div className="sidebar__logo">RM</div>
                    <div>
                        <div className="sidebar__title">Running Manager</div>
                        <div className="sidebar__subtitle">SB Admin 스타일</div>
                    </div>
                </div>
                <nav className="sidebar__nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={`sidebar__link ${isActive(item.path) ? 'sidebar__link--active' : ''}`}
                            >
                                <Icon size={18} className="icon-inline" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <button className="btn sidebar__logout" onClick={handleLogout}>
                    <LogOut size={18} className="icon-inline" /> 로그아웃
                </button>
            </aside>
            <main className="app-main">
                <div className="app-main__inner">
                    {children || <Outlet />}
                </div>
            </main>
        </div>
    );
}

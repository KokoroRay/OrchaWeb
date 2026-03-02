import { Link } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

export const AdminPage = () => {
    const { user, logout } = useAuthContext();

    return (
        <div style={{ maxWidth: 960, margin: '40px auto', padding: '24px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Admin Dashboard</h1>
            <p style={{ marginBottom: '24px' }}>
                Xin chào {user?.name || user?.email}. Bạn đã đăng nhập với quyền admin (Cognito group: admin).
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/" style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: 8 }}>
                    Về trang chủ
                </Link>
                <button
                    onClick={logout}
                    style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: 8, cursor: 'pointer' }}
                >
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};

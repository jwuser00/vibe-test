import React from 'react';
import { createPortal } from 'react-dom';

export default function AuthErrorModal({ onConfirm }) {
    console.log('Rendering AuthErrorModal via Portal');
    return createPortal(
        <div className="portal-modal-overlay">
            <div className="portal-modal-card">
                <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#1b1e34' }}>알림</h3>
                <p style={{ marginTop: 0, marginBottom: '1.5rem', color: '#5a5c69' }}>
                    세션이 만료되었습니다. 다시 로그인해주세요.
                </p>
                <div className="modal__actions">
                    <button
                        className="btn btn-primary"
                        onClick={onConfirm}
                        style={{ width: '100%' }}
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

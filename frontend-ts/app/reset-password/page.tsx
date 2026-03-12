'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { resetPassword } from '@/lib/api/auth';
import {
  validatePassword,
  validatePasswordConfirm,
} from '@/lib/validation';
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [touched, setTouched] = useState({ password: false, passwordConfirm: false });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const passwordError = validatePassword(password);
  const passwordConfirmError = validatePasswordConfirm(password, passwordConfirm);
  const isFormValid = !passwordError && !passwordConfirmError;

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, passwordConfirm: true });
    if (!isFormValid || !token) return;

    setLoading(true);
    try {
      await resetPassword(token, password);
      setStatus('success');
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" align="center" sx={{ mb: 3 }}>
            비밀번호 재설정
          </Typography>

          {status === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.
            </Alert>
          )}

          {status === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              링크가 만료되었거나 유효하지 않습니다.
            </Alert>
          )}

          {status === 'idle' && (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                type="password"
                label="새 비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                margin="normal"
                required
                error={touched.password && !!passwordError}
                helperText={touched.password && passwordError ? passwordError : ' '}
              />
              {password && <PasswordStrengthBar password={password} />}
              <TextField
                fullWidth
                type="password"
                label="비밀번호 확인"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                onBlur={() => handleBlur('passwordConfirm')}
                margin="normal"
                required
                error={touched.passwordConfirm && !!passwordConfirmError}
                helperText={
                  touched.passwordConfirm && passwordConfirmError
                    ? passwordConfirmError
                    : ' '
                }
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={!isFormValid || loading}
                sx={{ mt: 2, py: 1.2 }}
              >
                {loading ? '변경 중...' : '비밀번호 변경'}
              </Button>
            </Box>
          )}

          <Typography
            align="center"
            variant="body2"
            sx={{ mt: 2, color: 'text.secondary' }}
          >
            <Link href="/login" style={{ color: '#4e73df' }}>
              로그인으로 돌아가기
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

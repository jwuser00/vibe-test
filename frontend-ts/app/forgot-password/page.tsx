'use client';

import { useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { forgotPassword } from '@/lib/api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
    } catch {
      // Always show success to avoid email enumeration
    } finally {
      setLoading(false);
      setSubmitted(true);
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
          <Typography variant="h5" align="center" sx={{ mb: 1 }}>
            비밀번호 찾기
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            가입한 이메일 주소를 입력하시면 재설정 링크를 발송해 드립니다.
          </Typography>

          {submitted ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              해당 이메일로 비밀번호 재설정 링크를 발송했습니다.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                type="email"
                label="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ mt: 2, py: 1.2 }}
              >
                {loading ? '발송 중...' : '재설정 링크 발송'}
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

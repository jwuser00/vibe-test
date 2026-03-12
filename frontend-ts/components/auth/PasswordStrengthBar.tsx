'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { getPasswordStrength } from '@/lib/validation';

interface PasswordStrengthBarProps {
  password: string;
}

const STRENGTH_CONFIG = {
  weak: { label: '약함', color: '#d32f2f', value: 33 },
  medium: { label: '보통', color: '#ed6c02', value: 66 },
  strong: { label: '강함', color: '#2e7d32', value: 100 },
} as const;

export default function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const config = STRENGTH_CONFIG[strength];

  return (
    <Box sx={{ mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={config.value}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            bgcolor: config.color,
            borderRadius: 3,
          },
        }}
      />
      <Typography
        variant="caption"
        sx={{ color: config.color, mt: 0.5, display: 'block' }}
      >
        비밀번호 강도: {config.label}
      </Typography>
    </Box>
  );
}

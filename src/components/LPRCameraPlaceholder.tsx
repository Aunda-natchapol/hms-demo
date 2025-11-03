import type { FC } from "react";
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Chip,
    Paper,
} from "@mui/material";
import {
    Refresh,
    CheckCircle,
    CameraAlt,
} from '@mui/icons-material';

interface LPRCameraPlaceholderProps {
    isCapturing?: boolean;
    onCapture: () => void;
    capturedResult?: {
        plate_text: string;
        confidence: number;
        captured_at: string;
    } | null;
}

const LPRCameraPlaceholder: FC<LPRCameraPlaceholderProps> = ({
    isCapturing = false,
    onCapture,
    capturedResult
}) => {
    return (
        <Box sx={{ width: '100%', maxWidth: 280, mx: 'auto' }}>

            {/* Camera Monitor Display */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: 140,
                    bgcolor: 'grey.900',
                    borderRadius: 1,
                    border: '2px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    mb: 2,
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.1) inset',
                }}
            >
                {/* Grid pattern overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `
                linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
              `,
                        backgroundSize: '24px 24px',
                        opacity: 0.4,
                    }}
                />

                {/* Monitor display */}
                <Box sx={{ textAlign: 'center', color: 'white', zIndex: 1 }}>
                    <CameraAlt sx={{
                        fontSize: 40,
                        mb: 1,
                        opacity: 0.5,
                        color: 'grey.500'
                    }} />
                    <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
                        Camera Monitor
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.5 }}>
                        {isCapturing ? 'Scanning...' : 'Ready'}
                    </Typography>
                </Box>

                {/* Scanning effect when capturing */}
                {isCapturing && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: 'linear-gradient(90deg, transparent, #2196f3, transparent)',
                            animation: 'scanning 2s ease-in-out infinite',
                            '@keyframes scanning': {
                                '0%': { transform: 'translateY(0)' },
                                '100%': { transform: 'translateY(134px)' },
                            },
                        }}
                    />
                )}

                {/* Detection zone */}
                {!isCapturing && (
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 12,
                            left: 12,
                            right: 12,
                            height: 24,
                            border: '1px dashed rgba(76, 175, 80, 0.6)',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(76, 175, 80, 0.05)',
                        }}
                    >
                        <Typography variant="caption" sx={{ color: 'success.main', fontSize: '0.65rem' }}>
                            Detection Area
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Capture Button */}
            <Button
                variant="contained"
                startIcon={isCapturing ? <CircularProgress size={16} color="inherit" /> : <CameraAlt />}
                onClick={onCapture}
                disabled={isCapturing}
                fullWidth
                sx={{
                    mb: 2,
                    py: 1,
                    fontSize: '0.875rem'
                }}
            >
                {isCapturing ? 'กำลังตรวจจับ...' : 'ถ่ายภาพ'}
            </Button>

            {/* Show captured result */}
            {capturedResult && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        bgcolor: 'success.50',
                        border: 1,
                        borderColor: 'success.200',
                        borderRadius: 1,
                        mb: 1
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircle sx={{ mr: 1, color: 'success.main', fontSize: 18 }} />
                        <Typography variant="body2" color="success.main" fontWeight="medium">
                            ตรวจจับสำเร็จ
                        </Typography>
                    </Box>

                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, fontFamily: 'monospace' }}>
                        {capturedResult.plate_text}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                            size="small"
                            label={`${Math.round(capturedResult.confidence * 100)}%`}
                            color={capturedResult.confidence > 0.8 ? 'success' : 'warning'}
                            variant="outlined"
                        />
                        <Button
                            size="small"
                            startIcon={<Refresh />}
                            onClick={onCapture}
                            disabled={isCapturing}
                            variant="text"
                        >
                            ถ่ายใหม่
                        </Button>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default LPRCameraPlaceholder;

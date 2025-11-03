// RoomStatusChangeDialog.tsx

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    Card,
    CardActionArea,
    Box,
    useTheme,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { getStatusIcon, getStatusColor } from '../constants/roomStatus';

// Define the type for a Status Option (based on your service's inferred structure)
interface StatusOption {
    value: 'vacant' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance' | 'custom';
    label: string;
    icon: string; // The string name of the icon
    color: string; // MUI color name or hex code for display
}

interface Room {
    id: number | string;
    number: string;
    status: StatusOption['value'];
}

interface RoomStatusChangeDialogProps {
    open: boolean;
    onClose: () => void;
    room: Room | null;
    statusOptions: StatusOption[];
    onStatusChange: (status: StatusOption['value']) => void;
}

// Use shared getStatusIcon/getStatusText/getStatusChipColor helpers

const RoomStatusChangeDialog: React.FC<RoomStatusChangeDialogProps> = ({
    open,
    onClose,
    room,
    statusOptions,
    onStatusChange,
}) => {
    const theme = useTheme();

    if (!room) {
        return null;
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md" // Increased size for a better card layout
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="h5" fontWeight="bold">
                    เปลี่ยนสถานะห้อง <Box component="span" sx={{ color: theme.palette.primary.main }}>{room.number}</Box>
                </Typography>
                <Button onClick={onClose} startIcon={<CloseIcon />} color="error">ปิด</Button>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    เลือกสถานะใหม่สำหรับห้องพักนี้:
                </Typography>

                <Grid container spacing={2}>
                    {statusOptions.map((option) => {
                        const isSelected = room.status === option.value;
                        const mappedStatus = option.value as string;
                        const statusColorHex = getStatusColor(mappedStatus);

                        return (
                            <Grid item xs={12} sm={6} md={4} key={option.value}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 2,
                                        transition: 'all 0.2s',
                                        borderColor: isSelected ? statusColorHex : theme.palette.grey[300],
                                        borderWidth: isSelected ? 3 : 1, // Highlight border for selected
                                        bgcolor: isSelected ? `${statusColorHex}10` : 'background.paper',
                                        '&:hover': {
                                            boxShadow: `0 0 10px 0 ${statusColorHex}40`,
                                        }
                                    }}
                                >
                                    <CardActionArea
                                        onClick={() => onStatusChange(option.value)}
                                        sx={{
                                            p: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            minHeight: 120
                                        }}
                                    >
                                        <Box sx={{ fontSize: 40, color: statusColorHex, mb: 1 }}>
                                            {getStatusIcon(option.value)}
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            <Box
                                                aria-hidden
                                                sx={{
                                                    width: 14,
                                                    height: 14,
                                                    borderRadius: '50%',
                                                    bgcolor: statusColorHex,
                                                    border: '1px solid',
                                                    borderColor: `${statusColorHex}`,
                                                    boxShadow: 'none'
                                                }}
                                            />
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="bold"
                                                color="text.primary"
                                            >
                                                {option.label}
                                            </Typography>
                                        </Box>

                                        {isSelected && (
                                            <CheckCircleIcon sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                color: statusColorHex,
                                                fontSize: 20
                                            }} />
                                        )}

                                        {/* Optional: Add a simple pulse animation keyframe for visual feedback */}
                                        <style>{`
                                            @keyframes pulse {
                                                0% { transform: scale(1); opacity: 1; }
                                                100% { transform: scale(1.03); opacity: 0.95; }
                                            }
                                        `}</style>

                                    </CardActionArea>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button onClick={onClose} variant="outlined">ยกเลิก</Button>
            </DialogActions>
        </Dialog>
    );
};

export default RoomStatusChangeDialog;
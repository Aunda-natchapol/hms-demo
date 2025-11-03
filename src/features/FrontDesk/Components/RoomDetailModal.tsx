import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    Card,
    CardContent,
    IconButton,
    Avatar,

} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
    Close,
    Hotel,
    Person,
    CalendarToday,
    DirectionsCar,

    Phone,
    Email,
    CreditCard,
} from '@mui/icons-material';
import type { IRoom, IReservation, IGuest } from '../../../types';
import { getStatusText, getStatusColor } from '../constants/roomStatus';

interface RoomDetailModalProps {
    open: boolean;
    onClose: () => void;
    room: IRoom | null;
    reservation: IReservation | null;
    guest: IGuest | null;
    roomType: { name: string; code: string; base_price?: number; } | null;
}

const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
    open,
    room,
    reservation,
    guest,
    roomType,
    onClose
}) => {
    if (!room) return null;

    // using shared getStatusText/getStatusColor for consistency

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Hotel />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">
                            ห้อง {room.number}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ชั้น {room.floor} • {roomType?.name || 'ไม่ทราบประเภท'}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Use canonical hex color and white text for clear contrast */}
                    <Chip
                        label={getStatusText(room.status)}
                        variant="filled"
                        sx={{
                            bgcolor: getStatusColor(room.status),
                            color: '#fff',
                            fontWeight: 700,
                            px: 1.2,
                            py: 0.4,
                            borderRadius: 1
                        }}
                    />
                    <IconButton onClick={onClose}>
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3 }}>
                <Grid container spacing={3}>
                    {/* Room Info */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ height: 'fit-content' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Hotel color="primary" />
                                    ข้อมูลห้องพัก
                                </Typography>
                                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">หมายเลขห้อง:</Typography>
                                        <Typography fontWeight="600">{room.number}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">ชั้น:</Typography>
                                        <Typography fontWeight="600">{room.floor}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">ประเภทห้อง:</Typography>
                                        <Typography fontWeight="600">{roomType?.name || 'ไม่ทราบ'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">รหัสประเภท:</Typography>
                                        <Typography fontWeight="600">{roomType?.code || 'N/A'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">ราคาเริ่มต้น:</Typography>
                                        <Typography fontWeight="600" sx={{ color: 'text.primary' }}>
                                            {roomType?.base_price !== undefined ? `฿${roomType.base_price.toLocaleString()}` : '-'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">สถานะ:</Typography>
                                        <Chip
                                            label={getStatusText(room.status)}
                                            size="small"
                                            sx={{
                                                bgcolor: getStatusColor(room.status),
                                                color: '#fff',
                                                fontWeight: 600,
                                                height: 24,
                                                '& .MuiChip-label': { px: 1 }
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Guest Info */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        {guest && reservation ? (
                            <Card sx={{ height: 'fit-content' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <Person color="primary" />
                                        ข้อมูลแขก
                                    </Typography>
                                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">ชื่อ:</Typography>
                                            <Typography fontWeight="600">
                                                {guest.name}
                                            </Typography>
                                        </Box>
                                        {guest.email && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">อีเมล:</Typography>
                                                <Typography fontWeight="600" sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5
                                                }}>
                                                    <Email fontSize="small" />
                                                    {guest.email}
                                                </Typography>
                                            </Box>
                                        )}
                                        {guest.phone && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">โทรศัพท์:</Typography>
                                                <Typography fontWeight="600" sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5
                                                }}>
                                                    <Phone fontSize="small" />
                                                    {guest.phone}
                                                </Typography>
                                            </Box>
                                        )}
                                        {/* License plate would come from checkin data */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">ป้ายทะเบียน:</Typography>
                                            <Typography fontWeight="600" sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5
                                            }}>
                                                <DirectionsCar fontSize="small" />
                                                ไม่ระบุ
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card sx={{ height: 'fit-content', bgcolor: '#F5F6FA', border: '1px solid #E0E0E0' }}>
                                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                    <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary">
                                        ไม่มีแขกในห้อง
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ห้องนี้ปัจจุบันว่าง
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}
                    </Grid>

                    {/* Reservation Info */}
                    {reservation && (
                        <Grid size={{ xs: 12 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <CalendarToday color="primary" />
                                        ข้อมูลการจอง
                                    </Typography>
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography color="text.secondary">รหัสการจอง:</Typography>
                                                    <Typography fontWeight="600">{reservation.id}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography color="text.secondary">เช็คอิน:</Typography>
                                                    <Typography fontWeight="600">
                                                        {formatDate(reservation.arrival_date)}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography color="text.secondary">เช็คเอาท์:</Typography>
                                                    <Typography fontWeight="600">
                                                        {formatDate(reservation.departure_date)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography color="text.secondary">สถานะ:</Typography>
                                                    <Chip
                                                        label={reservation.status}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography color="text.secondary">จำนวนคืน:</Typography>
                                                    <Typography fontWeight="600">
                                                        {Math.ceil((new Date(reservation.departure_date).getTime() - new Date(reservation.arrival_date).getTime()) / (1000 * 60 * 60 * 24))} คืน
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography color="text.secondary">ยอดรวม:</Typography>
                                                    <Typography fontWeight="600" sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.5,
                                                        color: 'success.main'
                                                    }}>
                                                        <CreditCard fontSize="small" />
                                                        ฿{reservation.total_amount?.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} variant="outlined">
                    ปิด
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RoomDetailModal;
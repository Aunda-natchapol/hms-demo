import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid2,
  TextField,
  MenuItem,
  Button,
  Autocomplete,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import frontDeskService, { type RoomTransfer } from '../Services/FrontDeskService';

const RoomTransferView: React.FC = observer(() => {
  const [fromRoom, setFromRoom] = useState('');
  const [toRoom, setToRoom] = useState('');
  const [guestName, setGuestName] = useState('');
  const [reservationId, setReservationId] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState<RoomTransfer | null>(null);
  const [statusDialog, setStatusDialog] = useState(false);

  // Mock room numbers for autocomplete
  const roomNumbers = Array.from({ length: 30 }, (_, i) => {
    const floor = Math.floor(i / 10) + 1;
    const room = (i % 10) + 1;
    return `${floor}${room.toString().padStart(2, '0')}`;
  });



  const transferReasons = [
    'แขกร้องเรียนเกี่ยวกับเสียงรบกวน',
    'ห้องต้องการการบำรุงรักษา',
    'แขกขอปรับปรุงห้อง',
    'ห้องยังไม่พร้อม',
    'ความต้องการของแขก',
    'การอพยพฉุกเฉิน',
    'อื่นๆ'
  ];

  const handleSubmit = () => {
    // Validation: จำเป็นต้องมี fromRoom, toRoom, reason เท่านั้น
    // guestName และ reservationId ไม่บังคับ (สำหรับ walk-in guests)
    if (!fromRoom || !toRoom || !reason) {
      alert('กรุณากรอกข้อมูลที่จำเป็น: ห้องต้นทาง, ห้องปลายทาง, และเหตุผล');
      return;
    }

    if (fromRoom === toRoom) {
      alert('ห้องต้นทางและปลายทางต้องไม่เหมือนกัน');
      return;
    }

    frontDeskService.addRoomTransfer({
      fromRoom,
      toRoom,
      guestName: guestName || 'ไม่ระบุ', // Default value if not provided
      reservationId,
      reason,
      transferredAt: new Date(),
      transferredBy: 'CurrentUser', // In real app, get from auth
      status: 'Pending',
      notes,
    });

    setSuccessMessage('ส่งคำขอย้ายห้องเรียบร้อย!');
    // Reset form
    setFromRoom('');
    setToRoom('');
    setGuestName('');
    setReservationId('');
    setReason('');
    setNotes('');

    setTimeout(() => setSuccessMessage(''), 3000);
  };


  const handleStatusUpdate = (transfer: RoomTransfer, newStatus: RoomTransfer['status']) => {
    frontDeskService.updateTransferStatus(transfer.id, newStatus);
    setSelectedTransfer(null);
    setStatusDialog(false);
  };

  const openStatusDialog = (transfer: RoomTransfer) => {
    setSelectedTransfer(transfer);
    setStatusDialog(true);
  };

  const pendingTransfers = frontDeskService.getPendingTransfers();
  const allTransfers = frontDeskService.roomTransfers;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <ScheduleIcon />;
      case 'Completed': return <CheckCircleIcon />;
      case 'Cancelled': return <CancelIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending': return 'รอดำเนินการ';
      case 'Completed': return 'เสร็จสิ้น';
      case 'Cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  return (
    <Box sx={{
      width: '100%',
      maxWidth: 'none',
      p: { xs: 2, md: 3 },
      bgcolor: 'background.default',
      minHeight: '100vh'
    }}>
      <Typography variant="h4" gutterBottom>
        ย้ายห้องพัก
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        จัดการการย้ายแขกจากห้องหนึ่งไปยังอีกห้องหนึ่ง
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Grid2 container spacing={3}>
        {/* Transfer Form */}
        <Grid2 size={{ xs: 12, md: 8 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
              <Typography variant="h6" gutterBottom>
                คำขอย้ายห้องพักใหม่
              </Typography>

              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    options={roomNumbers}
                    value={fromRoom}
                    onChange={(_, value) => setFromRoom(value || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="จากห้อง"
                        required
                        fullWidth
                      />
                    )}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    options={roomNumbers}
                    value={toRoom}
                    onChange={(_, value) => setToRoom(value || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="ไปห้อง"
                        required
                        fullWidth
                      />
                    )}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="ชื่อแขก (ไม่บังคับ)"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="ชื่อแขกที่ต้องการย้ายห้อง"
                    fullWidth
                    helperText="ถ้าไม่ทราบชื่อแขกสามารถปล่อยว่างได้"
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="รหัสการจอง (ไม่บังคับ)"
                    value={reservationId}
                    onChange={(e) => setReservationId(e.target.value)}
                    placeholder="ระบุหากมีการจองล่วงหน้า"
                    fullWidth
                    helperText="สำหรับแขกที่มีการจองเท่านั้น - แขก walk-in ไม่ต้องใส่"
                  />
                </Grid2>
                <Grid2 size={{ xs: 12 }}>
                  <FormControl fullWidth required>
                    <InputLabel>เหตุผลในการย้าย</InputLabel>
                    <Select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      label="เหตุผลในการย้าย"
                    >
                      {transferReasons.map((reasonOption) => (
                        <MenuItem key={reasonOption} value={reasonOption}>
                          {reasonOption}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>
              </Grid2>

              <TextField
                label="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={3}
                fullWidth
                sx={{ mt: 2 }}
                placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับการย้ายห้อง..."
              />

              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!fromRoom || !toRoom || !reason}
                  startIcon={<SwapIcon />}
                >
                  ขอย้ายห้อง
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid2>

        {/* การย้ายที่รอดำเนินการ */}
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
              <Typography variant="h6" gutterBottom>
                การย้ายที่รอดำเนินการ
              </Typography>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {pendingTransfers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                รอการอนุมัติ
              </Typography>

              {pendingTransfers.map((transfer) => (
                <Box
                  key={transfer.id}
                  sx={{
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => openStatusDialog(transfer)}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {transfer.guestName}
                  </Typography>
                  <Typography variant="body2">
                    {transfer.fromRoom} → {transfer.toRoom}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {transfer.reason}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={getStatusText(transfer.status)}
                      size="small"
                      color={getStatusColor(transfer.status) as 'warning' | 'success' | 'error' | 'default'}
                      icon={getStatusIcon(transfer.status)}
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      {/* All Transfers Table */}
      <Card sx={{ mt: 3, boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Typography variant="h6" gutterBottom>
            ประวัติการย้าย
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>วันที่</TableCell>
                  <TableCell>แขก</TableCell>
                  <TableCell>จากห้อง</TableCell>
                  <TableCell>ไปห้อง</TableCell>
                  <TableCell>รหัสจอง</TableCell>
                  <TableCell>เหตุผล</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>ดำเนินการโดย</TableCell>
                  <TableCell>การจัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>{transfer.transferredAt.toLocaleDateString()}</TableCell>
                    <TableCell>{transfer.guestName}</TableCell>
                    <TableCell>{transfer.fromRoom}</TableCell>
                    <TableCell>{transfer.toRoom}</TableCell>
                    <TableCell>{transfer.reservationId}</TableCell>
                    <TableCell>{transfer.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(transfer.status)}
                        size="small"
                        color={getStatusColor(transfer.status) as 'warning' | 'success' | 'error' | 'default'}
                        icon={getStatusIcon(transfer.status)}
                      />
                    </TableCell>
                    <TableCell>{transfer.transferredBy}</TableCell>
                    <TableCell>
                      {transfer.status === 'Pending' && (
                        <Button
                          size="small"
                          onClick={() => openStatusDialog(transfer)}
                          variant="outlined"
                        >
                          ตรวจสอบ
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Status Update Dialog - ปรับปรุงใหม่ */}
      <Dialog
        open={statusDialog}
        onClose={() => setStatusDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 'none'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'primary.50',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 2
        }}>
          <SwapIcon />
          ตรวจสอบคำขอย้ายห้อง
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedTransfer && (
            <Box>
              {/* Header Card */}
              <Card sx={{ mb: 3, bgcolor: 'background.paper', boxShadow: 'none', border: 'none' }}>
                <CardContent sx={{ p: 2, background: 'transparent' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      รายละเอียดการย้าย
                    </Typography>
                    <Chip
                      label={getStatusText(selectedTransfer.status)}
                      color={getStatusColor(selectedTransfer.status) as 'warning' | 'success' | 'error' | 'default'}
                      icon={getStatusIcon(selectedTransfer.status)}
                      variant="filled"
                    />
                  </Box>

                  {/* Room Transfer Visual */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 2
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">จากห้อง</Typography>
                      <Typography variant="h4" fontWeight="bold" color="error.main">
                        {selectedTransfer.fromRoom}
                      </Typography>
                    </Box>
                    <SwapIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">ไปห้อง</Typography>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {selectedTransfer.toRoom}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Details Grid */}
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">ชื่อแขก</Typography>
                    <Typography variant="body1" fontWeight="600">{selectedTransfer.guestName}</Typography>
                  </Box>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">รหัสการจอง</Typography>
                    <Typography variant="body1" fontWeight="600">
                      {selectedTransfer.reservationId || 'ไม่มี (Walk-in)'}
                    </Typography>
                  </Box>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">เหตุผลในการย้าย</Typography>
                    <Typography variant="body1" fontWeight="600">{selectedTransfer.reason}</Typography>
                  </Box>
                </Grid2>

                {selectedTransfer.notes && (
                  <Grid2 size={{ xs: 12 }}>
                    <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
                      <Typography variant="caption" color="info.main" display="block" fontWeight="600">หมายเหตุเพิ่มเติม</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedTransfer.notes}</Typography>
                    </Box>
                  </Grid2>
                )}

                <Grid2 size={{ xs: 12 }}>
                  <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                    <Typography variant="caption" color="warning.main" display="block" fontWeight="600">เวลาที่ร้องขอ</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {selectedTransfer.transferredAt.toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                </Grid2>
              </Grid2>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{
          p: 3,
          bgcolor: 'background.paper',
          gap: 1
        }}>
          <Button
            onClick={() => setStatusDialog(false)}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            ปิด
          </Button>

          {selectedTransfer?.status === 'Pending' && (
            <>
              <Button
                onClick={() => selectedTransfer && handleStatusUpdate(selectedTransfer, 'Cancelled')}
                color="error"
                variant="outlined"
                startIcon={<CancelIcon />}
                sx={{ minWidth: 120 }}
              >
                ปฏิเสธ
              </Button>
              <Button
                onClick={() => selectedTransfer && handleStatusUpdate(selectedTransfer, 'Completed')}
                color="success"
                variant="contained"
                startIcon={<CheckCircleIcon />}
                sx={{ minWidth: 120 }}
              >
                อนุมัติ
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default RoomTransferView;
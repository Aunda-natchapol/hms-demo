import type { FC } from "react";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import {
  Person,
  Hotel,
  Search,
  Save,
  Calculate,
  CheckCircle,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';
import { useNavigate } from "react-router-dom";
import reservationService from "../Services/ReservationService.ts";

const ReservationFormView: FC<{ isEditMode?: boolean; reservationId?: string; }> = observer(({ isEditMode = false, reservationId }) => {
  const navigate = useNavigate();
  const {
    newReservation,
    newGuest,
    selectedReservation,
    availableRooms,
    roomTypes,
    isSaving,
    isValidForCreate,
  } = reservationService;

  const [isSearchingRooms, setIsSearchingRooms] = useState(false);
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  const handleDateChange = (field: 'arrival_date' | 'departure_date', value: string) => {
    reservationService.setNewReservation({ [field]: value });

    // Auto-search rooms when both dates are set
    if (field === 'departure_date' && newReservation.arrival_date) {
      searchAvailableRooms();
    } else if (field === 'arrival_date' && newReservation.departure_date) {
      searchAvailableRooms();
    }
  };

  const searchAvailableRooms = async () => {
    if (!newReservation.arrival_date || !newReservation.departure_date) return;

    setIsSearchingRooms(true);
    try {
      await reservationService.loadAvailableRooms(
        newReservation.arrival_date,
        newReservation.departure_date
      );
      setShowRoomSelection(true);
    } finally {
      setIsSearchingRooms(false);
    }
  };

  const handleRoomSelect = (roomId: string) => {
    reservationService.setNewReservation({ room_id: roomId });
    calculateAmount(roomId);
  };

  const calculateAmount = (roomId: string) => {
    if (!newReservation.arrival_date || !newReservation.departure_date) return;

    const room = availableRooms.find(r => r.id === roomId);
    const roomType = roomTypes.find(rt => rt.id === room?.room_type_id);

    if (roomType) {
      const arrivalDate = new Date(newReservation.arrival_date);
      const departureDate = new Date(newReservation.departure_date);
      const nights = Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
      const amount = roomType.base_price * nights;
      setCalculatedAmount(amount);
    }
  };

  const handleGuestInfoChange = (field: string, value: string) => {
    reservationService.setNewGuest({ [field]: value });
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode && reservationId) {
        const reservation = await reservationService.updateReservation(reservationId);
        alert(`แก้ไขการจองสำเร็จแล้ว! รหัส: ${reservation.id}`);
      } else {
        const reservation = await reservationService.createReservation();
        alert(`สร้างการจองสำเร็จแล้ว! รหัส: ${reservation.id}`);
      }
      navigate('/front-desk/reservations/list');
    } catch (error) {
      alert(`ไม่สามารถ${isEditMode ? 'แก้ไข' : 'สร้าง'}การจองได้: ${error}`);
    }
  };

  const handleSubmitWithDeposit = async () => {
    try {
      // Create reservation first
      const reservation = await reservationService.createReservation();

      // Record deposit payment (30% of total amount)
      const depositAmount = Math.round(calculatedAmount * 0.3);
      await reservationService.recordDepositPayment(reservation.id, depositAmount, 'card');

      alert(`จองและจ่าย Deposit สำเร็จ!\nรหัสจอง: ${reservation.id}\nจำนวน Deposit: ฿${depositAmount.toLocaleString()}`);
      navigate('/front-desk/reservations/list');
    } catch (error) {
      alert(`ไม่สามารถจองและจ่าย Deposit ได้: ${error}`);
    }
  };

  const getDatesValidation = () => {
    if (!newReservation.arrival_date || !newReservation.departure_date) return null;

    const arrival = new Date(newReservation.arrival_date);
    const departure = new Date(newReservation.departure_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (arrival < today) {
      return { type: 'error', message: 'Arrival date cannot be in the past' };
    }
    if (departure <= arrival) {
      return { type: 'error', message: 'Departure date must be after arrival date' };
    }

    const nights = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
    return { type: 'info', message: `Duration: ${nights} night${nights > 1 ? 's' : ''}` };
  };

  const dateValidation = getDatesValidation();

  return (
    <Box sx={{
      width: '100%',
      maxWidth: 'none',
      p: { xs: 2, md: 3 },
      bgcolor: 'background.default',
      minHeight: '100vh'
    }}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isEditMode ? 'แก้ไขการจองห้องพัก' : 'จองห้องพักใหม่'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          {isEditMode ? `แก้ไขข้อมูลการจอง ${selectedReservation?.id || reservationId}` : 'สร้างการจองห้องพักใหม่'}
        </Typography>

        <Grid container spacing={3}>
          {/* Guest Information */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ background: 'transparent' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    ข้อมูลแขก
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="ชื่อแขก (ไม่บังคับ)"
                      value={newGuest.name || ''}
                      onChange={(e) => handleGuestInfoChange('name', e.target.value)}
                      placeholder="ระบุชื่อแขกหรือไม่ก็ได้เพื่อปกป้องความเป็นส่วนตัว"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="หมายเลขโทรศัพท์ (ไม่บังคับ)"
                      value={newGuest.phone || ''}
                      onChange={(e) => handleGuestInfoChange('phone', e.target.value)}
                      placeholder="ระบุหมายเลขโทรศัพท์หรือไม่ก็ได้"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="อีเมล"
                      type="email"
                      value={newGuest.email || ''}
                      onChange={(e) => handleGuestInfoChange('email', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="เลขบัตรประชาชน/หนังสือเดินทาง"
                      value={newGuest.document_number || ''}
                      onChange={(e) => handleGuestInfoChange('document_number', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Reservation Details */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ background: 'transparent' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Hotel sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    รายละเอียดการจอง
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DatePicker
                      label="วันเช็คอิน"
                      sx={{ width: "100%" }}
                      value={newReservation.arrival_date ? dayjs(newReservation.arrival_date) : null}
                      onChange={(newValue: Dayjs | null) => {
                        if (newValue) {
                          handleDateChange('arrival_date', newValue.format('YYYY-MM-DD') + 'T14:00:00.000Z');
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DatePicker
                      label="วันเช็คเอาท์"
                      sx={{ width: "100%" }}
                      value={newReservation.departure_date ? dayjs(newReservation.departure_date) : null}
                      onChange={(newValue: Dayjs | null) => {
                        if (newValue) {
                          handleDateChange('departure_date', newValue.format('YYYY-MM-DD') + 'T12:00:00.000Z');
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                {dateValidation && (
                  <Alert
                    severity={dateValidation.type as 'error' | 'info'}
                    sx={{ mt: 2 }}
                  >
                    {dateValidation.message}
                  </Alert>
                )}

                {showRoomSelection && (
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={isSearchingRooms ? <CircularProgress size={20} /> : <Search />}
                      onClick={searchAvailableRooms}
                      disabled={isSearchingRooms || !newReservation.arrival_date || !newReservation.departure_date}
                      sx={{ mb: 2 }}
                    >
                      {isSearchingRooms ? 'กำลังค้นหา...' : 'ค้นหาห้องว่าง'}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Available Rooms */}
          {showRoomSelection && availableRooms.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ background: 'transparent' }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Available Rooms
                  </Typography>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Room Number</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Price per Night</TableCell>
                          <TableCell align="center">Select</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {availableRooms.map((room) => {
                          const roomType = roomTypes.find(rt => rt.id === room.room_type_id);
                          const isSelected = newReservation.room_id === room.id;

                          return (
                            <TableRow
                              key={room.id}
                              hover
                              selected={isSelected}
                              sx={{ cursor: 'pointer' }}
                              onClick={() => handleRoomSelect(room.id)}
                            >
                              <TableCell>
                                <Typography variant="body1" fontWeight="bold">
                                  Room {room.number}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Floor {room.floor}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={roomType?.name || 'ไม่ทราบ'}
                                  size="small"
                                  color={isSelected ? 'primary' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {roomType?.description || 'No description'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body1" fontWeight="bold">
                                  ฿{roomType?.base_price.toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {isSelected && (
                                  <CheckCircle color="success" />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Calculation Summary */}
          {newReservation.room_id && calculatedAmount > 0 && (
            <Grid size={{ xs: 12 }}>
              <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ background: 'transparent' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Calculate sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">
                      Reservation Summary
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Selected Room
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        Room {availableRooms.find(r => r.id === newReservation.room_id)?.number}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Room Type
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {roomTypes.find(rt => rt.id === availableRooms.find(r => r.id === newReservation.room_id)?.room_type_id)?.name}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <Typography variant="h6" fontWeight="bold">
                        จำนวนเงินรวม
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.ceil((new Date(newReservation.departure_date || '').getTime() - new Date(newReservation.arrival_date || '').getTime()) / (1000 * 60 * 60 * 24))} nights
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="h4" fontWeight="bold" color="primary.main" align="right">
                        ฿{calculatedAmount.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>

                  {calculatedAmount > 0 && (
                    <Grid container spacing={2} sx={{ mt: 1, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Deposit (30%)
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          ฿{Math.round(calculatedAmount * 0.3).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          คงเหลือ (เช็คเอาท์)
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="warning.main">
                          ฿{Math.round(calculatedAmount * 0.7).toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Actions */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ background: 'transparent' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {isEditMode ? 'อัปเดตการจอง' : 'สร้างการจอง'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ตรวจสอบข้อมูลทั้งหมดก่อน{isEditMode ? 'อัปเดต' : 'สร้าง'}การจอง
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/front-desk/reservations/list')}
                      disabled={isSaving}
                    >
                      ยกเลิก
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<Save />}
                      onClick={handleSubmit}
                      disabled={!isValidForCreate || isSaving}
                      sx={{ minWidth: 160 }}
                    >
                      {isEditMode ? 'อัปเดตการจอง' : 'จองไว้ก่อน'}
                    </Button>

                    {!isEditMode && (
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={isSaving ? <CircularProgress size={20} /> : <CheckCircle />}
                        onClick={handleSubmitWithDeposit}
                        disabled={!isValidForCreate || isSaving}
                        sx={{ minWidth: 180 }}
                      >
                        {isSaving ? 'กำลังจ่าย...' : 'จอง + จ่าย Deposit'}
                      </Button>
                    )}
                  </Box>
                </Box>

                {!isValidForCreate && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    กรุณากรอกข้อมูลจำเป็น: วันเช็คอิน/เช็คเอาท์ และเลือกห้องพัก
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </LocalizationProvider>
    </Box>
  );
});

export default ReservationFormView;
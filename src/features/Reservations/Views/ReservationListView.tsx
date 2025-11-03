import type { FC } from "react";
import { observer } from "mobx-react-lite";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import {
  Search,
  Add,
  Edit,
  Cancel,
  MoreVert,
  Person,
  Hotel,
  EventAvailable,
} from '@mui/icons-material';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import reservationService from "../Services/ReservationService.ts";
import type { IReservation } from "../../../types";

const ReservationListView: FC = observer(() => {
  const navigate = useNavigate();
  const {
    filteredReservations,
    searchTerm,
    statusFilter,
    isLoading,
  } = reservationService;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReservation, setSelectedReservation] = useState<IReservation | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, reservation: IReservation) => {
    setAnchorEl(event.currentTarget);
    setSelectedReservation(reservation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReservation(null);
  };

  const handleStatusChange = async (reservationId: string, newStatus: IReservation['status']) => {
    await reservationService.updateReservationStatus(reservationId, newStatus);
    handleMenuClose();
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกการจองนี้?")) {
      await reservationService.cancelReservation(reservationId);
      handleMenuClose();
    }
  };

  const handleEditReservation = (reservationId: string) => {
    // เตรียมข้อมูลสำหรับแก้ไข
    const reservation = filteredReservations.find(r => r.id === reservationId);
    if (reservation) {
      // ส่งข้อมูลไปยังหน้าแก้ไข
      navigate(`/reservations/edit/${reservationId}`);
    }
    handleMenuClose();
  };

  const getStatusColor = (status: IReservation['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'checked-in': return 'info';
      case 'checked-out': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: IReservation['status']) => {
    switch (status) {
      case 'pending': return <EventAvailable />;
      case 'confirmed': return <EventAvailable />;
      case 'checked-in': return <EventAvailable />;
      case 'checked-out': return <EventAvailable />;
      case 'cancelled': return <Cancel />;
      default: return <EventAvailable />;
    }
  };

  const getStatusText = (status: IReservation['status']) => {
    switch (status) {
      case 'pending': return 'รอยืนยัน';
      case 'confirmed': return 'ยืนยันแล้ว';
      case 'checked-in': return 'เช็คอินแล้ว';
      case 'checked-out': return 'เช็คเอาต์แล้ว';
      case 'cancelled': return 'ยกเลิกแล้ว';
      default: return status;
    }
  };

  const getAvailableActions = (status: IReservation['status']) => {
    switch (status) {
      case 'pending':
        return ['confirm', 'edit', 'cancel'];
      case 'confirmed':
        return ['edit', 'cancel'];
      case 'checked-in':
        return ['edit'];
      case 'checked-out':
        return ['edit'];
      default:
        return ['edit'];
    }
  };

  return (
    <Box sx={{
      p: { xs: 2, md: 3 },
      width: '100%',
      maxWidth: 'none',
      bgcolor: 'background.default',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            การจองห้องพัก
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            จัดการการจองห้องพักและการจองห้องของโรงแรม
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          size="large"
          href="/front-desk/reservations/create"
        >
          จองห้องใหม่
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="ค้นหาชื่อแขก เบอร์โทร หรือรหัสการจอง..."
                value={searchTerm}
                onChange={(e) => reservationService.setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>กรองสถานะ</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => reservationService.setStatusFilter(e.target.value as IReservation['status'] | 'all')}
                  label="กรองสถานะ"
                >
                  <MenuItem value="all">ทุกสถานะ</MenuItem>
                  <MenuItem value="pending">รอยืนยัน</MenuItem>
                  <MenuItem value="confirmed">ยืนยันแล้ว</MenuItem>
                  <MenuItem value="checked-in">เช็คอินแล้ว</MenuItem>
                  <MenuItem value="checked-out">เช็คเอาต์แล้ว</MenuItem>
                  <MenuItem value="cancelled">ยกเลิกแล้ว</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`ทั้งหมด: ${filteredReservations.length}`}
                  color="primary"
                />
                <Chip
                  size="small"
                  label={`รอยืนยัน: ${filteredReservations.filter(r => r.status === 'pending').length}`}
                  color="warning"
                />
                <Chip
                  size="small"
                  label={`ยืนยันแล้ว: ${filteredReservations.filter(r => r.status === 'confirmed').length}`}
                  color="success"
                />
                <Chip
                  size="small"
                  label={`เช็คอินแล้ว: ${filteredReservations.filter(r => r.status === 'checked-in').length}`}
                  color="info"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-head': { backgroundColor: 'grey.100', fontWeight: 'bold' } }}>
                <TableCell>รหัสการจอง</TableCell>
                <TableCell>แขก</TableCell>
                <TableCell>ห้อง</TableCell>
                <TableCell>เช็คอิน</TableCell>
                <TableCell>เช็คเอาท์</TableCell>
                <TableCell>จำนวนเงิน</TableCell>
                <TableCell>Deposit</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell align="center">การดำเนินการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    กำลังโหลดข้อมูลการจอง...
                  </TableCell>
                </TableRow>
              ) : filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      ไม่พบการจองที่ตรงกับเงื่อนไขที่ค้นหา
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((reservation) => {
                  const guest = reservationService.getGuestById(reservation.guest_id);
                  const availableActions = getAvailableActions(reservation.status);

                  return (
                    <TableRow key={reservation.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {reservation.id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          สร้างเมื่อ: {new Date(reservation.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {guest?.name || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {guest?.phone || 'ไม่มีเบอร์โทร'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Hotel sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {reservation.room_id.replace('room-', 'Room ')}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {new Date(reservation.arrival_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(reservation.arrival_date).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {new Date(reservation.departure_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(reservation.departure_date).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          ฿{reservation.total_amount?.toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label="฿0"
                          color="default"
                          size="small"
                          sx={{ minWidth: 80 }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          ยังไม่จ่าย
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={getStatusIcon(reservation.status)}
                          label={getStatusText(reservation.status)}
                          color={getStatusColor(reservation.status)}
                          size="small"
                          sx={{ minWidth: 120 }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        {availableActions.length > 0 && (
                          <Tooltip title="การดำเนินการเพิ่มเติม">
                            <IconButton
                              onClick={(e) => handleMenuOpen(e, reservation)}
                              size="small"
                            >
                              <MoreVert />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedReservation && getAvailableActions(selectedReservation.status).map((action) => {
          switch (action) {
            case 'confirm':
              return (
                <MenuItem
                  key={action}
                  onClick={() => handleStatusChange(selectedReservation.id, 'confirmed')}
                >
                  <ListItemIcon>
                    <EventAvailable fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>ยืนยันการจอง</ListItemText>
                </MenuItem>
              );
            case 'edit':
              return (
                <MenuItem
                  key={action}
                  onClick={() => handleEditReservation(selectedReservation.id)}
                >
                  <ListItemIcon>
                    <Edit fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>แก้ไขรายละเอียด</ListItemText>
                </MenuItem>
              );
            case 'cancel':
              return (
                <MenuItem
                  key={action}
                  onClick={() => handleCancelReservation(selectedReservation.id)}
                  sx={{ color: 'error.main' }}
                >
                  <ListItemIcon>
                    <Cancel fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>ยกเลิกการจอง</ListItemText>
                </MenuItem>
              );
            default:
              return null;
          }
        })}
      </Menu>
    </Box>
  );
});

export default ReservationListView;
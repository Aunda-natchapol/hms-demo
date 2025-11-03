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
  Alert,
  Chip,
  CircularProgress,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import {
  Person,
  Hotel,
  DirectionsCar,
  Login,
  Refresh,
} from '@mui/icons-material';
import frontDeskService from "../Services/FrontDeskService.ts";
import type { IRoom } from "../../../types";
import { getStatusText, getStatusChipColor } from '../constants/roomStatus';
import LPRCameraPlaceholder from "../../../components/LPRCameraPlaceholder.tsx";

const CheckinView: FC = observer(() => {
  const {
    selectedRoom,
    selectedReservation,
    guestInfo,
    licensePlate,
    availableRooms,
    isLoading,
    checkingIn,
    lprCapturing,
    lprResult,
    isValidForCheckin,
  } = frontDeskService;

  const handleRoomSelect = (roomId: string) => {
    const room = availableRooms.find(r => r.id === roomId);
    frontDeskService.setSelectedRoom(room || null);
  };

  const handleGuestInfoChange = (field: string, value: string) => {
    frontDeskService.setGuestInfo({ [field]: value });
  };

  const handleLicensePlateChange = (value: string) => {
    frontDeskService.setLicensePlate(value);
  };

  const handleLPRCapture = () => {
    frontDeskService.captureLicensePlate();
  };

  const handleCheckin = async () => {
    try {
      await frontDeskService.performCheckin();
      alert("Check-in successful! Guest has been checked in.");
    } catch (error) {
      alert(`Check-in failed: ${error}`);
    }
  };

  // Use shared helpers
  const getRoomStatusColor = (status: IRoom['status']) => getStatusChipColor(status);
  const getRoomStatusText = (status: IRoom['status']) => getStatusText(status);

  return (
    <Box sx={{
      width: '100%',
      maxWidth: 'none',
      p: { xs: 2, md: 3 },
      bgcolor: 'background.default',
      minHeight: '100vh'
    }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        เช็คอินแขก
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        ดำเนินการเช็คอินแขกพร้อมการจัดห้องและลงทะเบียนป้ายทะเบียน
      </Typography>

      <Grid container spacing={3}>
        {/* Room Selection */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Hotel sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  เลือกห้องพัก
                </Typography>
              </Box>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>เลือกห้อง</InputLabel>
                <Select
                  value={selectedRoom?.id || ''}
                  onChange={(e) => handleRoomSelect(e.target.value)}
                  label="เลือกห้อง"
                  disabled={isLoading}
                >
                  {availableRooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography sx={{ flexGrow: 1 }}>
                          ห้อง {room.number} (ชั้น {room.floor})
                        </Typography>
                        <Chip
                          size="small"
                          label={getRoomStatusText(room.status)}
                          color={getRoomStatusColor(room.status)}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedRoom && (
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    รายละเอียดห้องที่เลือก
                  </Typography>
                  <Typography variant="body1">
                    <strong>ห้อง:</strong> {selectedRoom.number}
                  </Typography>
                  <Typography variant="body1">
                    <strong>ชั้น:</strong> {selectedRoom.floor}
                  </Typography>
                  <Typography variant="body1">
                    <strong>สถานะ:</strong> {getRoomStatusText(selectedRoom.status)}
                  </Typography>

                  {selectedReservation && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" color="primary.main">
                        การจองที่มีอยู่
                      </Typography>
                      <Typography variant="body2">
                        <strong>รหัสจอง:</strong> {selectedReservation.id}
                      </Typography>
                      <Typography variant="body2">
                        <strong>จำนวนเงิน:</strong> ฿{selectedReservation.total_amount?.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Guest Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  ข้อมูลแขก
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="ชื่อแขก"
                    value={guestInfo.name || ''}
                    onChange={(e) => handleGuestInfoChange('name', e.target.value)}
                    placeholder="กรอกชื่อแขก (ไม่บังคับ)"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="หมายเลขโทรศัพท์"
                    value={guestInfo.phone || ''}
                    onChange={(e) => handleGuestInfoChange('phone', e.target.value)}
                    placeholder="กรอกเบอร์โทรศัพท์ (ไม่บังคับ)"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="อีเมล"
                    type="email"
                    value={guestInfo.email || ''}
                    onChange={(e) => handleGuestInfoChange('email', e.target.value)}
                    placeholder="กรอกอีเมล (ไม่บังคับ)"
                  />
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 2 }}>
                ข้อมูลแขกเป็นข้อมูลเสริมและสามารถกรอกตามความสะดวกของลูกค้า
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* License Plate Registration - ปรับปรุงใหม่ */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3, background: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DirectionsCar sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    ลงทะเบียนป้ายทะเบียนรถ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ใช้กล้องสแกนหรือกรอกข้อมูลด้วยตนเอง
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={4}>
                {/* LPR Camera Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: '100%', bgcolor: '#FFFFFF', boxShadow: 'none', border: 'none' }}>
                    <CardContent sx={{ p: 3, background: 'transparent' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'success.main'
                        }} />
                        <Typography variant="subtitle1" fontWeight="600" color="success.main">
                          สแกนด้วยกล้อง AI
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        ใช้ระบบ AI ตรวจจับป้ายทะเบียนอัตโนมัติ
                      </Typography>

                      <LPRCameraPlaceholder
                        isCapturing={lprCapturing}
                        onCapture={handleLPRCapture}
                        capturedResult={lprResult}
                      />

                      <Box sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: 'info.50',
                        borderRadius: 2
                      }}>
                        <Typography variant="body2" color="info.main" sx={{ fontWeight: 500 }}>
                          💡 เคล็ดลับการใช้งาน
                        </Typography>
                        <Typography variant="caption" color="info.dark" display="block" sx={{ mt: 0.5 }}>
                          • วางป้ายทะเบียนให้อยู่ในกรอบเขียว<br />
                          • ทำความสะอาดป้ายให้เห็นตัวอักษรชัดเจน<br />
                          • หลีกเลี่ยงแสงสะท้อนบนป้าย
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Manual Input Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: '100%', bgcolor: '#FFFFFF', boxShadow: 'none', border: 'none' }}>
                    <CardContent sx={{ p: 3, background: 'transparent' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'warning.main'
                        }} />
                        <Typography variant="subtitle1" fontWeight="600" color="warning.main">
                          กรอกข้อมูลด้วยตนเอง
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        สำหรับกรณีที่ไม่สามารถใช้กล้องได้
                      </Typography>

                      {/* Result from LPR */}
                      {lprResult && (
                        <Alert
                          severity="success"
                          sx={{
                            mb: 3,
                            bgcolor: 'success.50',
                            '& .MuiAlert-icon': {
                              fontSize: 20
                            }
                          }}
                        >
                          <Typography variant="body2" fontWeight="600">
                            ✅ ตรวจพบจากกล้อง: {lprResult.plate_text}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'success.dark' }}>
                            ความแม่นยำ {Math.round(lprResult.confidence * 100)}% • คุณสามารถแก้ไขข้อมูลด้านล่างได้
                          </Typography>
                        </Alert>
                      )}

                      {/* Manual Input Field */}
                      <TextField
                        fullWidth
                        label="หมายเลขป้ายทะเบียน"
                        value={licensePlate}
                        onChange={(e) => handleLicensePlateChange(e.target.value)}
                        placeholder="เช่น กข-1234 กรุงเทพ"
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                            fontSize: '1.1rem',
                            fontWeight: 500,
                            '& fieldset': {
                              borderColor: 'grey.300'
                            },
                            '&:hover fieldset': {
                              borderColor: 'primary.main'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main'
                            }
                          }
                        }}
                      />

                      <Box sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 2
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          📝 รูปแบบป้ายทะเบียน
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          • รถยนต์: กข-1234 กรุงเทพ<br />
                          • รถจักรยานยนต์: 1กข-2345<br />
                          • สามารถข้ามได้หากแขกไม่มีรถ
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Check-in Actions */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    ดำเนินการเช็คอิน
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ตรวจสอบข้อมูลและยืนยันการเช็คอินแขก
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => frontDeskService.resetForm()}
                    disabled={checkingIn}
                  >
                    ล้างฟอร์ม
                  </Button>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={checkingIn ? <CircularProgress size={20} /> : <Login />}
                    onClick={handleCheckin}
                    disabled={!isValidForCheckin || checkingIn}
                    sx={{ minWidth: 160 }}
                  >
                    {checkingIn ? 'กำลังดำเนินการ...' : 'เช็คอินแขก'}
                  </Button>
                </Box>
              </Box>

              {!isValidForCheckin && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  กรุณาเลือกห้องและกรอกหมายเลขป้ายทะเบียนเพื่อดำเนินการเช็คอิน
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
});

export default CheckinView;
import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Hotel,
  CleaningServices,
  Build,
  CheckCircle,
  Warning,
  Assignment,
  Visibility
} from '@mui/icons-material';
import housekeepingService, { type Room } from '../Services/HousekeepingService';
import { getStatusText, getStatusChipColor } from '../../FrontDesk/constants/roomStatus';

const HousekeepingRoomsView: React.FC = observer(() => {
  const rooms = housekeepingService.rooms;
  const roomsByStatus = housekeepingService.roomsByStatus;

  // Housekeeping uses slightly different status strings (capitalized). Map to shared helpers.
  const mapHousekeepingStatusToRoomStatus = (status: Room['status']) => {
    switch (status) {
      case 'Vacant': return 'vacant' as const;
      case 'Occupied': return 'occupied' as const;
      case 'Cleaning': return 'cleaning' as const;
      case 'Out_of_Order': return 'maintenance' as const;
      default: return 'vacant' as const;
    }
  };

  const createCleaningTask = (room: Room) => {
    housekeepingService.createTask({
      room_id: room.id,
      task: 'cleaning',
      assigned_to_user_id: 'housekeeping-team',
      notes: `งานทำความสะอาดห้อง ${room.number}`,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          ห้องที่ต้องทำงาน
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          ดูสถานะห้องพักและสร้างงานทำความสะอาด
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {roomsByStatus.vacant.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">ห้องว่าง</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Hotel sx={{ color: 'error.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {roomsByStatus.occupied.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">มีแขก</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CleaningServices sx={{ color: 'warning.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {roomsByStatus.cleaning.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">ทำความสะอาด</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Build sx={{ color: 'info.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {roomsByStatus.out_of_order.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">ปิดปรับปรุง</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Typography variant="h6" gutterBottom>รายการห้องทั้งหมด</Typography>
          <Grid container spacing={2}>
            {rooms.map((room) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={room.id}>
                <Card sx={{ height: '100%', boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
                  <CardContent sx={{ background: 'transparent' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" component="div" gutterBottom>
                          ห้อง {room.number}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ชั้น {room.floor}
                        </Typography>
                      </Box>
                      <Chip label={getStatusText(mapHousekeepingStatusToRoomStatus(room.status))} color={getStatusChipColor(mapHousekeepingStatusToRoomStatus(room.status))} size="small" />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="ดูรายละเอียด">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {(room.status === 'Vacant' || room.status === 'Cleaning') && (
                          <Tooltip title="สร้างงานทำความสะอาด">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => createCleaningTask(room)}
                            >
                              <Assignment />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>

                      {room.status === 'Out_of_Order' && (
                        <Chip icon={<Warning />} label={getStatusText('maintenance')} color={getStatusChipColor('maintenance')} size="small" variant="outlined" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {rooms.length === 0 && (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              ไม่มีข้อมูลห้องพัก
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
});

export default HousekeepingRoomsView;

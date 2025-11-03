import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
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
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  Schedule,
  Person,
  Room,
  Assignment
} from '@mui/icons-material';
import housekeepingService, { type HousekeepingTask } from '../Services/HousekeepingService';

const HousekeepingTasksView: React.FC = observer(() => {
  const tasks = housekeepingService.tasks;
  const tasksByStatus = housekeepingService.tasksByStatus;

  const handleUpdateTaskStatus = (taskId: string, newStatus: HousekeepingTask['status']) => {
    housekeepingService.updateTaskStatus(taskId, newStatus);
  };

  const getStatusColor = (status: HousekeepingTask['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: HousekeepingTask['status']) => {
    switch (status) {
      case 'pending': return 'รอดำเนินการ';
      case 'in_progress': return 'กำลังทำ';
      case 'completed': return 'เสร็จแล้ว';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  const getTaskLabel = (task: HousekeepingTask['task']) => {
    switch (task) {
      case 'cleaning': return 'ทำความสะอาด';
      case 'maintenance': return 'ซ่อมแซม';
      case 'inspection': return 'ตรวจสอบ';
      case 'deep_clean': return 'ทำความสะอาดลึก';
      default: return task;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          งานทำความสะอาด
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          ติดตามความคืบหน้างานแม่บ้านทั้งหมด
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Schedule sx={{ color: 'warning.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {tasksByStatus.pending.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">รอดำเนินการ</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PlayArrow sx={{ color: 'info.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {tasksByStatus.in_progress.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">กำลังทำ</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {tasksByStatus.completed.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">เสร็จแล้ว</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assignment sx={{ color: 'primary.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {tasks.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">ทั้งหมด</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Typography variant="h6" gutterBottom>รายการงานทั้งหมด</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F5F6FA' }}>
                  <TableCell>ห้อง</TableCell>
                  <TableCell>ประเภทงาน</TableCell>
                  <TableCell>หมายเหตุ</TableCell>
                  <TableCell>ผู้รับผิดชอบ</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>กำหนดเวลา</TableCell>
                  <TableCell align="center">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Room sx={{ color: 'text.secondary' }} />
                        {housekeepingService.getRoomNumber(task.room_id)}
                      </Box>
                    </TableCell>
                    <TableCell>{getTaskLabel(task.task)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {task.notes || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person sx={{ color: 'text.secondary', fontSize: 16 }} />
                        {housekeepingService.getUserName(task.assigned_to_user_id)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={getStatusLabel(task.status)} color={getStatusColor(task.status)} size="small" />
                    </TableCell>
                    <TableCell>{task.scheduled_at.toLocaleDateString('th-TH')}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {task.status === 'pending' && (
                          <Tooltip title="เริ่มทำงาน">
                            <IconButton size="small" color="primary" onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}>
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                        )}
                        {task.status === 'in_progress' && (
                          <Tooltip title="เสร็จสิ้น">
                            <IconButton size="small" color="success" onClick={() => handleUpdateTaskStatus(task.id, 'completed')}>
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {tasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">ยังไม่มีรายการงาน</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
});

export default HousekeepingTasksView;

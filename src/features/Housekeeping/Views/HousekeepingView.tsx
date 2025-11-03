import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
    CleaningServices,
    PlayArrow,
    CheckCircle,
    Add,
    Person,
    Schedule,
    Hotel,
} from '@mui/icons-material';
import housekeepingService, { type HousekeepingTask } from '../Services/HousekeepingService';

const HousekeepingView: React.FC = observer(() => {
    const { tasks, rooms, users } = housekeepingService;
    const [statusFilter, setStatusFilter] = useState<HousekeepingTask['status'] | 'all'>('all');
    const [taskTypeFilter, setTaskTypeFilter] = useState<HousekeepingTask['task'] | 'all'>('all');
    const [createDialog, setCreateDialog] = useState(false);

    // New task form
    const [newTask, setNewTask] = useState({
        room_id: '',
        task: 'cleaning' as HousekeepingTask['task'],
        assigned_to_user_id: '',
        notes: '',
    });

    const statistics = housekeepingService.getStatistics();

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const statusMatch = statusFilter === 'all' || task.status === statusFilter;
        const typeMatch = taskTypeFilter === 'all' || task.task === taskTypeFilter;
        return statusMatch && typeMatch;
    });

    const getTaskLabel = (task: HousekeepingTask['task']) => {
        switch (task) {
            case 'cleaning': return 'ทำความสะอาด';
            case 'maintenance': return 'ซ่อมแซม';
            case 'inspection': return 'ตรวจสอบ';
            case 'deep_clean': return 'ทำความสะอาดลึก';
            default: return task;
        }
    };

    const getStatusLabel = (status: HousekeepingTask['status']) => {
        switch (status) {
            case 'pending': return 'รอดำเนินการ';
            case 'in_progress': return 'กำลังทำ';
            case 'completed': return 'เสร็จสิ้น';
            case 'cancelled': return 'ยกเลิก';
            default: return status;
        }
    };

    const getStatusColor = (status: HousekeepingTask['status']) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'in_progress': return 'info';
            case 'completed': return 'success';
            case 'cancelled': return 'default';
            default: return 'default';
        }
    };

    const handleStartTask = (taskId: string) => {
        housekeepingService.updateTaskStatus(taskId, 'in_progress');
    };

    const handleCompleteTask = (taskId: string) => {
        housekeepingService.updateTaskStatus(taskId, 'completed', new Date());
    };

    const handleCreateTask = async () => {
        if (!newTask.room_id || !newTask.assigned_to_user_id) return;

        await housekeepingService.createTask({
            ...newTask,
            scheduled_at: new Date(),
        });

        // Reset
        setNewTask({
            room_id: '',
            task: 'cleaning',
            assigned_to_user_id: '',
            notes: '',
        });
        setCreateDialog(false);
    };

    return (
        <Box sx={{
            width: '100%',
            maxWidth: 'none',
            p: { xs: 2, md: 3 },
            bgcolor: 'background.default',
            minHeight: '100vh'
        }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
                    งานแม่บ้าน
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    จัดการงานทำความสะอาดและดูแลห้องพัก
                </Typography>
            </Box>

            {/* Statistics Cards - Flat Design */}
            <Box sx={{ mb: 2, display: 'grid', gap: 1.25, gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                <Card
                    onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                    sx={{
                        bgcolor: statusFilter === 'pending' ? alpha('#ff9800', 0.06) : '#FFFFFF',
                        border: 'none',
                        borderRadius: 2,
                        boxShadow: 'none',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: statusFilter === 'pending' ? alpha('#ff9800', 0.08) : '#FAFBFD' }
                    }}
                >
                    <CardContent sx={{ p: 1.25, textAlign: 'center' }}>
                        <Box sx={{ fontSize: 18, mb: 0.25 }}><Schedule /></Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#ff9800', mb: 0.15, fontSize: '1rem' }}>
                            {statistics.pendingTasks}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">งานรอทำ</Typography>
                    </CardContent>
                </Card>

                <Card
                    onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
                    sx={{
                        bgcolor: statusFilter === 'in_progress' ? alpha('#2196f3', 0.06) : '#FFFFFF',
                        border: 'none',
                        borderRadius: 2,
                        boxShadow: 'none',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: statusFilter === 'in_progress' ? alpha('#2196f3', 0.08) : '#FAFBFD' }
                    }}
                >
                    <CardContent sx={{ p: 1.25, textAlign: 'center' }}>
                        <Box sx={{ fontSize: 18, mb: 0.25 }}><PlayArrow /></Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#2196f3', mb: 0.15, fontSize: '1rem' }}>
                            {statistics.inProgressTasks}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">กำลังทำ</Typography>
                    </CardContent>
                </Card>

                <Card
                    onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
                    sx={{
                        bgcolor: statusFilter === 'completed' ? alpha('#4caf50', 0.06) : '#FFFFFF',
                        border: 'none',
                        borderRadius: 2,
                        boxShadow: 'none',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: statusFilter === 'completed' ? alpha('#4caf50', 0.08) : '#FAFBFD' }
                    }}
                >
                    <CardContent sx={{ p: 1.25, textAlign: 'center' }}>
                        <Box sx={{ fontSize: 18, mb: 0.25 }}><CheckCircle /></Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#4caf50', mb: 0.15, fontSize: '1rem' }}>
                            {statistics.completedTasksToday}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">เสร็จวันนี้</Typography>
                    </CardContent>
                </Card>

                <Card
                    sx={{
                        bgcolor: '#FFFFFF',
                        border: 'none',
                        borderRadius: 2,
                        boxShadow: 'none',
                    }}
                >
                    <CardContent sx={{ p: 1.25, textAlign: 'center' }}>
                        <Box sx={{ fontSize: 18, mb: 0.25 }}><CleaningServices /></Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#f44336', mb: 0.15, fontSize: '1rem' }}>
                            {statistics.roomsNeedingCleaning}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">ห้องต้องทำ</Typography>
                    </CardContent>
                </Card>

                <Card
                    sx={{
                        bgcolor: '#FFFFFF',
                        border: 'none',
                        borderRadius: 2,
                        boxShadow: 'none',
                    }}
                >
                    <CardContent sx={{ p: 1.25, textAlign: 'center' }}>
                        <Box sx={{ fontSize: 18, mb: 0.25 }}><Person /></Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#9c27b0', mb: 0.15, fontSize: '1rem' }}>
                            {statistics.availableStaff}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">พนักงาน</Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Main Content Card */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
                    {/* Filters & Actions */}
                    <Box sx={{ mb: 1 }}>
                        <Grid container spacing={1} alignItems="center">
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <FormControl fullWidth size="medium">
                                    <InputLabel>กรองตามสถานะ</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        label="กรองตามสถานะ"
                                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                                    >
                                        <MenuItem value="all">ทั้งหมด</MenuItem>
                                        <MenuItem value="pending">รอดำเนินการ</MenuItem>
                                        <MenuItem value="in_progress">กำลังทำ</MenuItem>
                                        <MenuItem value="completed">เสร็จสิ้น</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <FormControl fullWidth size="medium">
                                    <InputLabel>กรองตามประเภท</InputLabel>
                                    <Select
                                        value={taskTypeFilter}
                                        label="กรองตามประเภท"
                                        onChange={(e) => setTaskTypeFilter(e.target.value as typeof taskTypeFilter)}
                                    >
                                        <MenuItem value="all">ทั้งหมด</MenuItem>
                                        <MenuItem value="cleaning">ทำความสะอาดปกติ</MenuItem>
                                        <MenuItem value="deep_clean">ทำความสะอาดลึก</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Add />}
                                        onClick={() => setCreateDialog(true)}
                                    >
                                        สร้างงานใหม่
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Results Info */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                            แสดงผล {filteredTasks.length} งาน
                        </Typography>
                        {(statusFilter !== 'all' || taskTypeFilter !== 'all') && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {statusFilter !== 'all' && (
                                    <Chip
                                        label={getStatusLabel(statusFilter)}
                                        onDelete={() => setStatusFilter('all')}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                                {taskTypeFilter !== 'all' && (
                                    <Chip
                                        label={getTaskLabel(taskTypeFilter)}
                                        onDelete={() => setTaskTypeFilter('all')}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        )}
                    </Box>

                    {/* Tasks Grid - Flat Design with Equal Height */}
                    {filteredTasks.length > 0 ? (
                        <Grid container spacing={1.5}>
                            {filteredTasks.map((task) => (
                                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={task.id}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            boxShadow: 'none',
                                            bgcolor: '#FFFFFF',
                                            '&:hover': {
                                                bgcolor: '#FAFBFD',
                                            },
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                            {/* Header */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                    <Box sx={{ color: 'primary.main', mt: 0.25 }}>
                                                        <Hotel />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.25 }}>
                                                            ห้อง {housekeepingService.getRoomNumber(task.room_id)}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {getTaskLabel(task.task)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Chip
                                                    label={getStatusLabel(task.status)}
                                                    color={getStatusColor(task.status)}
                                                    size="small"
                                                />
                                            </Box>

                                            {/* Details */}
                                            <Box sx={{ mb: 1.5, flexGrow: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        ผู้รับผิดชอบ:
                                                    </Typography>
                                                    <Typography variant="caption" fontWeight="600">
                                                        {housekeepingService.getUserName(task.assigned_to_user_id)}
                                                    </Typography>
                                                </Box>

                                                {task.notes && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                        {task.notes}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Actions */}
                                            <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                                {task.status === 'pending' && (
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        fullWidth
                                                        startIcon={<PlayArrow />}
                                                        onClick={() => handleStartTask(task.id)}
                                                    >
                                                        เริ่มงาน
                                                    </Button>
                                                )}
                                                {task.status === 'in_progress' && (
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        fullWidth
                                                        color="success"
                                                        startIcon={<CheckCircle />}
                                                        onClick={() => handleCompleteTask(task.id)}
                                                    >
                                                        เสร็จสิ้น
                                                    </Button>
                                                )}
                                                {task.status === 'completed' && (
                                                    <Box sx={{ textAlign: 'center', width: '100%', py: 0.5 }}>
                                                        <Typography variant="caption" color="success.main" fontWeight="600">
                                                            ✓ งานเสร็จสมบูรณ์
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Alert severity="info">
                            ไม่พบงานที่ตรงกับเงื่อนไข
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Create Task Dialog */}
            <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Typography variant="h6" fontWeight="bold">
                        สร้างงานใหม่
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>ห้อง</InputLabel>
                            <Select
                                value={newTask.room_id}
                                label="ห้อง"
                                onChange={(e) => setNewTask({ ...newTask, room_id: e.target.value })}
                            >
                                {rooms.map((room) => (
                                    <MenuItem key={room.id} value={room.id}>
                                        ห้อง {room.number} (ชั้น {room.floor})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>ประเภทงาน</InputLabel>
                            <Select
                                value={newTask.task}
                                label="ประเภทงาน"
                                onChange={(e) => setNewTask({ ...newTask, task: e.target.value as HousekeepingTask['task'] })}
                            >
                                <MenuItem value="cleaning">ทำความสะอาดปกติ</MenuItem>
                                <MenuItem value="deep_clean">ทำความสะอาดลึก</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>ผู้รับผิดชอบ</InputLabel>
                            <Select
                                value={newTask.assigned_to_user_id}
                                label="ผู้รับผิดชอบ"
                                onChange={(e) => setNewTask({ ...newTask, assigned_to_user_id: e.target.value })}
                            >
                                {users.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="หมายเหตุ"
                            multiline
                            rows={3}
                            value={newTask.notes}
                            onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialog(false)}>
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleCreateTask}
                        variant="contained"
                        disabled={!newTask.room_id || !newTask.assigned_to_user_id}
                    >
                        สร้างงาน
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
});

export default HousekeepingView;

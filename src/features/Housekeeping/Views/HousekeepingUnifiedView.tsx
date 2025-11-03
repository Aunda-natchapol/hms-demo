import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Box,
    Typography,
    Card,
    CardContent,
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
    Button,
    Tab,
    Tabs,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Avatar,
    useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
    PlayArrow,
    CheckCircle,
    Schedule,
    Person,
    Room as RoomIcon,
    Assignment,
    CleaningServices,
    Warning,
    Hotel,
    Add,
    Visibility,
} from '@mui/icons-material';
import housekeepingService, { type HousekeepingTask, type Room } from '../Services/HousekeepingService';
import { getStatusText, getStatusChipColor } from '../../FrontDesk/constants/roomStatus';

type FilterStatus = HousekeepingTask['status'] | 'all';
type RoomFilterStatus = Room['status'] | 'all';
type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`housekeeping-tabpanel-${index}`}
            aria-labelledby={`housekeeping-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const HousekeepingUnifiedView: React.FC = observer(() => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [createTaskDialog, setCreateTaskDialog] = useState(false);
    const [roomFilter, setRoomFilter] = useState<RoomFilterStatus>('all');
    const [taskFilter, setTaskFilter] = useState<FilterStatus>('all');

    // New task form state
    const [newTask, setNewTask] = useState({
        room_id: '',
        task: 'cleaning' as HousekeepingTask['task'],
        assigned_to_user_id: '',
        notes: '',
    });

    const statistics = housekeepingService.getStatistics();
    const tasks = housekeepingService.tasks;
    const rooms = housekeepingService.rooms;
    const users = housekeepingService.users;

    // Filtered data
    const filteredRooms = roomFilter === 'all' ? rooms : rooms.filter(r => r.status === roomFilter);
    const filteredTasks = taskFilter === 'all' ? tasks : tasks.filter(t => t.status === taskFilter);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleUpdateTaskStatus = (taskId: string, newStatus: HousekeepingTask['status']) => {
        const currentDate = newStatus === 'completed' ? new Date() : undefined;
        housekeepingService.updateTaskStatus(taskId, newStatus, currentDate);
    };

    const handleCreateTask = async () => {
        if (!newTask.room_id || !newTask.assigned_to_user_id) return;

        await housekeepingService.createTask({
            ...newTask,
            scheduled_at: new Date(),
        });

        // Reset form
        setNewTask({
            room_id: '',
            task: 'cleaning',
            assigned_to_user_id: '',
            notes: '',
        });
        setCreateTaskDialog(false);
    };

    const handleQuickTaskCreation = (room: Room) => {
        housekeepingService.createTask({
            room_id: room.id,
            task: 'cleaning',
            assigned_to_user_id: users.find(u => u.role_id === 'housekeeping')?.id || '',
            notes: `งานทำความสะอาดห้อง ${room.number} (สร้างด่วน)`,
            scheduled_at: new Date(),
        });
    };

    // Map housekeeping room status variants to standard room statuses
    const mapHousekeepingStatusToRoomStatus = (status: Room['status'] | HousekeepingTask['status']): string => {
        switch (status) {
            case 'Vacant': return 'vacant';
            case 'Occupied': return 'occupied';
            case 'Cleaning': return 'cleaning';
            case 'Out_of_Order': return 'maintenance';
            default: return status as string;
        }
    };

    const getStatusColor = (status: HousekeepingTask['status'] | Room['status']): ChipColor => {
        const mapped = mapHousekeepingStatusToRoomStatus(status);
        return getStatusChipColor(mapped) as ChipColor;
    };

    const getStatusLabel = (status: HousekeepingTask['status'] | Room['status']) => {
        const mapped = mapHousekeepingStatusToRoomStatus(status);
        return getStatusText(mapped);
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
        <Box sx={{
            width: '100%',
            maxWidth: 'none',
            p: { xs: 2, md: 3 },
            bgcolor: 'background.default',
            minHeight: '100vh'
        }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    จัดการงานแม่บ้าน
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    ระบบจัดการงานทำความสะอาด สถานะห้อง และมอบหมายงาน
                </Typography>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                    <Card sx={{ height: '100%', boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                            <Avatar
                                sx={{
                                    bgcolor: theme.palette.warning.main,
                                    mr: 2,
                                    width: 48,
                                    height: 48,
                                }}
                            >
                                <Schedule fontSize="large" />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    งานรอทำ
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {statistics.pendingTasks}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                    <Card sx={{ height: '100%', boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                            <Avatar
                                sx={{
                                    bgcolor: theme.palette.info.main,
                                    mr: 2,
                                    width: 48,
                                    height: 48,
                                }}
                            >
                                <PlayArrow fontSize="large" />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    กำลังทำ
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {statistics.inProgressTasks}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                    <Card sx={{ height: '100%', boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                            <Avatar
                                sx={{
                                    bgcolor: theme.palette.success.main,
                                    mr: 2,
                                    width: 48,
                                    height: 48,
                                }}
                            >
                                <CheckCircle fontSize="large" />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    เสร็จวันนี้
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {statistics.completedTasksToday}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                    <Card sx={{ height: '100%', boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                            <Avatar
                                sx={{
                                    bgcolor: theme.palette.warning.main,
                                    mr: 2,
                                    width: 48,
                                    height: 48,
                                }}
                            >
                                <CleaningServices fontSize="large" />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    ห้องต้องทำ
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {statistics.roomsNeedingCleaning}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                    <Card sx={{ height: '100%', boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                            <Avatar
                                sx={{
                                    bgcolor: theme.palette.error.main,
                                    mr: 2,
                                    width: 48,
                                    height: 48,
                                }}
                            >
                                <Warning fontSize="large" />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    ความเสียหาย
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {statistics.pendingDamageReports}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                    <Card sx={{ height: '100%', boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                            <Avatar
                                sx={{
                                    bgcolor: theme.palette.success.main,
                                    mr: 2,
                                    width: 48,
                                    height: 48,
                                }}
                            >
                                <Person fontSize="large" />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    พนักงาน
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {statistics.availableStaff}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="งานทั้งหมด" icon={<Assignment />} />
                    <Tab label="สถานะห้อง" icon={<Hotel />} />
                </Tabs>
            </Box>

            {/* Tasks Tab */}
            <TabPanel value={activeTab} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>สถานะ</InputLabel>
                            <Select
                                value={taskFilter}
                                label="สถานะ"
                                onChange={(e) => setTaskFilter(e.target.value as FilterStatus)}
                            >
                                <MenuItem value="all">ทั้งหมด</MenuItem>
                                <MenuItem value="pending">รอดำเนินการ</MenuItem>
                                <MenuItem value="in_progress">กำลังทำ</MenuItem>
                                <MenuItem value="completed">เสร็จแล้ว</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setCreateTaskDialog(true)}
                    >
                        สร้างงานใหม่
                    </Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ห้อง</TableCell>
                                <TableCell>ประเภทงาน</TableCell>
                                <TableCell>ผู้รับผิดชอบ</TableCell>
                                <TableCell>สถานะ</TableCell>
                                <TableCell>เวลานัดหมาย</TableCell>
                                <TableCell>หมายเหตุ</TableCell>
                                <TableCell>การดำเนินการ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <RoomIcon />
                                            {housekeepingService.getRoomNumber(task.room_id)}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{getTaskLabel(task.task)}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Person />
                                            {housekeepingService.getUserName(task.assigned_to_user_id)}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(task.status)}
                                            color={getStatusColor(task.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Intl.DateTimeFormat('th-TH', {
                                            dateStyle: 'short',
                                            timeStyle: 'short'
                                        }).format(task.scheduled_at)}
                                    </TableCell>
                                    <TableCell>{task.notes || '-'}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {task.status === 'pending' && (
                                                <Tooltip title="เริ่มงาน">
                                                    <IconButton
                                                        size="small"
                                                        color="info"
                                                        onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                                                    >
                                                        <PlayArrow />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {task.status === 'in_progress' && (
                                                <Tooltip title="เสร็จสิ้น">
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                                    >
                                                        <CheckCircle />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            {/* Rooms Tab */}
            <TabPanel value={activeTab} index={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>สถานะห้อง</InputLabel>
                            <Select
                                value={roomFilter}
                                label="สถานะห้อง"
                                onChange={(e) => setRoomFilter(e.target.value as RoomFilterStatus)}
                            >
                                <MenuItem value="all">ทั้งหมด</MenuItem>
                                <MenuItem value="Vacant">ห้องว่าง</MenuItem>
                                <MenuItem value="Occupied">มีแขก</MenuItem>
                                <MenuItem value="Cleaning">ทำความสะอาด</MenuItem>
                                <MenuItem value="Out_of_Order">ปิดปรับปรุง</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {filteredRooms.map((room) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={room.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    boxShadow: 'none',
                                    border: 'none',
                                    bgcolor: room.needs_cleaning ? 'warning.50' : '#FFFFFF'
                                }}
                            >
                                <CardContent sx={{ background: 'transparent' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                ห้อง {room.number}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                ชั้น {room.floor}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={getStatusLabel(room.status)}
                                            color={getStatusColor(room.status)}
                                            size="small"
                                        />
                                    </Box>

                                    {room.needs_cleaning && (
                                        <Alert severity="warning" sx={{ mb: 2, fontSize: '0.75rem' }}>
                                            ต้องทำความสะอาด
                                        </Alert>
                                    )}

                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                        {room.status === 'Cleaning' && (
                                            <Tooltip title="สร้างงานด่วน">
                                                <IconButton
                                                    size="small"
                                                    color="warning"
                                                    onClick={() => handleQuickTaskCreation(room)}
                                                >
                                                    <Add />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="ดูรายละเอียด">
                                            <IconButton size="small" color="primary">
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            {/* Create Task Dialog */}
            <Dialog open={createTaskDialog} onClose={() => setCreateTaskDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>สร้างงานใหม่</DialogTitle>
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
                                        ห้อง {room.number} ({getStatusLabel(room.status)})
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
                                <MenuItem value="cleaning">ทำความสะอาด</MenuItem>
                                <MenuItem value="maintenance">ซ่อมแซม</MenuItem>
                                <MenuItem value="inspection">ตรวจสอบ</MenuItem>
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
                                        {user.name} ({user.role_id})
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
                    <Button onClick={() => setCreateTaskDialog(false)}>ยกเลิก</Button>
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

export default HousekeepingUnifiedView;
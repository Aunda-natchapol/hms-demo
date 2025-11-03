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
    Build,
    PlayArrow,
    CheckCircle,
    Add,
    Person,
    Schedule,
    Warning,
    AttachMoney,
} from '@mui/icons-material';
import maintenanceService, { type MaintenanceTask, type MaintenanceTaskStatus, type MaintenanceTaskPriority, type MaintenanceTaskType } from '../Services/MaintenanceService';

const MaintenanceView: React.FC = observer(() => {
    const { tasks, pendingTasks, inProgressTasks, completedTasks, urgentTasks, totalEstimatedCost } = maintenanceService;

    const [statusFilter, setStatusFilter] = useState<MaintenanceTaskStatus | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<MaintenanceTaskPriority | 'all'>('all');
    const [createDialog, setCreateDialog] = useState(false);
    const [costDialogOpen, setCostDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
    const [actualCost, setActualCost] = useState<string>('');

    // New task form
    const [newTask, setNewTask] = useState({
        roomNumber: '',
        task: 'repair' as MaintenanceTaskType,
        description: '',
        priority: 'medium' as MaintenanceTaskPriority,
        assignedTo: '',
        estimatedCost: '0',
    });

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const statusMatch = statusFilter === 'all' || task.status === statusFilter;
        const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
        return statusMatch && priorityMatch;
    });

    // Helper functions
    const getTaskLabel = (task: MaintenanceTaskType) => {
        switch (task) {
            case 'repair': return 'ซ่อมแซม';
            case 'replacement': return 'เปลี่ยนอุปกรณ์';
            case 'inspection': return 'ตรวจสอบ';
            case 'preventive': return 'บำรุงรักษา';
            default: return task;
        }
    };

    const getStatusLabel = (status: MaintenanceTaskStatus) => {
        switch (status) {
            case 'pending': return 'รอดำเนินการ';
            case 'in_progress': return 'กำลังทำ';
            case 'completed': return 'เสร็จสิ้น';
            default: return status;
        }
    };

    const getStatusColor = (status: MaintenanceTaskStatus) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'in_progress': return 'info';
            case 'completed': return 'success';
            default: return 'default';
        }
    };

    const getPriorityLabel = (priority: MaintenanceTaskPriority) => {
        switch (priority) {
            case 'urgent': return 'เร่งด่วน';
            case 'high': return 'สูง';
            case 'medium': return 'ปานกลาง';
            case 'low': return 'ต่ำ';
            default: return priority;
        }
    };

    const getPriorityColor = (priority: MaintenanceTaskPriority): string => {
        switch (priority) {
            case 'urgent': return '#d32f2f';
            case 'high': return '#f57c00';
            case 'medium': return '#fbc02d';
            case 'low': return '#388e3c';
            default: return '#757575';
        }
    };

    // Actions
    const handleStartTask = (taskId: string) => {
        maintenanceService.updateTaskStatus(taskId, 'in_progress');
    };

    const handleOpenCostDialog = (task: MaintenanceTask) => {
        setSelectedTask(task);
        setActualCost(String(task.estimatedCost || 0));
        setCostDialogOpen(true);
    };

    const handleCompleteTask = () => {
        if (selectedTask) {
            maintenanceService.updateTaskStatus(
                selectedTask.id,
                'completed',
                parseFloat(actualCost) || 0
            );
            setCostDialogOpen(false);
            setSelectedTask(null);
            setActualCost('');
        }
    };

    const handleCreateTask = () => {
        if (!newTask.roomNumber || !newTask.description) return;

        maintenanceService.createTask({
            roomNumber: newTask.roomNumber,
            roomId: `room-${newTask.roomNumber}`,
            task: newTask.task,
            description: newTask.description,
            priority: newTask.priority,
            status: 'pending',
            reportedBy: 'ผู้ใช้งาน',
            assignedTo: newTask.assignedTo || undefined,
            estimatedCost: parseFloat(newTask.estimatedCost) || 0,
        });

        // Reset
        setNewTask({
            roomNumber: '',
            task: 'repair',
            description: '',
            priority: 'medium',
            assignedTo: '',
            estimatedCost: '0',
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
                    งานซ่อมบำรุง
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    จัดการงานซ่อมแซมและบำรุงรักษาห้องพัก
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
                            {pendingTasks}
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
                            {inProgressTasks}
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
                            {completedTasks}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">เสร็จสิ้น</Typography>
                    </CardContent>
                </Card>

                <Card
                    onClick={() => setPriorityFilter(priorityFilter === 'urgent' ? 'all' : 'urgent')}
                    sx={{
                        bgcolor: priorityFilter === 'urgent' ? alpha('#d32f2f', 0.06) : '#FFFFFF',
                        border: 'none',
                        borderRadius: 2,
                        boxShadow: 'none',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: priorityFilter === 'urgent' ? alpha('#d32f2f', 0.08) : '#FAFBFD' }
                    }}
                >
                    <CardContent sx={{ p: 1.25, textAlign: 'center' }}>
                        <Box sx={{ fontSize: 18, mb: 0.25 }}><Warning /></Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#d32f2f', mb: 0.15, fontSize: '1rem' }}>
                            {urgentTasks}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">เร่งด่วน</Typography>
                    </CardContent>
                </Card>

                <Card sx={{
                    bgcolor: '#FFFFFF',
                    border: 'none',
                    borderRadius: 2,
                    boxShadow: 'none',
                }}>
                    <CardContent sx={{ p: 1.25, textAlign: 'center' }}>
                        <Box sx={{ fontSize: 18, mb: 0.25 }}><AttachMoney /></Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#9c27b0', mb: 0.15, fontSize: '1rem' }}>
                            ฿{totalEstimatedCost.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">ค่าใช้จ่ายประมาณ</Typography>
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
                                    <InputLabel>กรองตามความเร่งด่วน</InputLabel>
                                    <Select
                                        value={priorityFilter}
                                        label="กรองตามความเร่งด่วน"
                                        onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
                                    >
                                        <MenuItem value="all">ทั้งหมด</MenuItem>
                                        <MenuItem value="urgent">เร่งด่วน</MenuItem>
                                        <MenuItem value="high">สูง</MenuItem>
                                        <MenuItem value="medium">ปานกลาง</MenuItem>
                                        <MenuItem value="low">ต่ำ</MenuItem>
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
                        {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {statusFilter !== 'all' && (
                                    <Chip
                                        label={getStatusLabel(statusFilter)}
                                        onDelete={() => setStatusFilter('all')}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                                {priorityFilter !== 'all' && (
                                    <Chip
                                        label={getPriorityLabel(priorityFilter)}
                                        onDelete={() => setPriorityFilter('all')}
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
                                                        <Build />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.25 }}>
                                                            ห้อง {task.roomNumber}
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

                                            {/* Priority Badge */}
                                            <Box sx={{ mb: 1 }}>
                                                <Chip
                                                    label={getPriorityLabel(task.priority)}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(getPriorityColor(task.priority), 0.1),
                                                        color: getPriorityColor(task.priority),
                                                        fontWeight: 'bold',
                                                        fontSize: '0.7rem',
                                                    }}
                                                />
                                            </Box>

                                            {/* Details */}
                                            <Box sx={{ mb: 1.5, flexGrow: 1 }}>
                                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                                    {task.description}
                                                </Typography>

                                                {task.assignedTo && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                        <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            ผู้รับผิดชอบ:
                                                        </Typography>
                                                        <Typography variant="caption" fontWeight="600">
                                                            {task.assignedTo}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <AttachMoney sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {task.status === 'completed' && task.actualCost
                                                            ? `ค่าใช้จ่ายจริง: ฿${task.actualCost.toLocaleString()}`
                                                            : `ประมาณการ: ฿${(task.estimatedCost || 0).toLocaleString()}`
                                                        }
                                                    </Typography>
                                                </Box>
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
                                                        onClick={() => handleOpenCostDialog(task)}
                                                    >
                                                        เสร็จสิ้น
                                                    </Button>
                                                )}
                                                {task.status === 'completed' && (
                                                    <Box sx={{ textAlign: 'center', width: '100%', py: 0.5 }}>
                                                        <Typography variant="caption" color="success.main" fontWeight="600">
                                                            ✓ งานเสร็จสมบูรณ์
                                                        </Typography>
                                                        {task.notes && (
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                                {task.notes}
                                                            </Typography>
                                                        )}
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
                        สร้างงานซ่อมบำรุงใหม่
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="หมายเลขห้อง"
                            value={newTask.roomNumber}
                            onChange={(e) => setNewTask({ ...newTask, roomNumber: e.target.value })}
                            fullWidth
                            required
                        />

                        <FormControl fullWidth>
                            <InputLabel>ประเภทงาน</InputLabel>
                            <Select
                                value={newTask.task}
                                label="ประเภทงาน"
                                onChange={(e) => setNewTask({ ...newTask, task: e.target.value as MaintenanceTaskType })}
                            >
                                <MenuItem value="repair">ซ่อมแซม</MenuItem>
                                <MenuItem value="replacement">เปลี่ยนอุปกรณ์</MenuItem>
                                <MenuItem value="inspection">ตรวจสอบ</MenuItem>
                                <MenuItem value="preventive">บำรุงรักษา</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="รายละเอียดงาน"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            fullWidth
                            required
                            multiline
                            rows={3}
                        />

                        <FormControl fullWidth>
                            <InputLabel>ความเร่งด่วน</InputLabel>
                            <Select
                                value={newTask.priority}
                                label="ความเร่งด่วน"
                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as MaintenanceTaskPriority })}
                            >
                                <MenuItem value="low">ต่ำ</MenuItem>
                                <MenuItem value="medium">ปานกลาง</MenuItem>
                                <MenuItem value="high">สูง</MenuItem>
                                <MenuItem value="urgent">เร่งด่วน</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="มอบหมายให้"
                            value={newTask.assignedTo}
                            onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                            fullWidth
                            placeholder="ชื่อช่างหรือทีมงาน"
                        />

                        <TextField
                            label="ค่าใช้จ่ายประมาณการ (บาท)"
                            value={newTask.estimatedCost}
                            onChange={(e) => setNewTask({ ...newTask, estimatedCost: e.target.value })}
                            fullWidth
                            type="number"
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
                        disabled={!newTask.roomNumber || !newTask.description}
                    >
                        สร้างงาน
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Complete Task with Cost Dialog */}
            <Dialog open={costDialogOpen} onClose={() => setCostDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    <Typography variant="h6" fontWeight="bold">
                        บันทึกค่าใช้จ่ายจริง
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            ห้อง {selectedTask?.roomNumber} - {selectedTask?.description}
                        </Typography>
                        <TextField
                            label="ค่าใช้จ่ายจริง (บาท)"
                            value={actualCost}
                            onChange={(e) => setActualCost(e.target.value)}
                            fullWidth
                            type="number"
                            autoFocus
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCostDialogOpen(false)}>
                        ยกเลิก
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleCompleteTask}
                    >
                        เสร็จสิ้น
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
});

export default MaintenanceView;

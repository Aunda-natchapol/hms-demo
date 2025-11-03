import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Box,
    Typography,
    alpha,
    Card,
    CardContent,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Tooltip,
    ToggleButtonGroup,
    ToggleButton,
    Divider,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

import roomManagementService, { type GridSize } from '../Services/RoomManagementService';
import RoomCard from '../Components/RoomCard';
import RoomDetailModal from '../Components/RoomDetailModal';
import { getStatusIcon, getStatusText, getStatusColor } from '../constants/roomStatus';
import GridDensityIcon from '../Components/GridDensityIcon';

const RoomManagementView: React.FC = observer(() => {
    // Note: Type assertions are based on service structure, assuming selectedRoom is a defined type
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedRoomForStatus, setSelectedRoomForStatus] = useState<typeof roomManagementService.selectedRoom | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);


    const {
        filteredRooms,
        gridSize,
        statusFilter,
        searchQuery,
        selectedRoom,
        showRoomDetail,
        roomStats,
        quickActions,
        statusOptions,
        isLoading,
    } = roomManagementService;

    // Click on a stat card to filter by that status; clicking again clears the filter
    const handleStatClick = (status: 'vacant' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance' | 'pending_inspection') => {
        if (statusFilter === status) {
            handleStatusFilterChange('all');
        } else {
            handleStatusFilterChange(status);
        }
    };


    const handleGridSizeChange = (_: React.MouseEvent<HTMLElement>, newSize: GridSize | null) => {
        if (newSize) {
            roomManagementService.setGridSize(newSize);
        }
    };

    const handleStatusFilterChange = (status: typeof statusFilter) => {
        roomManagementService.setStatusFilter(status);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        roomManagementService.setSearchQuery(event.target.value);
    };

    const handleRoomClick = (room: typeof selectedRoom) => {
        roomManagementService.openRoomDetail(room!);
    };

    // Note: Assuming quickActions[0] is the action type and selectedRoom is the room type
    const handleActionClick = (action: typeof quickActions[0], room: typeof selectedRoom) => {
        if (action.id === 'changeStatus') {
            setSelectedRoomForStatus(room);
            // preselect current room status when opening dialog
            setSelectedStatus(room?.status ?? null);
            setStatusDialogOpen(true);
        } else {
            action.action(room!);
        }
    };

    const handleStatusChange = (status: string) => {
        if (selectedRoomForStatus) {
            const statusOption = statusOptions.find(s => s.value === status);
            if (statusOption) {
                // Ensure the status type is correct according to the service
                roomManagementService.updateRoomStatus(
                    selectedRoomForStatus.id,
                    status as 'vacant' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance' | 'pending_inspection',
                    undefined
                );
            }
        }
        setStatusDialogOpen(false);
        setSelectedRoomForStatus(null);
    };

    // Status icons/text/colors are provided by shared helpers: getStatusIcon/getStatusText/getStatusColor

    const handleRefresh = async () => {
        // Refresh data from all services
        await roomManagementService.refreshData();
    };

    // Grid columns based on size
    const getGridColumns = () => {
        switch (gridSize) {
            case 'xsmall':
                // very dense: show 12 rooms per row on xl, etc.
                return { xs: 2, sm: 2, md: 1, lg: 1, xl: 1 };
            case 'small':
                return { xs: 6, sm: 4, md: 3, lg: 2, xl: 1 };
            case 'large':
                return { xs: 12, sm: 12, md: 6, lg: 4, xl: 3 };
            default: // medium
                return { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 };
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
                <Typography variant="h4" gutterBottom sx={{
                    fontWeight: 'bold',
                    color: 'text.primary',
                    mb: 1
                }}>
                    จัดการห้องพัก
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    ดูภาพรวมห้องพักทั้งหมด จัดการสถานะและดำเนินการต่างๆ
                </Typography>
            </Box>

            {/* Statistics Cards - responsive equal-width grid (more compact) */}
            <Box sx={{ mb: 2, display: 'grid', gap: 1.25, gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                <Card
                    onClick={() => handleStatClick('vacant')}
                    sx={{
                        bgcolor: statusFilter === 'vacant' ? alpha(getStatusColor('vacant'), 0.06) : '#FFFFFF',
                        border: 'none',
                        borderRadius: 2,
                        boxShadow: 'none',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: statusFilter === 'vacant' ? alpha(getStatusColor('vacant'), 0.08) : '#FAFBFD' }
                    }}
                >
                    <CardContent sx={{ p: 1.25, textAlign: 'center' }}>
                        <Box sx={{ fontSize: 18, mb: 0.25 }}>{getStatusIcon('vacant')}</Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: getStatusColor('vacant'), mb: 0.15, fontSize: '1rem' }}>{roomStats.vacant}</Typography>
                        <Typography variant="body2" color="text.secondary">{getStatusText('vacant')}</Typography>
                    </CardContent>
                </Card>

                <Card
                    onClick={() => handleStatClick('occupied')}
                    sx={{
                        bgcolor: statusFilter === 'occupied' ? alpha(getStatusColor('occupied'), 0.06) : '#FFFFFF',
                        border: 'none',
                        borderRadius: 2,
                        boxShadow: 'none',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: statusFilter === 'occupied' ? alpha(getStatusColor('occupied'), 0.08) : '#FAFBFD' }
                    }}
                >
                    <CardContent sx={{ p: 1.25, textAlign: 'center' }}>
                        <Box sx={{ fontSize: 18, mb: 0.25 }}>{getStatusIcon('occupied')}</Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: getStatusColor('occupied'), mb: 0.15, fontSize: '1rem' }}>{roomStats.occupied}</Typography>
                        <Typography variant="body2" color="text.secondary">{getStatusText('occupied')}</Typography>
                    </CardContent>
                </Card>

                <Card
                    onClick={() => handleStatClick('reserved')}
                    sx={{
                        bgcolor: statusFilter === 'reserved' ? alpha(getStatusColor('reserved'), 0.06) : '#FFFFFF',
                        border: 'none',
                        borderRadius: 2,
                        boxShadow: 'none',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: statusFilter === 'reserved' ? alpha(getStatusColor('reserved'), 0.08) : '#FAFBFD' }
                    }}
                >
                    <CardContent sx={{ p: 1.25, textAlign: 'center' }}>
                        <Box sx={{ fontSize: 18, mb: 0.25 }}>{getStatusIcon('reserved')}</Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: getStatusColor('reserved'), mb: 0.15, fontSize: '1rem' }}>{roomStats.reserved}</Typography>
                        <Typography variant="body2" color="text.secondary">{getStatusText('reserved')}</Typography>
                    </CardContent>
                </Card>

                <Card
                    onClick={() => handleStatClick('pending_inspection')}
                    sx={{
                        bgcolor: statusFilter === 'pending_inspection' ? alpha(getStatusColor('pending_inspection'), 0.06) : '#FFFFFF',
                        border: 'none',
                        borderRadius: 2,
                        boxShadow: 'none',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: statusFilter === 'pending_inspection' ? alpha(getStatusColor('pending_inspection'), 0.08) : '#FAFBFD' }
                    }}
                >
                    <CardContent sx={{ p: 1.25, textAlign: 'center' }}>
                        <Box sx={{ fontSize: 18, mb: 0.25 }}>{getStatusIcon('pending_inspection')}</Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: getStatusColor('pending_inspection'), mb: 0.15, fontSize: '1rem' }}>{roomStats.pending_inspection}</Typography>
                        <Typography variant="body2" color="text.secondary">{getStatusText('pending_inspection')}</Typography>
                    </CardContent>
                </Card>

                <Card
                    onClick={() => handleStatClick('cleaning')}
                    sx={{
                        bgcolor: statusFilter === 'cleaning' ? alpha(getStatusColor('cleaning'), 0.06) : '#FFFFFF',
                        border: 'none',
                        borderRadius: 2,
                        boxShadow: 'none',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: statusFilter === 'cleaning' ? alpha(getStatusColor('cleaning'), 0.08) : '#FAFBFD' }
                    }}
                >
                    <CardContent sx={{ p: 1.25, textAlign: 'center' }}>
                        <Box sx={{ fontSize: 18, mb: 0.25 }}>{getStatusIcon('cleaning')}</Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: getStatusColor('cleaning'), mb: 0.15, fontSize: '1rem' }}>{roomStats.cleaning}</Typography>
                        <Typography variant="body2" color="text.secondary">{getStatusText('cleaning')}</Typography>
                    </CardContent>
                </Card>

                <Card
                    onClick={() => handleStatClick('maintenance')}
                    sx={{
                        bgcolor: statusFilter === 'maintenance' ? alpha(getStatusColor('maintenance'), 0.06) : '#FFFFFF',
                        border: 'none',
                        borderRadius: 2,
                        boxShadow: 'none',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: statusFilter === 'maintenance' ? alpha(getStatusColor('maintenance'), 0.08) : '#FAFBFD' }
                    }}
                >
                    <CardContent sx={{ p: 1.25, textAlign: 'center' }}>
                        <Box sx={{ fontSize: 18, mb: 0.25 }}>{getStatusIcon('maintenance')}</Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: getStatusColor('maintenance'), mb: 0.15, fontSize: '1rem' }}>{roomStats.maintenance}</Typography>
                        <Typography variant="body2" color="text.secondary">{getStatusText('maintenance')}</Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Controls have been merged into the main results Card (compact layout) */}

            {/* Group Results and Grid into a large flat Card layout (no visible border) */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: { xs: 1, md: 1.5 }, position: 'relative' }}>
                    {/* Controls (merged) - compact + sticky */}
                    <Box sx={{ mb: 1, position: { xs: 'static', md: 'sticky' }, top: { md: 12 }, zIndex: 1, bgcolor: 'transparent', py: { xs: 0, md: 0.5 } }}>
                        <Grid container spacing={1} alignItems="center">
                            {/* Search */}
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <TextField
                                    aria-label="ค้นหาห้อง"
                                    fullWidth
                                    size="medium"
                                    placeholder="ค้นหาห้อง, ประเภท, ชื่อแขก..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                    }}
                                />
                            </Grid>

                            {/* Status Filter */}
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <FormControl fullWidth size="medium">
                                    <InputLabel id="status-filter-label">กรองตามสถานะ</InputLabel>
                                    <Select
                                        labelId="status-filter-label"
                                        value={statusFilter}
                                        label="กรองตามสถานะ"
                                        onChange={(e) => handleStatusFilterChange(e.target.value as typeof statusFilter)}
                                    >
                                        <MenuItem value="all">ทั้งหมด</MenuItem>
                                        <MenuItem value="vacant">ว่าง</MenuItem>
                                        <MenuItem value="occupied">มีแขก</MenuItem>
                                        <MenuItem value="reserved">จอง</MenuItem>
                                        <MenuItem value="pending_inspection">รอตรวจสอบ</MenuItem>
                                        <MenuItem value="cleaning">ทำความสะอาด</MenuItem>
                                        <MenuItem value="maintenance">ซ่อมแซม</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Grid Size Toggle */}
                            <Grid size={{ xs: 12, md: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
                                        ขนาดการแสดง:
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={gridSize}
                                        exclusive
                                        onChange={handleGridSizeChange}
                                        size="small"
                                    >
                                        <Tooltip title="เล็กมาก" arrow placement="bottom" PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, 2] } }] }}>
                                            <ToggleButton value="xsmall">
                                                <GridDensityIcon level="xsmall" size={18} />
                                            </ToggleButton>
                                        </Tooltip>
                                        <Tooltip title="เล็ก" arrow placement="bottom" PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, 2] } }] }}>
                                            <ToggleButton value="small">
                                                <GridDensityIcon level="small" size={18} />
                                            </ToggleButton>
                                        </Tooltip>
                                        <Tooltip title="กลาง" arrow placement="bottom" PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, 2] } }] }}>
                                            <ToggleButton value="medium">
                                                <GridDensityIcon level="medium" size={18} />
                                            </ToggleButton>
                                        </Tooltip>
                                        <Tooltip title="ใหญ่" arrow placement="bottom" PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, 2] } }] }}>
                                            <ToggleButton value="large">
                                                <GridDensityIcon level="large" size={18} />
                                            </ToggleButton>
                                        </Tooltip>
                                    </ToggleButtonGroup>
                                </Box>
                            </Grid>

                            {/* Refresh Button */}
                            <Grid size={{ xs: 12, md: 2 }}>
                                <Button
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                >
                                    รีเฟรช
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Results Info - compact */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25, gap: 2 }}>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                            แสดงผล {filteredRooms.length} ห้อง จากทั้งหมด {roomStats.total} ห้อง
                        </Typography>

                        {statusFilter !== 'all' && (
                            <Chip
                                label={`กรอง: ${getStatusText(statusFilter)}`}
                                onDelete={() => handleStatusFilterChange('all')}
                                color="primary"
                                variant="outlined"
                                sx={{ height: 30 }}
                            />
                        )}
                    </Box>

                    {/* Rooms Grid (unchanged layout) */}
                    {filteredRooms.length > 0 ? (
                        <Grid container spacing={1.5}>
                            {filteredRooms.map((room) => (
                                <Grid size={getGridColumns()} key={room.id}>
                                    <RoomCard
                                        room={room}
                                        gridSize={gridSize}
                                        quickActions={quickActions}
                                        onRoomClick={handleRoomClick}
                                        onActionClick={handleActionClick}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box sx={{ px: 2, py: 1 }}>
                            <Card sx={{ border: 'none', boxShadow: 'none', bgcolor: 'transparent' }}>
                                <CardContent sx={{ p: 1.5 }}>
                                    <Alert severity="info" sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" gutterBottom sx={{ mb: 0.5 }}>
                                            ไม่พบห้องที่ตรงกับเงื่อนไขการค้นหา
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            ลองเปลี่ยนเงื่อนไขการกรองหรือคำค้นหาใหม่
                                        </Typography>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </CardContent>
            </Card>


            {/* Room Detail Modal (Kept outside the main Card for proper overlay) */}
            <RoomDetailModal
                open={showRoomDetail}
                onClose={() => roomManagementService.closeRoomDetail()}
                room={selectedRoom ? {
                    id: selectedRoom.id,
                    hotel_id: selectedRoom.hotel_id,
                    room_type_id: selectedRoom.room_type_id,
                    number: selectedRoom.number,
                    status: selectedRoom.status,
                    floor: selectedRoom.floor
                } : null}
                reservation={selectedRoom?.currentReservation || null}
                guest={selectedRoom?.currentGuest || null}
                roomType={selectedRoom?.roomType ? {
                    name: selectedRoom.roomType.name,
                    code: selectedRoom.roomType.code,
                    base_price: selectedRoom.roomType.base_price
                } : null}
            />

            {/* Status Change Dialog (Kept outside the main Card for proper overlay) */}

            <Dialog
                open={statusDialogOpen}
                onClose={() => {
                    setSelectedStatus(null);
                    setStatusDialogOpen(false);
                }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight="bold">
                        เปลี่ยนสถานะห้อง {selectedRoomForStatus?.number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        เลือกสถานะใหม่สำหรับห้องนี้
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ py: 2 }}>
                    <List sx={{ p: 0 }}>
                        {statusOptions.map((option) => {
                            const isSelected = selectedStatus === option.value;
                            return (
                                <ListItem key={option.value} disablePadding sx={{ mb: 1 }}>
                                    <ListItemButton
                                        onClick={() => setSelectedStatus(option.value)}
                                        sx={{
                                            borderRadius: 2,
                                            px: 3,
                                            py: 1.8,
                                            bgcolor: isSelected ? alpha(getStatusColor(option.value), 0.12) : '#fff',
                                            border: isSelected ? `1px solid ${getStatusColor(option.value)}` : '1px solid transparent',
                                            boxShadow: isSelected ? `0 2px 10px ${alpha(getStatusColor(option.value), 0.08)}` : 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            '&:hover': {
                                                bgcolor: isSelected ? alpha(getStatusColor(option.value), 0.14) : '#f9f9f9'
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <ListItemIcon sx={{ minWidth: 40, color: getStatusColor(option.value) }}>
                                                {getStatusIcon(option.value)}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={option.label}
                                                primaryTypographyProps={{
                                                    fontWeight: isSelected ? 'bold' : 'medium',
                                                    fontSize: 16,
                                                }}
                                            />
                                        </Box>
                                        {isSelected && <CheckCircleIcon sx={{ color: getStatusColor(option.value), fontSize: 22 }} />}
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'flex-end', py: 1 }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                            setSelectedStatus(null);
                            setStatusDialogOpen(false);
                        }}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!selectedStatus}
                        onClick={() => {
                            if (selectedRoomForStatus && selectedStatus) {
                                handleStatusChange(selectedStatus);
                            }
                            setSelectedStatus(null);
                            setStatusDialogOpen(false);
                        }}
                    >
                        ตกลง
                    </Button>
                </DialogActions>
            </Dialog>


        </Box>
    );
});

// Note: use shared getStatusText from constants/roomStatus for label translations

export default RoomManagementView;
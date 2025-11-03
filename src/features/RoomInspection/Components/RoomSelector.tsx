import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Chip,
} from '@mui/material';
import { Hotel, Person } from '@mui/icons-material';
import type { IRoom } from '../../../types';

interface RoomSelectorProps {
    rooms: IRoom[];
    selectedRoomId: string;
    onRoomSelect: (roomId: string) => void;
    isLoading?: boolean;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({
    rooms,
    selectedRoomId,
    onRoomSelect,
    isLoading = false
}) => {
    const occupiedRooms = rooms.filter(room => room.status === 'occupied');

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Hotel sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                        เลือกห้องที่ต้องการตรวจสอบ
                    </Typography>
                </Box>

                <FormControl fullWidth disabled={isLoading}>
                    <InputLabel>เลือกห้องพัก</InputLabel>
                    <Select
                        value={selectedRoomId || ''}
                        label="เลือกห้องพัก"
                        onChange={(e) => onRoomSelect(e.target.value)}
                    >
                        {occupiedRooms.map((room) => (
                            <MenuItem key={room.id} value={room.id}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Hotel sx={{ mr: 1, fontSize: 20 }} />
                                        <Box>
                                            <Typography variant="body1">
                                                ห้อง {room.number}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ชั้น {room.floor}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                            size="small"
                                            label={room.status === 'occupied' ? 'มีแขก' : 'ว่าง'}
                                            color={room.status === 'occupied' ? 'warning' : 'success'}
                                        />
                                        <Person sx={{ color: 'text.secondary' }} />
                                    </Box>
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {occupiedRooms.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                        ไม่มีห้องที่ต้องตรวจสอบ
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default RoomSelector;
import React from 'react';
import {
    CheckCircle as CheckCircleIcon,
    Person as PersonIcon,
    CalendarToday as CalendarTodayIcon,
    CleaningServices as CleaningServicesIcon,
    Build as BuildIcon,
    MeetingRoom as MeetingRoomIcon,
    Search as SearchIcon,
    CheckBox as CheckBoxIcon,
    LocalLaundryService as LocalLaundryServiceIcon,
    Block as BlockIcon,
} from '@mui/icons-material';

export type RoomStatus =
    | 'vacant'              // ห้องว่าง พร้อมเช็คอิน
    | 'occupied'            // มีแขกพักอยู่
    | 'reserved'            // จองแล้ว ยังไม่เช็คอิน
    | 'pending_inspection'  // รอตรวจสอบหลังแขกแจ้งออก
    | 'ready_for_checkout'  // ตรวจสอบเสร็จ พร้อมเช็คเอาท์
    | 'dirty'               // ต้องทำความสะอาด (หลังเช็คเอาท์)
    | 'cleaning'            // กำลังทำความสะอาด
    | 'maintenance'         // ปิดซ่อมบำรุง
    | 'out_of_service';     // ปิดใช้งาน

export interface StatusOption {
    value: RoomStatus;
    label: string;
    color: string; // hex color for UI accents
    icon: string;
}

export const STATUS_OPTIONS: StatusOption[] = [
    { value: 'vacant', label: 'ว่าง', color: '#4caf50', icon: 'MeetingRoom' },
    { value: 'occupied', label: 'มีแขก', color: '#f44336', icon: 'Person' },
    { value: 'reserved', label: 'จอง', color: '#ff9800', icon: 'CalendarToday' },
    { value: 'pending_inspection', label: 'รอตรวจสอบ', color: '#e91e63', icon: 'Search' },
    { value: 'ready_for_checkout', label: 'พร้อมเช็คเอาท์', color: '#00bcd4', icon: 'CheckBox' },
    { value: 'dirty', label: 'ต้องทำความสะอาด', color: '#ff5722', icon: 'LocalLaundryService' },
    { value: 'cleaning', label: 'กำลังทำความสะอาด', color: '#2196f3', icon: 'CleaningServices' },
    { value: 'maintenance', label: 'ซ่อมบำรุง', color: '#9c27b0', icon: 'Build' },
    { value: 'out_of_service', label: 'ปิดใช้งาน', color: '#607d8b', icon: 'Block' }
];

// getStatusIcon can accept either an icon name (string) or a room status value.
// If passed a status value that matches a STATUS_OPTIONS entry, the icon will be colored using that status hex color.
export function getStatusIcon(iconOrStatus: string): React.ReactNode {
    // Try resolve status option by value first
    const statusOpt = STATUS_OPTIONS.find(o => o.value === iconOrStatus);
    const colorHex = statusOpt ? statusOpt.color : undefined;

    const nodeFor = (name: string) => {
        switch (name) {
            case 'CheckCircle': return <CheckCircleIcon sx={colorHex ? { color: colorHex } : undefined} />;
            case 'Person': return <PersonIcon sx={colorHex ? { color: colorHex } : undefined} />;
            case 'CalendarToday': return <CalendarTodayIcon sx={colorHex ? { color: colorHex } : undefined} />;
            case 'CleaningServices': return <CleaningServicesIcon sx={colorHex ? { color: colorHex } : undefined} />;
            case 'Build': return <BuildIcon sx={colorHex ? { color: colorHex } : undefined} />;
            case 'MeetingRoom': return <MeetingRoomIcon sx={colorHex ? { color: colorHex } : undefined} />;
            case 'Search': return <SearchIcon sx={colorHex ? { color: colorHex } : undefined} />;
            case 'CheckBox': return <CheckBoxIcon sx={colorHex ? { color: colorHex } : undefined} />;
            case 'LocalLaundryService': return <LocalLaundryServiceIcon sx={colorHex ? { color: colorHex } : undefined} />;
            case 'Block': return <BlockIcon sx={colorHex ? { color: colorHex } : undefined} />;
            default: return <CheckCircleIcon sx={colorHex ? { color: colorHex } : undefined} />;
        }
    };

    // If input is a status value and we found a matching option, use its icon
    if (statusOpt) {
        return nodeFor(statusOpt.icon);
    }

    // Otherwise treat as icon name
    return nodeFor(iconOrStatus);
}

export function getStatusText(status: string): string {
    const opt = STATUS_OPTIONS.find(o => o.value === (status as RoomStatus));
    return opt ? opt.label : status;
}

export function getStatusColor(status: string): string {
    const opt = STATUS_OPTIONS.find(o => o.value === (status as RoomStatus));
    return opt ? opt.color : '#757575';
}

// Return a MUI Chip color token when a component wants to pass it to Chip's `color` prop
export function getStatusChipColor(status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
    switch (status) {
        case 'vacant': return 'success';
        case 'occupied': return 'error';
        case 'reserved': return 'warning';
        case 'pending_inspection': return 'error';
        case 'ready_for_checkout': return 'info';
        case 'dirty': return 'warning';
        case 'cleaning': return 'info';
        case 'maintenance': return 'secondary';
        case 'out_of_service': return 'default';
        default: return 'default';
    }
}

export default {
    STATUS_OPTIONS,
    getStatusIcon,
    getStatusText,
    getStatusColor,
    getStatusChipColor
};

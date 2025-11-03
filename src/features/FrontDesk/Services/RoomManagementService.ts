import { makeAutoObservable } from "mobx";
import type { IRoom, IReservation, IGuest, IRoomType } from "../../../types";
import frontDeskService from "./FrontDeskService";
import checkoutService from "./CheckoutService";
import reservationService from "../../Reservations/Services/ReservationService";
import housekeepingService from "../../Housekeeping/Services/HousekeepingService";
import { settingsService } from "../../Settings/Services/SettingsService";
import eventBusService from "../../../services/EventBusService";
import { STATUS_OPTIONS } from '../constants/roomStatus';

export type GridSize = 'xsmall' | 'small' | 'medium' | 'large';

export interface RoomWithDetails extends IRoom {
    roomType?: IRoomType;
    currentReservation?: IReservation;
    currentGuest?: IGuest;
    hasCustomStatus?: boolean;
    customStatusName?: string;
    customStatusColor?: string;
}

export interface QuickActionType {
    id: string;
    label: string;
    icon: string;
    action: (room: RoomWithDetails) => void;
    condition: (room: RoomWithDetails) => boolean;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

class RoomManagementService {
    // Room data and state
    rooms: RoomWithDetails[] = [];
    roomTypes: IRoomType[] = [];
    filteredRooms: RoomWithDetails[] = [];

    // UI state
    gridSize: GridSize = 'medium';
    statusFilter: IRoom['status'] | 'all' | 'custom' = 'all';
    searchQuery = '';
    selectedRoom: RoomWithDetails | null = null;
    showRoomDetail = false;

    // Loading states
    isLoading = false;

    constructor() {
        makeAutoObservable(this);
        // Initialize with empty data first, then load
        this.rooms = [];
        this.roomTypes = [];
        this.filteredRooms = [];

        // Load data asynchronously
        this.loadSharedData();

        // Setup event listeners for data sync
        this.setupEventListeners();
    }

    private setupEventListeners() {
        // Listen for events from other services to update room status
        eventBusService.subscribe('CHECKIN_COMPLETED', (event) => {
            if (event.type === 'CHECKIN_COMPLETED') {
                const room = this.rooms.find(r => r.id === event.data.roomId);
                if (room) {
                    room.status = 'occupied';
                    room.currentGuest = this.getGuestById(event.data.guestId);
                }
            }
        });

        eventBusService.subscribe('CHECKOUT_COMPLETED', (event) => {
            if (event.type === 'CHECKOUT_COMPLETED') {
                const room = this.rooms.find(r => r.id === event.data.roomId);
                if (room) {
                    room.status = 'cleaning'; // Use valid status
                    room.currentGuest = undefined;
                }
            }
        });

        eventBusService.subscribe('HOUSEKEEPING_TASK_COMPLETED', (event) => {
            if (event.type === 'HOUSEKEEPING_TASK_COMPLETED') {
                const room = this.rooms.find(r => r.id === event.data.roomId);
                if (room) {
                    room.status = 'vacant'; // Use valid status
                }
            }
        });

        eventBusService.subscribe('ROOM_STATUS_CHANGED', (event) => {
            if (event.type === 'ROOM_STATUS_CHANGED') {
                const room = this.rooms.find(r => r.id === event.data.roomId);
                if (room && this.isValidRoomStatus(event.data.newStatus)) {
                    room.status = event.data.newStatus as IRoom['status'];
                }
            }
        });
    }



    // Load data from other services
    private async loadSharedData() {
        try {
            // Load data from various services
            await Promise.all([
                reservationService.loadReservations(),
                housekeepingService.loadTasks ? housekeepingService.loadTasks() : Promise.resolve(),
            ]);

            // Get room types from settings service
            this.roomTypes = settingsService.roomTypes.map(rt => ({
                id: rt.id,
                hotel_id: "hotel-001",
                code: rt.name.substring(0, 3).toUpperCase(),
                name: rt.name,
                description: rt.description,
                base_price: rt.baseRate
            }));

            // Get housekeeping rooms (they have real room data)
            const housekeepingRooms = housekeepingService.rooms;

            // Create a combined room list from multiple sources
            this.rooms = [];

            // Use housekeeping rooms as base (they have good room structure)
            housekeepingRooms.forEach((hkRoom) => {
                // Map housekeeping status to room status
                let roomStatus: IRoom['status'];
                switch (hkRoom.status) {
                    case 'Vacant': roomStatus = 'vacant'; break;
                    case 'Occupied': roomStatus = 'occupied'; break;
                    case 'Cleaning': roomStatus = 'cleaning'; break;
                    case 'Out_of_Order': roomStatus = 'maintenance'; break;
                    default: roomStatus = 'vacant';
                }

                // Find room type
                const roomType = this.roomTypes.find(rt => rt.id === hkRoom.room_type_id)
                    || this.roomTypes[0]; // fallback to first room type

                const room: RoomWithDetails = {
                    id: hkRoom.id,
                    hotel_id: hkRoom.hotel_id,
                    room_type_id: hkRoom.room_type_id,
                    number: hkRoom.number,
                    status: roomStatus,
                    floor: hkRoom.floor,
                    roomType,
                    hasCustomStatus: false
                };

                // Check if this room has reservations
                const reservation = reservationService.reservations.find(r =>
                    r.room_id === room.id && (r.status === 'confirmed' || r.status === 'checked-in')
                );

                if (reservation) {
                    // Update room status based on reservation
                    if (reservation.status === 'checked-in') {
                        room.status = 'occupied';
                    } else if (reservation.status === 'confirmed') {
                        room.status = 'reserved';
                    }

                    // Find guest data
                    const guest = reservationService.guests.find(g => g.id === reservation.guest_id);

                    room.currentReservation = reservation;
                    room.currentGuest = guest;
                }

                this.rooms.push(room);
            });

            // Add some additional rooms to get to ~30 rooms if needed
            const currentRoomCount = this.rooms.length;
            if (currentRoomCount < 30) {
                for (let i = currentRoomCount + 1; i <= 30; i++) {
                    const floor = Math.ceil(i / 6);
                    const roomNumber = `${floor}${String(i % 6 === 0 ? 6 : i % 6).padStart(2, '0')}`;

                    // Random status distribution
                    const rand = Math.random();
                    let status: IRoom['status'];
                    if (rand < 0.4) status = 'vacant';
                    else if (rand < 0.65) status = 'occupied';
                    else if (rand < 0.8) status = 'reserved';
                    else if (rand < 0.95) status = 'cleaning';
                    else status = 'maintenance';

                    const roomType = this.roomTypes[Math.floor(Math.random() * this.roomTypes.length)];

                    const room: RoomWithDetails = {
                        id: `room-${String(i).padStart(3, '0')}`,
                        hotel_id: "hotel-001",
                        room_type_id: roomType.id,
                        number: roomNumber,
                        status,
                        floor,
                        roomType,
                        hasCustomStatus: i <= 2,
                        customStatusName: i === 1 ? 'รอตรวจเช็ค' : i === 2 ? 'ซ่อมแซม' : undefined,
                        customStatusColor: i === 1 ? 'orange' : i === 2 ? 'red' : undefined
                    };

                    // Add mock reservations for occupied/reserved rooms
                    if (status === 'occupied' || status === 'reserved') {
                        const guestNames = reservationService.guests.map(g => g.name);

                        room.currentGuest = {
                            id: `guest-${i}`,
                            tenant_id: "tenant-001",
                            hotel_id: "hotel-001",
                            name: guestNames[Math.floor(Math.random() * guestNames.length)] || `Guest ${i}`,
                            phone: `08${Math.floor(Math.random() * 90000000) + 10000000}`,
                            email: `guest${i}@example.com`,
                            document_number: `1234567890${i}`
                        };

                        room.currentReservation = {
                            id: `reservation-${i}`,
                            tenant_id: "tenant-001",
                            hotel_id: "hotel-001",
                            guest_id: room.currentGuest.id,
                            room_id: room.id,
                            arrival_date: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
                            departure_date: new Date(Date.now() + Math.random() * 86400000 * 5).toISOString(),
                            status: status === 'occupied' ? 'checked-in' : 'confirmed',
                            created_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
                            total_amount: roomType.base_price + Math.floor(Math.random() * 1000)
                        };
                    }

                    this.rooms.push(room);
                }
            }

            this.applyFilters();
        } catch (error) {
            console.error('Error loading shared data:', error);
            // Fallback to empty data
            this.rooms = [];
            this.roomTypes = [];
            this.applyFilters();
        }
    }

    // Grid size management
    setGridSize(size: GridSize) {
        this.gridSize = size;
    }

    // Filter management  
    setStatusFilter(status: IRoom['status'] | 'all' | 'custom') {
        this.statusFilter = status;
        this.applyFilters();
    }

    setSearchQuery(query: string) {
        this.searchQuery = query;
        this.applyFilters();
    }

    private applyFilters() {
        let filtered = [...this.rooms];

        // Status filter
        if (this.statusFilter !== 'all') {
            if (this.statusFilter === 'custom') {
                filtered = filtered.filter(room => room.hasCustomStatus);
            } else {
                filtered = filtered.filter(room => room.status === this.statusFilter);
            }
        }

        // Search filter
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(room =>
                room.number.toLowerCase().includes(query) ||
                room.roomType?.name.toLowerCase().includes(query) ||
                room.currentGuest?.name.toLowerCase().includes(query) ||
                room.customStatusName?.toLowerCase().includes(query)
            );
        }

        this.filteredRooms = filtered;
    }

    // Room detail modal
    openRoomDetail(room: RoomWithDetails) {
        this.selectedRoom = room;
        this.showRoomDetail = true;
    }

    closeRoomDetail() {
        this.selectedRoom = null;
        this.showRoomDetail = false;
    }

    // Status management
    updateRoomStatus(roomId: string, status: IRoom['status'], customStatus?: { name: string; color: string; }) {
        const room = this.rooms.find(r => r.id === roomId);
        if (room) {
            const oldStatus = room.status;
            room.status = status;

            if (customStatus) {
                room.hasCustomStatus = true;
                room.customStatusName = customStatus.name;
                room.customStatusColor = customStatus.color;
            } else {
                room.hasCustomStatus = false;
                room.customStatusName = undefined;
                room.customStatusColor = undefined;
            }

            // Sync status change to other services
            this.syncStatusToOtherServices(roomId, status, oldStatus);

            this.applyFilters();
        }
    }

    // Sync status changes to other services to maintain data consistency
    private syncStatusToOtherServices(roomId: string, newStatus: IRoom['status'], oldStatus: IRoom['status']) {
        // Update housekeeping service status
        const hkRoom = housekeepingService.rooms.find(r => r.id === roomId);
        if (hkRoom) {
            switch (newStatus) {
                case 'vacant':
                    hkRoom.status = 'Vacant';
                    hkRoom.needs_cleaning = false;
                    break;
                case 'occupied':
                    hkRoom.status = 'Occupied';
                    hkRoom.needs_cleaning = false;
                    break;
                case 'cleaning':
                    hkRoom.status = 'Cleaning';
                    hkRoom.needs_cleaning = true;
                    break;
                case 'maintenance':
                    hkRoom.status = 'Out_of_Order';
                    hkRoom.needs_cleaning = false;
                    break;
                case 'reserved':
                    // Reserved rooms are typically vacant in housekeeping view
                    hkRoom.status = 'Vacant';
                    hkRoom.needs_cleaning = false;
                    break;
            }
        }

        // Update reservation status if needed
        const reservation = reservationService.reservations.find(r => r.room_id === roomId);
        if (reservation) {
            if (newStatus === 'occupied' && reservation.status === 'confirmed') {
                reservation.status = 'checked-in';
            } else if (newStatus === 'vacant' && reservation.status === 'checked-in') {
                reservation.status = 'checked-out';
            }
        }

        // Log status change for audit
        console.log(`Room ${roomId} status changed from ${oldStatus} to ${newStatus}`);
    }

    // Helper methods
    private getGuestById(guestId: string): IGuest | undefined {
        return reservationService.guests.find(g => g.id === guestId);
    }

    private isValidRoomStatus(status: string): boolean {
        return ['vacant', 'occupied', 'reserved', 'cleaning', 'maintenance', 'pending_inspection'].includes(status);
    }

    // Quick Actions - เฉพาะ การจอง, เช็คอิน, เช็คเอาท์, เปลี่ยนสถานะ
    get quickActions(): QuickActionType[] {
        return [
            {
                id: 'reserve',
                label: 'การจอง',
                icon: 'CalendarToday',
                color: 'warning',
                condition: (room) => room.status === 'vacant',
                action: (room) => this.handleReservation(room)
            },
            {
                id: 'checkin',
                label: 'เช็คอิน',
                icon: 'Login',
                color: 'success',
                condition: (room) => room.status === 'vacant' || room.status === 'reserved',
                action: (room) => this.handleCheckin(room)
            },
            {
                id: 'checkout',
                label: 'เช็คเอาท์',
                icon: 'Logout',
                color: 'error',
                condition: (room) => room.status === 'occupied',
                action: (room) => this.handleCheckout(room)
            },
            {
                id: 'changeStatus',
                label: 'เปลี่ยนสถานะ',
                icon: 'SwapHoriz',
                color: 'primary',
                condition: () => true, // สามารถเปลี่ยนสถานะได้เสมอ
                action: (room) => this.handleChangeStatus(room)
            }
        ];
    }

    // Room status options for change status menu
    get statusOptions() {
        return STATUS_OPTIONS;
    }

    // Quick action handlers - integrate with existing features
    private handleCheckin(room: RoomWithDetails) {
        // Load available data in frontDeskService first
        frontDeskService.loadAvailableData().then(() => {
            // Pre-populate frontDeskService with room data
            frontDeskService.setSelectedRoom({
                id: room.id,
                hotel_id: room.hotel_id,
                room_type_id: room.room_type_id,
                number: room.number,
                status: room.status,
                floor: room.floor
            });

            // Pre-fill reservation data if exists
            if (room.currentReservation) {
                frontDeskService.selectedReservation = room.currentReservation;
            }

            // Pre-fill guest information if exists
            if (room.currentGuest) {
                frontDeskService.guestInfo = {
                    id: room.currentGuest.id,
                    name: room.currentGuest.name,
                    phone: room.currentGuest.phone,
                    email: room.currentGuest.email,
                    document_number: room.currentGuest.document_number
                };
            }

            // For reserved rooms, we might want to auto-populate license plate if available
            if (room.status === 'reserved' && room.currentReservation) {
                // Check if there's existing license plate data
                const existingCheckin = checkoutService.activeReservations.find(
                    r => r.id === room.currentReservation?.id
                );
                if (existingCheckin) {
                    // This guest might have existing license plate from previous stays
                    frontDeskService.setLicensePlate(''); // Reset for new entry
                }
            }

            // Navigate to check-in page
            window.location.href = '/front-desk/checkin';
        });
    }

    private handleCheckout(room: RoomWithDetails) {
        // Load active reservations in checkoutService first
        checkoutService.loadActiveReservations().then(() => {
            if (room.currentReservation) {
                // Set the selected reservation for checkout
                checkoutService.selectedReservation = room.currentReservation;

                // Pre-generate checkout summary for this specific reservation
                checkoutService.generateCheckoutSummary(room.currentReservation.id);
            }

            // Navigate to checkout page
            window.location.href = '/front-desk/checkout';
        });
    }

    private handleReservation(room: RoomWithDetails) {
        // Navigate to reservation creation with room parameters
        const params = new URLSearchParams({
            roomId: room.id,
            roomNumber: room.number,
            roomType: room.roomType?.name || ''
        });
        window.location.href = `/reservations/new?${params.toString()}`;
    }

    private handleChangeStatus(room: RoomWithDetails) {
        // This will be handled by the UI component to show status change menu
        // The UI will call updateRoomStatus() method
        console.log(`Opening status change menu for room ${room.number}`);
    }



    // Refresh data from other services
    async refreshData() {
        this.isLoading = true;
        await this.loadSharedData();
        this.isLoading = false;
    }

    // Utility methods
    getRoomStatusText(room: RoomWithDetails): string {
        if (room.hasCustomStatus && room.customStatusName) {
            return room.customStatusName;
        }

        const opt = STATUS_OPTIONS.find(o => o.value === room.status);
        return opt ? opt.label : room.status;
    }

    getRoomStatusColor(room: RoomWithDetails): string {
        if (room.hasCustomStatus && room.customStatusColor) {
            return room.customStatusColor;
        }

        const opt = STATUS_OPTIONS.find(o => o.value === room.status);
        return opt ? opt.color : '#757575';
    }

    // Statistics
    get roomStats() {
        const total = this.rooms.length;
        const vacant = this.rooms.filter(r => r.status === 'vacant').length;
        const occupied = this.rooms.filter(r => r.status === 'occupied').length;
        const reserved = this.rooms.filter(r => r.status === 'reserved').length;
        const pending_inspection = this.rooms.filter(r => r.status === 'pending_inspection').length;
        const cleaning = this.rooms.filter(r => r.status === 'cleaning').length;
        const maintenance = this.rooms.filter(r => r.status === 'maintenance').length;
        const custom = this.rooms.filter(r => r.hasCustomStatus).length;

        return {
            total,
            vacant,
            occupied,
            reserved,
            pending_inspection,
            cleaning,
            maintenance,
            custom,
            occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0
        };
    }
}

const roomManagementService = new RoomManagementService();
export default roomManagementService;
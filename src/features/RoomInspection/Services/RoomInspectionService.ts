import { makeAutoObservable, runInAction } from "mobx";
import type { IRoom, IReservation, IProduct, IConsumption, IDamageReport } from "../../../types";
import eventBusService from "../../../services/EventBusService";

export interface InspectionData {
    id: string;
    reservation_id: string;
    room_id: string;
    inspector_user_id: string;
    inspection_time: string;
    consumptions: IConsumption[];
    damageReports: IDamageReport[];
    notes?: string;
    status: 'pending' | 'completed' | 'approved';
}

class RoomInspectionService {
    inspections: InspectionData[] = [];
    selectedRoom: IRoom | null = null;
    selectedReservation: IReservation | null = null;
    currentInspection: InspectionData | null = null;

    // Mock data
    availableRooms: IRoom[] = [];
    products: IProduct[] = [];
    damageItems: { id: string; hotel_id: string; code: string; name: string; default_charge_price: number; }[] = [];

    isLoading = false;

    constructor() {
        makeAutoObservable(this);
        this.initializeMockData();
        this.loadMockInspections(); // Add test inspection data
    }

    private initializeMockData() {
        // Mock rooms that need inspection (pending_inspection status)
        this.availableRooms = [
            {
                id: 'room-101',
                hotel_id: 'hotel-1',
                room_type_id: 'type-1',
                number: '101',
                status: 'pending_inspection',
                floor: 1,
            },
            {
                id: 'room-102',
                hotel_id: 'hotel-1',
                room_type_id: 'type-1',
                number: '102',
                status: 'pending_inspection',
                floor: 1,
            },
            {
                id: 'room-201',
                hotel_id: 'hotel-1',
                room_type_id: 'type-2',
                number: '201',
                status: 'pending_inspection',
                floor: 2,
            }
        ];

        // Mock products (Mini-bar items)
        this.products = [
            { id: '1', tenant_id: 'tenant-1', hotel_id: 'hotel-1', code: 'WATER', name: 'น้ำเปล่า', price: 25, type: 'minibar' },
            { id: '2', tenant_id: 'tenant-1', hotel_id: 'hotel-1', code: 'COKE', name: 'โค้ก', price: 35, type: 'minibar' },
            { id: '3', tenant_id: 'tenant-1', hotel_id: 'hotel-1', code: 'BEER', name: 'เบียร์', price: 45, type: 'minibar' },
            { id: '4', tenant_id: 'tenant-1', hotel_id: 'hotel-1', code: 'SNACK', name: 'ขนมกรอบ', price: 30, type: 'minibar' },
            { id: '5', tenant_id: 'tenant-1', hotel_id: 'hotel-1', code: 'JUICE', name: 'น้ำผลไม้', price: 40, type: 'minibar' }
        ];

        // Mock damage items
        this.damageItems = [
            { id: '1', hotel_id: 'hotel-1', code: 'GLASS', name: 'แก้วน้ำแตก', default_charge_price: 50 },
            { id: '2', hotel_id: 'hotel-1', code: 'TOWEL', name: 'ผ้าเช็ดตัวเปื้อน', default_charge_price: 150 },
            { id: '3', hotel_id: 'hotel-1', code: 'PILLOW', name: 'หมอนเสียหาย', default_charge_price: 200 },
            { id: '4', hotel_id: 'hotel-1', code: 'SHEET', name: 'ผ้าปูที่นอนรู', default_charge_price: 300 },
            { id: '5', hotel_id: 'hotel-1', code: 'FURNITURE', name: 'เฟอร์นิเจอร์เสียหาย', default_charge_price: 1000 }
        ];
    }

    private loadMockInspections() {
        // Create mock completed inspections for testing checkout integration
        this.inspections = [
            {
                id: 'inspect-001',
                reservation_id: 'res-001', // Matches CheckoutService mock data
                room_id: 'room-101',
                inspector_user_id: 'user-001',
                inspection_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                status: 'completed',
                consumptions: [
                    {
                        id: 'cons-001',
                        reservation_id: 'res-001',
                        room_id: 'room-101',
                        product_id: 'prod-water',
                        quantity: 3,
                        price: 25,
                        recorded_by_user_id: 'user-001',
                        consumed_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                    },
                    {
                        id: 'cons-002',
                        reservation_id: 'res-001',
                        room_id: 'room-101',
                        product_id: 'prod-snacks',
                        quantity: 2,
                        price: 50,
                        recorded_by_user_id: 'user-001',
                        consumed_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                    }
                ],
                damageReports: [
                    {
                        id: 'damage-001',
                        room_id: 'room-101',
                        damage_item_id: 'damage-towel',
                        reported_by_user_id: 'user-001',
                        description: 'ผ้าขนหนูเปื้อนรอยไม่ออก (30% damage)',
                        photos: ['towel-damage.jpg'],
                        estimated_cost: 150,
                        final_charge_amount: 150,
                        status: 'charged',
                        reported_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    }
                ],
                notes: 'การตรวจสอบเสร็จสิ้น - พบความเสียหาย 1 รายการ'
            },
            {
                id: 'inspect-002',
                reservation_id: 'res-002',
                room_id: 'room-201',
                inspector_user_id: 'user-001',
                inspection_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                status: 'completed',
                consumptions: [
                    {
                        id: 'cons-003',
                        reservation_id: 'res-002',
                        room_id: 'room-201',
                        product_id: 'prod-minibar',
                        quantity: 1,
                        price: 200,
                        recorded_by_user_id: 'user-001',
                        consumed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    }
                ],
                damageReports: [], // No damage
                notes: 'ห้องในสภาพดี ไม่มีความเสียหาย'
            }
        ];

        console.log(`🔍 Loaded ${this.inspections.length} mock inspections for testing`);
    }

    async selectRoom(roomId: string) {
        this.isLoading = true;
        try {
            const room = this.availableRooms.find(r => r.id === roomId);
            if (room) {
                this.selectedRoom = room;

                // For now, create a simple mock reservation if needed for UI display
                // In real implementation, this would check actual booking data
                // For walk-in guests, selectedReservation can be null
                this.selectedReservation = {
                    id: `checkout-${roomId}`,
                    tenant_id: 'tenant-1',
                    hotel_id: 'hotel-1',
                    guest_id: `guest-${roomId}`,
                    room_id: roomId,
                    arrival_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    departure_date: new Date().toISOString(), // Already checked out
                    status: 'checked-out',
                    created_at: new Date().toISOString(),
                    total_amount: 1500
                };

                // Initialize new inspection (works with or without reservation)  
                this.currentInspection = {
                    id: `inspection-${Date.now()}`,
                    reservation_id: this.selectedReservation?.id || `walk-in-${roomId}-${Date.now()}`,
                    room_id: roomId,
                    inspector_user_id: 'current-user', // TODO: Get from auth context
                    inspection_time: new Date().toISOString(),
                    consumptions: [],
                    damageReports: [],
                    status: 'pending'
                };
            }
        } finally {
            this.isLoading = false;
        }
    }

    // Consumption methods
    addConsumption(productId: string, quantity: number) {
        if (!this.currentInspection) return;

        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const consumption: IConsumption = {
            id: `consumption-${Date.now()}-${productId}`,
            reservation_id: this.currentInspection.reservation_id, // Uses walk-in ID if no reservation
            room_id: this.currentInspection.room_id,
            product_id: productId,
            quantity,
            price: product.price,
            recorded_by_user_id: this.currentInspection.inspector_user_id,
            consumed_at: new Date().toISOString()
        };

        this.currentInspection.consumptions.push(consumption);
    }

    removeConsumption(consumptionId: string) {
        if (!this.currentInspection) return;
        this.currentInspection.consumptions = this.currentInspection.consumptions.filter(c => c.id !== consumptionId);
    }

    // Damage methods
    addDamageReport(damageItemId: string, quantity: number, notes?: string) {
        if (!this.currentInspection) return;

        const damageItem = this.damageItems.find(d => d.id === damageItemId);
        if (!damageItem) return;

        const damageReport: IDamageReport = {
            id: `damage-${Date.now()}-${damageItemId}`,
            room_id: this.currentInspection.room_id,
            damage_item_id: damageItemId,
            reported_by_user_id: this.currentInspection.inspector_user_id,
            description: notes || `${damageItem.name} (จำนวน: ${quantity})`,
            photos: [],
            estimated_cost: damageItem.default_charge_price * quantity,
            final_charge_amount: damageItem.default_charge_price * quantity,
            status: 'pending',
            reported_at: new Date().toISOString()
        };

        this.currentInspection.damageReports.push(damageReport);
    }

    removeDamageReport(damageReportId: string) {
        if (!this.currentInspection) return;
        this.currentInspection.damageReports = this.currentInspection.damageReports.filter(d => d.id !== damageReportId);
    }

    updateDamageReports(reports: IDamageReport[]) {
        if (!this.currentInspection) return;

        runInAction(() => {
            this.currentInspection!.damageReports = [...reports]; // Force new array
            console.log('🔄 Updated damage reports:', reports);
        });
    }

    // Computed values
    get totalConsumptionAmount() {
        if (!this.currentInspection) return 0;
        return this.currentInspection.consumptions.reduce((total, consumption) => {
            return total + (consumption.price * consumption.quantity);
        }, 0);
    }

    get totalDamageAmount() {
        if (!this.currentInspection) return 0;
        return this.currentInspection.damageReports.reduce((total, damage) => {
            return total + damage.final_charge_amount;
        }, 0);
    }

    get totalInspectionAmount() {
        return this.totalConsumptionAmount + this.totalDamageAmount;
    }

    // Actions
    async submitInspection(): Promise<boolean> {
        if (!this.currentInspection) return false;

        try {
            this.isLoading = true;

            // Mark inspection as completed
            this.currentInspection.status = 'completed';

            // Add to inspections list
            this.inspections.push({ ...this.currentInspection });

            // NOTE: ห้องยังคงเป็นสถานะ pending_inspection
            // จะเปลี่ยนเป็น cleaning หลังจากเช็คเอ้าจริงๆ แล้วเท่านั้น
            console.log(`✅ Inspection completed for room ${this.currentInspection.room_id}`);
            console.log(`⏳ Room status remains 'pending_inspection' until actual checkout`);

            // Emit room inspection completion event
            eventBusService.emit({
                type: 'ROOM_INSPECTION_COMPLETED',
                data: {
                    roomId: this.currentInspection.room_id,
                    hasConsumption: this.currentInspection.consumptions.length > 0,
                    hasDamage: this.currentInspection.damageReports.length > 0,
                }
            });

            // Reset current inspection
            this.resetInspection();

            return true;
        } catch (error) {
            console.error('Failed to submit inspection:', error);
            return false;
        } finally {
            this.isLoading = false;
        }
    }

    resetInspection() {
        this.selectedRoom = null;
        this.selectedReservation = null;
        this.currentInspection = null;
    }

    // Data sharing methods for CheckoutService integration
    async getRoomConsumptions(roomId: string, reservationId?: string): Promise<IConsumption[]> {
        try {
            // First check if there's a current inspection for this room
            if (this.currentInspection && this.currentInspection.room_id === roomId) {
                return this.currentInspection.consumptions || [];
            }

            // Look for completed inspections for this room
            const roomInspections = this.inspections.filter(inspection =>
                inspection.room_id === roomId &&
                (!reservationId || inspection.reservation_id === reservationId)
            );

            // Get the most recent inspection
            const latestInspection = roomInspections
                .sort((a, b) => new Date(b.inspection_time).getTime() - new Date(a.inspection_time).getTime())[0];

            return latestInspection?.consumptions || [];
        } catch (error) {
            console.error('Failed to get room consumptions:', error);
            return [];
        }
    }

    async getRoomDamageReports(roomId: string): Promise<IDamageReport[]> {
        try {
            // First check if there's a current inspection for this room
            if (this.currentInspection && this.currentInspection.room_id === roomId) {
                return this.currentInspection.damageReports || [];
            }

            // Look for completed inspections for this room
            const roomInspections = this.inspections.filter(inspection =>
                inspection.room_id === roomId
            );

            // Get the most recent inspection
            const latestInspection = roomInspections
                .sort((a, b) => new Date(b.inspection_time).getTime() - new Date(a.inspection_time).getTime())[0];

            return latestInspection?.damageReports || [];
        } catch (error) {
            console.error('Failed to get room damage reports:', error);
            return [];
        }
    }

    // Get inspection summary for checkout integration
    async getInspectionSummaryForCheckout(roomId: string, reservationId?: string) {
        const consumptions = await this.getRoomConsumptions(roomId, reservationId);
        const damageReports = await this.getRoomDamageReports(roomId);

        const totalConsumptionCharges = consumptions.reduce((sum, c) => sum + (c.quantity * c.price), 0);
        const totalDamageCharges = damageReports.reduce((sum, d) => sum + d.final_charge_amount, 0);

        return {
            consumptions,
            damageReports,
            totalConsumptionCharges,
            totalDamageCharges,
            totalCharges: totalConsumptionCharges + totalDamageCharges
        };
    }
}

const roomInspectionService = new RoomInspectionService();
export default roomInspectionService;

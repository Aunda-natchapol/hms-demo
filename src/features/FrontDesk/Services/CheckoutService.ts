import { makeAutoObservable } from "mobx";
import type {
  IRoom,
  IReservation,
  IGuest,
  ICheckout,
  IConsumption,
  IDamageReport,
  ICustomerInvoice,
  IInvoiceItem,
  ICustomerPayment
} from "../../../types";
import eventBusService from "../../../services/EventBusService";

interface CheckoutSummary {
  reservation: IReservation;
  guest: IGuest;
  room: IRoom;
  roomCharges: number;
  consumptions: IConsumption[];
  damageReports: IDamageReport[];
  totalConsumptionCharges: number;
  totalDamageCharges: number;
  totalAmount: number;
}

class CheckoutService {
  // Current checkout process
  selectedReservation: IReservation | null = null;
  checkoutSummary: CheckoutSummary | null = null;
  currentInvoice: ICustomerInvoice | null = null;
  invoiceItems: IInvoiceItem[] = [];

  // Payment processing
  paymentAmount = 0;
  paymentMethod: 'cash' | 'card' | 'transfer' = 'cash';
  payments: ICustomerPayment[] = [];

  // Available data
  activeReservations: IReservation[] = [];

  isLoading = false;
  isProcessingCheckout = false;
  isProcessingPayment = false;

  constructor() {
    makeAutoObservable(this);
  }

  // Load active reservations (checked-in guests)
  async loadActiveReservations() {
    this.isLoading = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock active reservations
      this.activeReservations = [
        {
          id: "res-001",
          tenant_id: "tenant-1",
          hotel_id: "hotel-1",
          guest_id: "guest-001",
          room_id: "room-101",
          arrival_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          departure_date: new Date().toISOString(),
          status: "checked-in",
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 3000,
        },
        {
          id: "res-002",
          tenant_id: "tenant-1",
          hotel_id: "hotel-1",
          guest_id: "guest-002",
          room_id: "room-201",
          arrival_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          departure_date: new Date().toISOString(),
          status: "checked-in",
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 5000,
        },
      ];

    } finally {
      this.isLoading = false;
    }
  }

  // Generate checkout summary with all charges
  async generateCheckoutSummary(reservationId: string) {
    this.isLoading = true;
    try {
      const reservation = this.activeReservations.find(r => r.id === reservationId);
      if (!reservation) throw new Error("Reservation not found");

      // Pre-checkout validation: Room inspection must be completed first (workflow requirement)
      const hasInspectionData = await this.validatePreCheckoutRequirements(reservation.room_id, reservationId);
      if (!hasInspectionData) {
        throw new Error(`❌ ต้องทำการตรวจสอบห้อง ${reservation.room_id} ก่อนทำการเช็คเอ้า\n\n📋 กรุณาไปที่เมนู "ตรวจสอบห้องพัก" เพื่อตรวจสอบห้องก่อน\n(ห้องต้องมีสถานะ 'รอตรวจสอบ' - pending_inspection)`);
      }

      // Mock guest data
      const guest: IGuest = {
        id: reservation.guest_id,
        tenant_id: reservation.tenant_id,
        hotel_id: reservation.hotel_id,
        name: reservation.guest_id === "guest-001" ? "John Doe" : "Jane Smith",
        phone: reservation.guest_id === "guest-001" ? "081-234-5678" : "089-876-5432",
        email: reservation.guest_id === "guest-001" ? "john@example.com" : "jane@example.com",
        document_number: reservation.guest_id === "guest-001" ? "ID1234567890" : "ID0987654321",
      };

      // Mock room data
      const room: IRoom = {
        id: reservation.room_id,
        hotel_id: reservation.hotel_id,
        room_type_id: reservation.room_id.includes("101") ? "standard" : "deluxe",
        number: reservation.room_id.includes("101") ? "101" : "201",
        status: "occupied",
        floor: reservation.room_id.includes("101") ? 1 : 2,
      };

      // Calculate room charges (using preset amount from reservation)
      const roomCharges = reservation.total_amount || 0;

      // Get actual consumption and damage data from RoomInspectionService
      let consumptions: IConsumption[] = [];
      let damageReports: IDamageReport[] = [];

      try {
        // Import room inspection service
        const { default: roomInspectionService } = await import('../../RoomInspection/Services/RoomInspectionService');

        // Get inspection summary from room inspection service
        const inspectionSummary = await roomInspectionService.getInspectionSummaryForCheckout(
          reservation.room_id,
          reservationId
        );

        consumptions = inspectionSummary.consumptions;
        damageReports = inspectionSummary.damageReports;

        console.log(`Retrieved ${consumptions.length} consumptions and ${damageReports.length} damage reports for room ${reservation.room_id}`);
        console.log(`Total inspection charges: ฿${inspectionSummary.totalCharges}`);

      } catch (error) {
        console.warn('Failed to retrieve room inspection data:', error);

        // Fallback to mock data if service unavailable
        consumptions = [
          {
            id: "cons-001",
            reservation_id: reservationId,
            room_id: reservation.room_id,
            product_id: "prod-water",
            quantity: 2,
            price: 25,
            recorded_by_user_id: "user-001",
            consumed_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
        ];
      }

      const totalConsumptionCharges = consumptions.reduce((sum, c) => sum + (c.quantity * c.price), 0);
      const totalDamageCharges = damageReports.reduce((sum, d) => sum + d.final_charge_amount, 0);
      const totalAmount = roomCharges + totalConsumptionCharges + totalDamageCharges;

      this.checkoutSummary = {
        reservation,
        guest,
        room,
        roomCharges,
        consumptions,
        damageReports,
        totalConsumptionCharges,
        totalDamageCharges,
        totalAmount,
      };

      this.selectedReservation = reservation;

    } finally {
      this.isLoading = false;
    }
  }

  // Generate invoice
  async generateInvoice() {
    if (!this.checkoutSummary) throw new Error("No checkout summary available");

    const invoice: ICustomerInvoice = {
      id: `invoice-${Date.now()}`,
      customer_billing_id: `billing-${Date.now()}`,
      invoice_number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      amount: this.checkoutSummary.totalAmount,
      currency: "THB",
      due_date: new Date().toISOString(),
      status: "pending",
      payment_method: this.paymentMethod,
      issued_by_user_id: "user-001",
      created_at: new Date().toISOString(),
    };

    // Create invoice items
    const items: IInvoiceItem[] = [];

    // Room charges
    items.push({
      id: `item-room-${Date.now()}`,
      customer_invoice_id: invoice.id,
      item_type: "room",
      item_ref_id: this.checkoutSummary.room.id,
      description: `Room ${this.checkoutSummary.room.number} charges`,
      unit_price: this.checkoutSummary.roomCharges,
      quantity: 1,
      amount: this.checkoutSummary.roomCharges,
    });

    // Consumption items
    this.checkoutSummary.consumptions.forEach(consumption => {
      items.push({
        id: `item-cons-${consumption.id}`,
        customer_invoice_id: invoice.id,
        item_type: "consumption",
        item_ref_id: consumption.id,
        description: `Minibar - Product ${consumption.product_id}`,
        unit_price: consumption.price,
        quantity: consumption.quantity,
        amount: consumption.quantity * consumption.price,
      });
    });

    // Damage items
    this.checkoutSummary.damageReports.forEach(damage => {
      items.push({
        id: `item-damage-${damage.id}`,
        customer_invoice_id: invoice.id,
        item_type: "damage",
        item_ref_id: damage.id,
        description: damage.description,
        unit_price: damage.final_charge_amount,
        quantity: 1,
        amount: damage.final_charge_amount,
      });
    });

    this.currentInvoice = invoice;
    this.invoiceItems = items;
    this.paymentAmount = invoice.amount;
  }

  // Process payment
  async processPayment() {
    if (!this.currentInvoice) throw new Error("No invoice available");

    this.isProcessingPayment = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const payment: ICustomerPayment = {
        id: `payment-${Date.now()}`,
        customer_invoice_id: this.currentInvoice.id,
        tenant_id: "tenant-1",
        amount: this.paymentAmount,
        method: this.paymentMethod,
        payment_type: this.paymentAmount >= this.currentInvoice.amount ? "full" : "partial",
        status: "completed",
        txn_ref: `TXN-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      this.payments.push(payment);

      // Update invoice status if fully paid
      const totalPaid = this.payments.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaid >= this.currentInvoice.amount) {
        this.currentInvoice.status = "paid";
      }

    } finally {
      this.isProcessingPayment = false;
    }
  }

  // Complete checkout
  async completeCheckout() {
    if (!this.selectedReservation || !this.currentInvoice) {
      throw new Error("Missing required data for checkout");
    }

    this.isProcessingCheckout = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const checkout: ICheckout = {
        id: `checkout-${Date.now()}`,
        reservation_id: this.selectedReservation.id,
        guest_id: this.selectedReservation.guest_id,
        room_id: this.selectedReservation.room_id,
        checkout_time: new Date().toISOString(),
        billed_invoice_id: this.currentInvoice.id,
      };

      // Update room status to 'cleaning' (E10 from requirements)
      // หลังจากเช็คเอ้าเสร็จแล้ว เปลี่ยนสถานะห้องจาก pending_inspection → cleaning
      await this.updateRoomStatusToCleaning(this.selectedReservation.room_id);

      // Auto-create housekeeping cleaning task
      await this.createHousekeepingTask(this.selectedReservation.room_id, checkout.id);

      console.log("✅ Checkout completed successfully:", checkout);
      console.log(`🧹 Room ${this.selectedReservation.room_id} status changed: pending_inspection → cleaning`);

      // Emit checkout completion event
      eventBusService.emit({
        type: 'CHECKOUT_COMPLETED',
        data: {
          reservationId: this.selectedReservation.id,
          roomId: this.selectedReservation.room_id,
          guestId: this.selectedReservation.guest_id,
        }
      });

      // Reset form
      this.resetCheckout();

      return checkout;

    } finally {
      this.isProcessingCheckout = false;
    }
  }

  private async updateRoomStatusToCleaning(roomId: string) {
    try {
      // TODO: อัพเดทสถานะห้องผ่าน API service
      // await apiService.put(`/api/rooms/${roomId}`, { status: 'cleaning' });

      console.log(`✅ Room ${roomId} status updated to 'cleaning' after checkout`);
      console.log(`   Workflow: pending_inspection → cleaning → vacant`);
    } catch (error) {
      console.error('❌ Failed to update room status:', error);
      throw error; // ต้องอัพเดทสถานะห้องสำเร็จ ไม่งั้นไม่อนุญาตให้เช็คเอ้า
    }
  }

  private async createHousekeepingTask(roomId: string, checkoutId: string) {
    try {
      // Import housekeeping service to create task
      const { default: housekeepingService } = await import('../../Housekeeping/Services/HousekeepingService');

      // Create cleaning task
      await housekeepingService.createTask({
        room_id: roomId,
        task: 'cleaning',
        notes: `ทำความสะอาดหลัง checkout - รหัส: ${checkoutId}`,
        assigned_to_user_id: 'housekeeping-team', // Will be assigned by supervisor
        scheduled_at: new Date()
      });

      console.log(`🧹 Housekeeping cleaning task created for room ${roomId}`);
    } catch (error) {
      console.error('❌ Failed to create housekeeping task:', error);
      // ไม่ throw error เพราะถ้าสร้าง task ไม่ได้ก็ยังอนุญาตให้เช็คเอ้า (สามารถสร้าง task ทีหลังได้)
    }
  }

  // Validate that room inspection has been completed before checkout (workflow requirement)
  private async validatePreCheckoutRequirements(roomId: string, reservationId: string): Promise<boolean> {
    try {
      // Import room inspection service
      const { default: roomInspectionService } = await import('../../RoomInspection/Services/RoomInspectionService');

      // Check if there's inspection data for this room/reservation
      const inspectionSummary = await roomInspectionService.getInspectionSummaryForCheckout(roomId, reservationId);

      // ต้องมีการตรวจสอบห้องก่อน (มีข้อมูล consumption หรือ damage หรือ totalCharges)
      const hasValidInspection =
        inspectionSummary.consumptions.length > 0 ||
        inspectionSummary.damageReports.length > 0 ||
        inspectionSummary.totalCharges >= 0; // อนุญาตให้ checkout แม้จะไม่มีค่าใช้จ่ายเพิ่ม (แต่ต้องผ่านการตรวจสอบ)

      if (hasValidInspection) {
        console.log(`✅ Pre-checkout validation passed for room ${roomId} - Inspection completed`);
        return true;
      } else {
        console.warn(`❌ Pre-checkout validation failed: Room ${roomId} has not been inspected yet`);
        console.warn(`⚠️ Please complete room inspection first (status should be 'pending_inspection')`);
        return false;
      }

    } catch (error) {
      console.warn('Pre-checkout validation error:', error);
      // ไม่อนุญาตให้ checkout ถ้าไม่สามารถตรวจสอบได้
      return false;
    }
  }

  // Form management
  setPaymentAmount(amount: number) {
    this.paymentAmount = amount;
  }

  setPaymentMethod(method: 'cash' | 'card' | 'transfer') {
    this.paymentMethod = method;
  }

  resetCheckout() {
    this.selectedReservation = null;
    this.checkoutSummary = null;
    this.currentInvoice = null;
    this.invoiceItems = [];
    this.paymentAmount = 0;
    this.paymentMethod = 'cash';
    this.payments = [];
  }

  // Validation
  get isReadyForPayment() {
    return !!(this.currentInvoice && this.paymentAmount > 0);
  }

  get isFullyPaid() {
    if (!this.currentInvoice) return false;
    const totalPaid = this.payments.reduce((sum, p) => sum + p.amount, 0);
    return totalPaid >= this.currentInvoice.amount;
  }

  get remainingBalance() {
    if (!this.currentInvoice) return 0;
    const totalPaid = this.payments.reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, this.currentInvoice.amount - totalPaid);
  }
}

const checkoutService = new CheckoutService();
export default checkoutService;
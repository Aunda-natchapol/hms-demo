import { makeAutoObservable } from "mobx";
import type { IReservation, IGuest, IRoom, IRoomType, ICustomerPayment, ICustomerInvoice } from "../../../types";
import eventBusService from "../../../services/EventBusService";

class ReservationService {
  // Data lists
  reservations: IReservation[] = [];
  guests: IGuest[] = [];
  availableRooms: IRoom[] = [];
  roomTypes: IRoomType[] = [];

  // Form state
  selectedReservation: IReservation | null = null;
  newReservation: Partial<IReservation> = {};
  newGuest: Partial<IGuest> = {};

  // UI state
  isLoading = false;
  isSaving = false;
  searchTerm = "";
  statusFilter: IReservation['status'] | 'all' = 'all';

  constructor() {
    makeAutoObservable(this);
  }

  // Load all reservations
  async loadReservations() {
    this.isLoading = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock reservations data
      this.reservations = [
        {
          id: "res-001",
          tenant_id: "tenant-1",
          hotel_id: "hotel-1",
          guest_id: "guest-001",
          room_id: "room-101",
          arrival_date: new Date().toISOString(),
          departure_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "confirmed",
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 3000,
        },
        {
          id: "res-002",
          tenant_id: "tenant-1",
          hotel_id: "hotel-1",
          guest_id: "guest-002",
          room_id: "room-201",
          arrival_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          departure_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: "pending",
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          total_amount: 5000,
        },
        {
          id: "res-003",
          tenant_id: "tenant-1",
          hotel_id: "hotel-1",
          guest_id: "guest-003",
          room_id: "room-102",
          arrival_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          departure_date: new Date().toISOString(),
          status: "checked-in",
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 3000,
        },
        {
          id: "res-004",
          tenant_id: "tenant-1",
          hotel_id: "hotel-1",
          guest_id: "guest-004",
          room_id: "room-202",
          arrival_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          departure_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: "checked-out",
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 5000,
        },
        {
          id: "res-005",
          tenant_id: "tenant-1",
          hotel_id: "hotel-1",
          guest_id: "guest-005",
          room_id: "room-103",
          arrival_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          departure_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          status: "cancelled",
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          total_amount: 3000,
        },
      ];

      // Mock guests data
      this.guests = [
        {
          id: "guest-001",
          tenant_id: "tenant-1",
          hotel_id: "hotel-1",
          name: "John Doe",
          phone: "081-234-5678",
          email: "john@example.com",
          document_number: "ID1234567890",
        },
        {
          id: "guest-002",
          tenant_id: "tenant-1",
          hotel_id: "hotel-1",
          name: "Jane Smith",
          phone: "089-876-5432",
          email: "jane@example.com",
          document_number: "ID0987654321",
        },
        {
          id: "guest-003",
          tenant_id: "tenant-1",
          hotel_id: "hotel-1",
          name: "Mike Johnson",
          phone: "087-555-1234",
          email: "mike@example.com",
          document_number: "ID5555666677",
        },
        {
          id: "guest-004",
          tenant_id: "tenant-1",
          hotel_id: "hotel-1",
          name: "Sarah Wilson",
          phone: "086-777-8888",
          email: "sarah@example.com",
          document_number: "ID8888999900",
        },
        {
          id: "guest-005",
          tenant_id: "tenant-1",
          hotel_id: "hotel-1",
          name: "David Brown",
          phone: "085-111-2222",
          email: "david@example.com",
          document_number: "ID1111222233",
        },
      ];

      // Mock room types
      this.roomTypes = [
        {
          id: "standard",
          hotel_id: "hotel-1",
          code: "STD",
          name: "Standard Room",
          description: "Comfortable standard room with basic amenities",
          base_price: 1500,
        },
        {
          id: "deluxe",
          hotel_id: "hotel-1",
          code: "DLX",
          name: "Deluxe Room",
          description: "Spacious deluxe room with premium amenities",
          base_price: 2500,
        },
        {
          id: "suite",
          hotel_id: "hotel-1",
          code: "STE",
          name: "Suite",
          description: "Luxury suite with separate living area",
          base_price: 4000,
        },
      ];

    } finally {
      this.isLoading = false;
    }
  }

  // Load available rooms for booking
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async loadAvailableRooms(_arrivalDate: string, _departureDate: string) {
    // Mock available rooms based on dates (parameters unused in mock)
    this.availableRooms = [
      {
        id: "room-101",
        hotel_id: "hotel-1",
        room_type_id: "standard",
        number: "101",
        status: "vacant",
        floor: 1,
      },
      {
        id: "room-102",
        hotel_id: "hotel-1",
        room_type_id: "standard",
        number: "102",
        status: "vacant",
        floor: 1,
      },
      {
        id: "room-201",
        hotel_id: "hotel-1",
        room_type_id: "deluxe",
        number: "201",
        status: "vacant",
        floor: 2,
      },
      {
        id: "room-301",
        hotel_id: "hotel-1",
        room_type_id: "suite",
        number: "301",
        status: "vacant",
        floor: 3,
      },
    ];
  }

  // Create new reservation
  async createReservation() {
    if (!this.newReservation.room_id || !this.newReservation.arrival_date || !this.newReservation.departure_date) {
      throw new Error("Missing required reservation information");
    }

    this.isSaving = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create guest first if needed
      let guestId = this.newGuest.id;
      if (!guestId && (this.newGuest.name || this.newGuest.phone)) {
        guestId = `guest-${Date.now()}`;
        const newGuest: IGuest = {
          id: guestId,
          tenant_id: "tenant-1",
          hotel_id: "hotel-1",
          name: this.newGuest.name || "",
          phone: this.newGuest.phone || "",
          email: this.newGuest.email || "",
          document_number: this.newGuest.document_number || "",
        };
        this.guests.push(newGuest);
      }

      // Calculate total amount
      const room = this.availableRooms.find(r => r.id === this.newReservation.room_id);
      const roomType = this.roomTypes.find(rt => rt.id === room?.room_type_id);
      const arrivalDate = new Date(this.newReservation.arrival_date!);
      const departureDate = new Date(this.newReservation.departure_date!);
      const nights = Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalAmount = (roomType?.base_price || 0) * nights;

      // Create reservation
      const reservation: IReservation = {
        id: `res-${Date.now()}`,
        tenant_id: "tenant-1",
        hotel_id: "hotel-1",
        guest_id: guestId || `guest-${Date.now()}`,
        room_id: this.newReservation.room_id,
        arrival_date: this.newReservation.arrival_date,
        departure_date: this.newReservation.departure_date,
        status: "confirmed",
        created_at: new Date().toISOString(),
        total_amount: totalAmount,
      };

      this.reservations.unshift(reservation);

      // Emit reservation creation event
      eventBusService.emit({
        type: 'RESERVATION_CREATED',
        data: {
          reservationId: reservation.id,
          roomId: reservation.room_id,
          guestId: reservation.guest_id,
        }
      });

      this.resetForm();

      return reservation;

    } finally {
      this.isSaving = false;
    }
  }

  // Update reservation status
  async updateReservationStatus(reservationId: string, newStatus: IReservation['status']) {
    const reservation = this.reservations.find(r => r.id === reservationId);
    if (reservation) {
      reservation.status = newStatus;
    }
  }

  // Cancel reservation
  async cancelReservation(reservationId: string) {
    await this.updateReservationStatus(reservationId, 'cancelled');
  }

  // Form management
  setNewReservation(data: Partial<IReservation>) {
    this.newReservation = { ...this.newReservation, ...data };
  }

  setNewGuest(data: Partial<IGuest>) {
    this.newGuest = { ...this.newGuest, ...data };
  }

  setSearchTerm(term: string) {
    this.searchTerm = term;
  }

  setStatusFilter(status: IReservation['status'] | 'all') {
    this.statusFilter = status;
  }

  resetForm() {
    this.newReservation = {};
    this.newGuest = {};
    this.availableRooms = [];
  }

  // Computed values
  get filteredReservations() {
    let filtered = this.reservations;

    // Filter by status
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === this.statusFilter);
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r => {
        const guest = this.guests.find(g => g.id === r.guest_id);
        return (
          r.id.toLowerCase().includes(term) ||
          r.room_id.toLowerCase().includes(term) ||
          guest?.name.toLowerCase().includes(term) ||
          guest?.phone.includes(term)
        );
      });
    }

    return filtered;
  }

  getGuestById(guestId: string) {
    return this.guests.find(g => g.id === guestId);
  }

  getRoomById(roomId: string) {
    return this.availableRooms.find(r => r.id === roomId);
  }

  getRoomTypeById(roomTypeId: string) {
    return this.roomTypes.find(rt => rt.id === roomTypeId);
  }

  get isValidForCreate() {
    return !!(
      this.newReservation.room_id &&
      this.newReservation.arrival_date &&
      this.newReservation.departure_date &&
      (this.newGuest.name || this.newGuest.phone)
    );
  }

  // Record deposit payment for reservation (requirement B_RESERVATION)
  async recordDepositPayment(reservationId: string, depositAmount: number, paymentMethod: 'cash' | 'card' | 'transfer' | 'other' = 'card') {
    try {
      this.isSaving = true;

      // Find the reservation
      const reservation = this.reservations.find(r => r.id === reservationId);
      if (!reservation) {
        throw new Error('ไม่พบข้อมูลการจอง');
      }

      // Create a mock invoice for the deposit payment
      const depositInvoice: ICustomerInvoice = {
        id: `deposit-invoice-${Date.now()}`,
        customer_billing_id: `billing-${Date.now()}`,
        invoice_number: `DEP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        amount: depositAmount,
        currency: 'THB',
        due_date: new Date().toISOString(),
        status: 'paid',
        payment_method: paymentMethod,
        issued_by_user_id: 'user-001',
        created_at: new Date().toISOString(),
      };

      // Create deposit payment record
      const depositPayment: ICustomerPayment = {
        id: `payment-${Date.now()}`,
        customer_invoice_id: depositInvoice.id,
        tenant_id: 'tenant-1',
        amount: depositAmount,
        method: paymentMethod,
        payment_type: 'deposit',
        status: 'completed',
        txn_ref: `DEP-TXN-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      // In a real system, this would create invoice and payment records
      // For now, we'll just log the transaction
      console.log('💳 Deposit Payment Created:', {
        reservationId,
        invoice: depositInvoice,
        payment: depositPayment,
        percentOfTotal: Math.round((depositAmount / (reservation.total_amount || 1)) * 100) + '%'
      });

      // Update reservation to indicate deposit has been paid
      reservation.status = 'confirmed'; // Already confirmed, but with deposit paid

      return {
        invoice: depositInvoice,
        payment: depositPayment
      };

    } catch (error) {
      console.error('Failed to record deposit payment:', error);
      throw error;
    } finally {
      this.isSaving = false;
    }
  }

  // Load reservation for editing
  async loadReservationForEdit(reservationId: string) {
    this.isLoading = true;
    try {
      // Find the reservation to edit
      const reservation = this.reservations.find(r => r.id === reservationId);
      if (!reservation) {
        throw new Error('ไม่พบข้อมูลการจองที่ต้องการแก้ไข');
      }

      // Load the guest data associated with this reservation
      const guest = this.guests.find(g => g.id === reservation.guest_id);

      // Set form data
      this.selectedReservation = reservation;
      this.newReservation = { ...reservation };
      this.newGuest = guest ? { ...guest } : {};

      // Load available rooms for the current date range if needed
      if (reservation.arrival_date && reservation.departure_date) {
        await this.loadAvailableRooms(reservation.arrival_date, reservation.departure_date);
      }

    } catch (error) {
      console.error('Failed to load reservation for edit:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  // Update existing reservation
  async updateReservation(reservationId: string) {
    this.isSaving = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find and update the reservation
      const reservationIndex = this.reservations.findIndex(r => r.id === reservationId);
      if (reservationIndex === -1) {
        throw new Error('ไม่พบข้อมูลการจองที่ต้องการอัปเดต');
      }

      // Update reservation data
      const updatedReservation: IReservation = {
        ...this.reservations[reservationIndex],
        ...this.newReservation,
        id: reservationId, // Keep the original ID
      };

      // Update guest data if exists
      if (this.newGuest.name || this.newGuest.phone) {
        const guestIndex = this.guests.findIndex(g => g.id === updatedReservation.guest_id);
        if (guestIndex !== -1) {
          this.guests[guestIndex] = {
            ...this.guests[guestIndex],
            ...this.newGuest,
          };
        }
      }

      // Update the reservation in the list
      this.reservations[reservationIndex] = updatedReservation;

      // Emit event for other services to react to the update
      eventBusService.emit({
        type: 'RESERVATION_UPDATED',
        data: {
          reservationId,
          roomId: updatedReservation.room_id,
          guestId: updatedReservation.guest_id,
          previousStatus: this.selectedReservation?.status,
          newStatus: updatedReservation.status
        }
      });

      console.log('✅ Reservation updated successfully:', updatedReservation);
      return updatedReservation;

    } catch (error) {
      console.error('Failed to update reservation:', error);
      throw error;
    } finally {
      this.isSaving = false;
    }
  }
}

const reservationService = new ReservationService();
export default reservationService;
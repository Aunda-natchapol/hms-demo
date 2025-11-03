import { makeAutoObservable } from "mobx";
import type { IRoom, IReservation, IGuest, ICheckin, ILicensePlateLog } from "../../../types";
import reservationService from "../../Reservations/Services/ReservationService";

export interface RoomTransfer {
  id: string;
  fromRoom: string;
  toRoom: string;
  guestName: string;
  reservationId: string;
  reason: string;
  transferredAt: Date;
  transferredBy: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  notes?: string;
}

class FrontDeskService {
  // Current form data
  selectedRoom: IRoom | null = null;
  selectedReservation: IReservation | null = null;
  guestInfo: Partial<IGuest> = {};
  licensePlate = "";

  // Available data for selection
  availableRooms: IRoom[] = [];
  pendingReservations: IReservation[] = [];

  // Room Transfer data
  roomTransfers: RoomTransfer[] = [];

  // LPR (License Plate Recognition) simulation
  lprCapturing = false;
  lprResult: ILicensePlateLog | null = null;

  isLoading = false;
  checkingIn = false;

  constructor() {
    makeAutoObservable(this);
    this.initializeMockTransfers();
  }

  private initializeMockTransfers() {
    // Mock Room Transfers
    this.roomTransfers = [
      {
        id: '1',
        fromRoom: '102',
        toRoom: '201',
        guestName: 'Alice Brown',
        reservationId: 'RSV001',
        reason: 'Guest complaint about noise',
        transferredAt: new Date('2025-10-16T10:30:00'),
        transferredBy: 'Manager001',
        status: 'Completed',
        notes: 'Upgraded to better room'
      },
    ];
  }

  // Initialize available rooms and reservations
  async loadAvailableData() {
    this.isLoading = true;
    try {
      // Load reservations from ReservationService
      await reservationService.loadReservations();

      // Get confirmed reservations for room status updates
      const confirmedReservations = reservationService.reservations.filter(
        r => r.status === 'confirmed' || r.status === 'checked-in'
      );

      // Mock available rooms (in real app, this would come from RoomService)
      this.availableRooms = [
        {
          id: "room-101",
          hotel_id: "hotel-1",
          room_type_id: "standard",
          number: "101",
          status: confirmedReservations.find(r => r.room_id === "room-101") ? "reserved" : "vacant",
          floor: 1,
        },
        {
          id: "room-102",
          hotel_id: "hotel-1",
          room_type_id: "standard",
          number: "102",
          status: confirmedReservations.find(r => r.room_id === "room-102") ? "reserved" : "vacant",
          floor: 1,
        },
        {
          id: "room-201",
          hotel_id: "hotel-1",
          room_type_id: "deluxe",
          number: "201",
          status: confirmedReservations.find(r => r.room_id === "room-201") ? "reserved" : "vacant",
          floor: 2,
        },
        {
          id: "room-202",
          hotel_id: "hotel-1",
          room_type_id: "deluxe",
          number: "202",
          status: confirmedReservations.find(r => r.room_id === "room-202") ? "reserved" : "vacant",
          floor: 2,
        },
      ];

      // Get pending/confirmed reservations from ReservationService
      this.pendingReservations = confirmedReservations.filter(
        r => r.status === 'confirmed' && new Date(r.arrival_date) <= new Date()
      );

    } finally {
      this.isLoading = false;
    }
  }

  // Simulate LPR capture
  async captureLicensePlate() {
    this.lprCapturing = true;
    try {
      // Simulate camera capture and OCR processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock LPR result
      const mockPlates = ["ABC-1234", "XYZ-5678", "DEF-9012"];
      const randomPlate = mockPlates[Math.floor(Math.random() * mockPlates.length)];

      this.lprResult = {
        id: `lpr-${Date.now()}`,
        tenant_id: "tenant-1",
        image_ref: "camera-capture-001.jpg",
        plate_text: randomPlate,
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        captured_at: new Date().toISOString(),
      };

      this.licensePlate = randomPlate;

    } finally {
      this.lprCapturing = false;
    }
  }

  // Update form fields
  setSelectedRoom(room: IRoom | null) {
    this.selectedRoom = room;

    // If room is reserved, try to find associated reservation
    if (room?.status === "reserved") {
      const reservation = this.pendingReservations.find(r => r.room_id === room.id);
      this.selectedReservation = reservation || null;
    } else {
      this.selectedReservation = null;
    }
  }

  setGuestInfo(info: Partial<IGuest>) {
    this.guestInfo = { ...this.guestInfo, ...info };
  }

  setLicensePlate(plate: string) {
    this.licensePlate = plate;
    this.lprResult = null; // Clear LPR result when manually edited
  }

  // Perform check-in
  async performCheckin() {
    if (!this.selectedRoom || !this.licensePlate) {
      throw new Error("Missing required information");
    }

    this.checkingIn = true;
    try {
      // Simulate check-in process
      await new Promise(resolve => setTimeout(resolve, 1500));

      const checkinData: ICheckin = {
        id: `checkin-${Date.now()}`,
        reservation_id: this.selectedReservation?.id || "",
        guest_id: this.guestInfo.id || `guest-${Date.now()}`,
        room_id: this.selectedRoom.id,
        checkin_time: new Date().toISOString(),
        registered_by_user_id: "user-001", // Mock current user
        license_plate: this.licensePlate,
      };

      // Link LPR result if available
      if (this.lprResult) {
        this.lprResult.checkin_id = checkinData.id;
      }

      console.log("Check-in successful:", checkinData);

      // Reset form
      this.resetForm();

      return checkinData;

    } finally {
      this.checkingIn = false;
    }
  }

  resetForm() {
    this.selectedRoom = null;
    this.selectedReservation = null;
    this.guestInfo = {};
    this.licensePlate = "";
    this.lprResult = null;
  }

  // Validation
  get isValidForCheckin() {
    return !!(this.selectedRoom && this.licensePlate.trim());
  }

  get guestName() {
    return this.guestInfo.name || "";
  }

  get guestPhone() {
    return this.guestInfo.phone || "";
  }

  // Room Transfer Methods
  addRoomTransfer(transfer: Omit<RoomTransfer, 'id'>) {
    const newTransfer: RoomTransfer = {
      ...transfer,
      id: Date.now().toString()
    };
    this.roomTransfers.unshift(newTransfer);
    return newTransfer;
  }

  updateTransferStatus(id: string, status: RoomTransfer['status']) {
    const transfer = this.roomTransfers.find(t => t.id === id);
    if (transfer) {
      transfer.status = status;
    }
  }

  getPendingTransfers() {
    return this.roomTransfers.filter(t => t.status === 'Pending');
  }
}

const frontDeskService = new FrontDeskService();
export default frontDeskService;
// Core Entity Types based on ER Diagram

export interface IRoom {
  id: string;
  hotel_id: string;
  room_type_id: string;
  number: string;
  status: 'vacant' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance' | 'pending_inspection';
  floor: number;
}

export interface IRoomType {
  id: string;
  hotel_id: string;
  code: string;
  name: string;
  description: string;
  base_price: number;
}

export interface IRoomRate {
  id: string;
  room_type_id: string;
  rate_date: string;
  price: number;
  pricing_rule: string;
}

export interface IGuest {
  id: string;
  tenant_id: string;
  hotel_id: string;
  name: string;
  phone: string;
  email: string;
  document_number: string;
}

export interface IReservation {
  id: string;
  tenant_id: string;
  hotel_id: string;
  guest_id: string;
  room_id: string;
  arrival_date: string;
  departure_date: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  created_at: string;
  total_amount?: number;
}

export interface ICheckin {
  id: string;
  reservation_id: string;
  guest_id: string;
  room_id: string;
  checkin_time: string;
  registered_by_user_id: string;
  license_plate: string;
}

export interface ICheckout {
  id: string;
  reservation_id: string;
  guest_id: string;
  room_id: string;
  checkout_time: string;
  billed_invoice_id: string;
}

export interface IProduct {
  id: string;
  tenant_id?: string;
  hotel_id: string;
  code?: string;
  name: string;
  price: number;
  type?: 'minibar' | 'amenity' | 'service';
  category?: string;
  stock_quantity?: number;
  unit?: string;
  is_active?: boolean;
}

export interface IConsumption {
  id: string;
  reservation_id: string;
  room_id: string;
  product_id: string;
  quantity: number;
  price: number;
  recorded_by_user_id: string;
  consumed_at: string;
}

export interface IDamageItemsMaster {
  id: string;
  hotel_id: string;
  code: string;
  name: string;
  default_charge_price: number;
}

export interface IDamageReport {
  id: string;
  room_id: string;
  damage_item_id: string;
  reported_by_user_id: string;
  description: string;
  photos: string[];
  estimated_cost: number;
  final_charge_amount: number;
  status: 'pending' | 'resolved' | 'charged';
  reported_at: string;
}

export interface ICustomerInvoice {
  id: string;
  customer_billing_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  due_date: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  payment_method: string;
  issued_by_user_id: string;
  parent_invoice_id?: string;
  created_at: string;
}

export interface IInvoiceItem {
  id: string;
  customer_invoice_id: string;
  item_type: 'room' | 'consumption' | 'damage' | 'service';
  item_ref_id: string;
  description: string;
  unit_price: number;
  quantity: number;
  amount: number;
}

export interface ICustomerPayment {
  id: string;
  customer_invoice_id: string;
  tenant_id: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'other';
  payment_type: 'deposit' | 'full' | 'partial';
  status: 'pending' | 'completed' | 'failed';
  txn_ref: string;
  created_at: string;
}

export interface IRoomTransfer {
  id: string;
  reservation_id: string;
  hotel_id: string;
  from_room_id: string;
  to_room_id: string;
  transfer_time: string;
  reason: string;
  processed_by: string;
}

export interface IHousekeeping {
  id: string;
  room_id: string;
  task: string;
  status: 'pending' | 'in-progress' | 'completed';
  assigned_to_user_id: string;
  scheduled_at: string;
  completed_at?: string;
}

export interface ILicensePlateLog {
  id: string;
  tenant_id: string;
  image_ref: string;
  plate_text: string;
  confidence: number;
  captured_at: string;
  checkin_id?: string;
}

// Dashboard specific types
export interface IDashboardMetrics {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  reservedRooms: number;
  cleaningRooms: number;
  occupancyRate: number;
  totalRevenue: number;
  todayCheckins: number;
  todayCheckouts: number;
  pendingHousekeeping: number;
}

export interface IRoomStatusGrid {
  rooms: IRoom[];
  roomTypes: IRoomType[];
  currentReservations: IReservation[];
  currentGuests: IGuest[];
}
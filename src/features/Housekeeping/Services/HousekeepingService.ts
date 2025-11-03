import { makeAutoObservable } from "mobx";
import eventBusService from "../../../services/EventBusService";

// Types based on README database schema
export interface HousekeepingTask {
  id: string;
  room_id: string;
  task: 'cleaning' | 'maintenance' | 'inspection' | 'deep_clean';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to_user_id: string;
  scheduled_at: Date;
  completed_at?: Date;
  notes?: string;
}

export interface Room {
  id: string;
  hotel_id: string;
  room_type_id: string;
  number: string;
  status: 'Vacant' | 'Occupied' | 'Cleaning' | 'Out_of_Order';
  floor: number;
  last_checkout?: Date;
  needs_cleaning?: boolean;
}

export interface DamageReport {
  id: string;
  room_id: string;
  damage_item_id: string;
  reported_by_user_id: string;
  description: string;
  photos?: string[];
  estimated_cost: number;
  final_charge_amount: number;
  status: 'reported' | 'assessed' | 'charged' | 'resolved';
  reported_at: Date;
  resolved_at?: Date;
}

export interface HousekeepingUser {
  id: string;
  name: string;
  role_id: string;
  status: 'active' | 'inactive';
  phone?: string;
}

export interface DamageItemMaster {
  id: string;
  code: string;
  name: string;
  default_charge_price: number;
  category: string;
}

export interface HousekeepingStatistics {
  roomsNeedingCleaning: number;
  inProgressTasks: number;
  pendingTasks: number;
  completedTasksToday: number;
  pendingDamageReports: number;
  availableStaff: number;
}

class HousekeepingService {
  // Observable data
  tasks: HousekeepingTask[] = [];
  rooms: Room[] = [];
  damageReports: DamageReport[] = [];
  users: HousekeepingUser[] = [];
  damageItems: DamageItemMaster[] = [];

  isLoading = false;
  selectedTask: HousekeepingTask | null = null;
  selectedRoom: Room | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initializeData();
  }

  // Initialize mock data
  private initializeData() {
    // Mock rooms
    this.rooms = [
      { id: "room-101", hotel_id: "hotel-1", room_type_id: "standard", number: "101", status: "Cleaning", floor: 1, needs_cleaning: true },
      { id: "room-102", hotel_id: "hotel-1", room_type_id: "standard", number: "102", status: "Vacant", floor: 1, needs_cleaning: false },
      { id: "room-103", hotel_id: "hotel-1", room_type_id: "standard", number: "103", status: "Occupied", floor: 1, needs_cleaning: false },
      { id: "room-201", hotel_id: "hotel-1", room_type_id: "deluxe", number: "201", status: "Cleaning", floor: 2, needs_cleaning: true },
      { id: "room-202", hotel_id: "hotel-1", room_type_id: "deluxe", number: "202", status: "Vacant", floor: 2, needs_cleaning: false },
      { id: "room-203", hotel_id: "hotel-1", room_type_id: "deluxe", number: "203", status: "Out_of_Order", floor: 2, needs_cleaning: false },
    ];

    // Mock users (housekeeping staff)
    this.users = [
      { id: "user-001", name: "สมศรี ใจดี", role_id: "housekeeping", status: "active", phone: "081-234-5678" },
      { id: "user-002", name: "วิไล สะอาด", role_id: "housekeeping", status: "active", phone: "089-876-5432" },
      { id: "user-003", name: "มานี ขยัน", role_id: "maintenance", status: "active", phone: "092-345-6789" },
      { id: "user-004", name: "สมพงษ์ รักษา", role_id: "supervisor", status: "active", phone: "098-765-4321" },
    ];

    // Mock damage items master
    this.damageItems = [
      { id: "damage-001", code: "TOWEL", name: "ผ้าเช็ดตัว", default_charge_price: 200, category: "Linen" },
      { id: "damage-002", code: "PILLOW", name: "หมอน", default_charge_price: 300, category: "Bedding" },
      { id: "damage-003", code: "GLASS", name: "แก้วน้ำ", default_charge_price: 50, category: "Amenities" },
      { id: "damage-004", code: "REMOTE", name: "รีโมทTV", default_charge_price: 500, category: "Electronics" },
      { id: "damage-005", code: "CURTAIN", name: "ผ้าม่าน", default_charge_price: 800, category: "Furnishing" },
    ];

    // Mock housekeeping tasks
    this.tasks = [
      {
        id: "task-001",
        room_id: "room-101",
        task: "cleaning",
        status: "in_progress",
        assigned_to_user_id: "user-001",
        scheduled_at: new Date(),
        notes: "Regular cleaning after checkout"
      },
      {
        id: "task-002",
        room_id: "room-201",
        task: "cleaning",
        status: "pending",
        assigned_to_user_id: "user-002",
        scheduled_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        notes: "Post-checkout cleaning"
      },
      {
        id: "task-003",
        room_id: "room-203",
        task: "maintenance",
        status: "pending",
        assigned_to_user_id: "user-003",
        scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        notes: "AC unit repair"
      },
    ];

    // Mock damage reports
    this.damageReports = [
      {
        id: "damage-report-001",
        room_id: "room-103",
        damage_item_id: "damage-001",
        reported_by_user_id: "user-001",
        description: "ผ้าเช็ดตัวมีคราบสีที่ล้างไม่ออก",
        estimated_cost: 200,
        final_charge_amount: 200,
        status: "reported",
        reported_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: "damage-report-002",
        room_id: "room-201",
        damage_item_id: "damage-004",
        reported_by_user_id: "user-002",
        description: "รีโมท TV หายไป",
        estimated_cost: 500,
        final_charge_amount: 500,
        status: "assessed",
        reported_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ];
  }

  // Task Management
  async createTask(taskData: Partial<HousekeepingTask>) {
    this.isLoading = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

      const newTask: HousekeepingTask = {
        id: `task-${Date.now()}`,
        room_id: taskData.room_id!,
        task: taskData.task || 'cleaning',
        status: 'pending',
        assigned_to_user_id: taskData.assigned_to_user_id!,
        scheduled_at: taskData.scheduled_at || new Date(),
        notes: taskData.notes,
      };

      this.tasks.push(newTask);
      return newTask;
    } finally {
      this.isLoading = false;
    }
  }

  async updateTaskStatus(taskId: string, status: HousekeepingTask['status'], completedAt?: Date) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      if (status === 'completed' && completedAt) {
        task.completed_at = completedAt;

        // Update room status when cleaning is completed
        if (task.task === 'cleaning') {
          this.updateRoomStatus(task.room_id, 'Vacant');

          // Emit housekeeping task completion event
          eventBusService.emit({
            type: 'HOUSEKEEPING_TASK_COMPLETED',
            data: {
              roomId: task.room_id,
              taskType: task.task,
            }
          });
        }
      }
    }
  }

  // Room Management
  updateRoomStatus(roomId: string, status: Room['status']) {
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      room.status = status;
      room.needs_cleaning = status === 'Cleaning';

      // Auto-create cleaning task when room status changes to "Cleaning"
      if (status === 'Cleaning') {
        this.autoCreateCleaningTask(roomId);
      }
    }
  }

  private async autoCreateCleaningTask(roomId: string) {
    // Find available housekeeping staff
    const availableStaff = this.users.find(u => u.role_id === 'housekeeping' && u.status === 'active');
    if (availableStaff) {
      await this.createTask({
        room_id: roomId,
        task: 'cleaning',
        assigned_to_user_id: availableStaff.id,
        scheduled_at: new Date(),
        notes: 'Auto-generated from checkout'
      });
    }
  }

  getRoomsNeedingCleaning(): Room[] {
    return this.rooms.filter(room => room.status === 'Cleaning' || room.needs_cleaning);
  }

  // Damage Report Management
  async createDamageReport(reportData: Partial<DamageReport>) {
    this.isLoading = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newReport: DamageReport = {
        id: `damage-report-${Date.now()}`,
        room_id: reportData.room_id!,
        damage_item_id: reportData.damage_item_id!,
        reported_by_user_id: reportData.reported_by_user_id!,
        description: reportData.description || '',
        estimated_cost: reportData.estimated_cost || 0,
        final_charge_amount: reportData.final_charge_amount || reportData.estimated_cost || 0,
        status: 'reported',
        reported_at: new Date(),
        photos: reportData.photos,
      };

      this.damageReports.push(newReport);
      return newReport;
    } finally {
      this.isLoading = false;
    }
  }

  async updateDamageReportStatus(reportId: string, status: DamageReport['status']) {
    const report = this.damageReports.find(r => r.id === reportId);
    if (report) {
      report.status = status;
      if (status === 'resolved') {
        report.resolved_at = new Date();
      }
    }
  }

  // Load tasks (for external services to trigger data loading)
  async loadTasks() {
    // In real implementation, this would load from API
    // For now, just ensure we have initialized data
    if (this.tasks.length === 0) {
      this.initializeData();
    }
  }

  // Statistics
  getStatistics(): HousekeepingStatistics {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      roomsNeedingCleaning: this.getRoomsNeedingCleaning().length,
      inProgressTasks: this.tasks.filter(t => t.status === 'in_progress').length,
      pendingTasks: this.tasks.filter(t => t.status === 'pending').length,
      completedTasksToday: this.tasks.filter(t =>
        t.status === 'completed' &&
        t.completed_at &&
        t.completed_at >= todayStart
      ).length,
      pendingDamageReports: this.damageReports.filter(r => r.status === 'reported').length,
      availableStaff: this.users.filter(u => u.status === 'active').length,
    };
  }

  // Helper methods
  getUserName(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  }

  getRoomNumber(roomId: string): string {
    const room = this.rooms.find(r => r.id === roomId);
    return room?.number || 'Unknown Room';
  }

  getDamageItemName(itemId: string): string {
    const item = this.damageItems.find(i => i.id === itemId);
    return item?.name || 'Unknown Item';
  }

  // Integration with E_CHECKOUT workflow
  async onRoomCheckout(roomId: string) {
    // Called when guest checks out - update room status to "Cleaning"
    this.updateRoomStatus(roomId, 'Cleaning');
  }

  // Getters for computed values
  get tasksByStatus() {
    return {
      pending: this.tasks.filter(t => t.status === 'pending'),
      in_progress: this.tasks.filter(t => t.status === 'in_progress'),
      completed: this.tasks.filter(t => t.status === 'completed'),
      cancelled: this.tasks.filter(t => t.status === 'cancelled'),
    };
  }

  get roomsByStatus() {
    return {
      vacant: this.rooms.filter(r => r.status === 'Vacant'),
      occupied: this.rooms.filter(r => r.status === 'Occupied'),
      cleaning: this.rooms.filter(r => r.status === 'Cleaning'),
      out_of_order: this.rooms.filter(r => r.status === 'Out_of_Order'),
    };
  }
}

const housekeepingService = new HousekeepingService();
export default housekeepingService;
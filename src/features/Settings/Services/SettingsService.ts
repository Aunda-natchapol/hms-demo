import { makeAutoObservable } from 'mobx';

export interface RoomType {
  id: string;
  name: string;
  description: string;
  baseRate: number;
  capacity: number;
  bedType: 'Single' | 'Double' | 'Twin' | 'King' | 'Queen';
  amenities: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  category: 'Food' | 'Beverage' | 'Amenity' | 'Service';
  price: number;
  cost: number;
  unit: string;
  supplier?: string;
  stockQuantity: number;
  minStockLevel: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DamageItem {
  id: string;
  name: string;
  category: 'Furniture' | 'Electronics' | 'Bathroom' | 'Bedding' | 'Other';
  replacementCost: number;
  supplier?: string;
  warranty?: number; // months
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: 'Front Desk' | 'Housekeeping' | 'Maintenance' | 'Management' | 'F&B';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
}

export interface Permission {
  id: string;
  name: string;
  module: 'Dashboard' | 'FrontDesk' | 'Reservations' | 'RoomOps' | 'Housekeeping' | 'Settings' | 'Reports';
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve';
  description: string;
}

class SettingsService {
  roomTypes: RoomType[] = [];
  products: Product[] = [];
  damageItems: DamageItem[] = [];
  users: User[] = [];
  roles: UserRole[] = [];
  permissions: Permission[] = [];

  constructor() {
    makeAutoObservable(this);
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock Permissions
    this.permissions = [
      { id: '1', name: 'View Dashboard', module: 'Dashboard', action: 'view', description: 'View dashboard and statistics' },
      { id: '2', name: 'Manage Check-in', module: 'FrontDesk', action: 'create', description: 'Process guest check-in' },
      { id: '3', name: 'Manage Check-out', module: 'FrontDesk', action: 'edit', description: 'Process guest check-out' },
      { id: '4', name: 'View Reservations', module: 'Reservations', action: 'view', description: 'View reservation list' },
      { id: '5', name: 'Create Reservations', module: 'Reservations', action: 'create', description: 'Create new reservations' },
      { id: '6', name: 'Edit Reservations', module: 'Reservations', action: 'edit', description: 'Modify existing reservations' },
      { id: '7', name: 'Cancel Reservations', module: 'Reservations', action: 'delete', description: 'Cancel reservations' },
      { id: '8', name: 'Room Operations', module: 'RoomOps', action: 'create', description: 'Manage room operations' },
      { id: '9', name: 'Housekeeping Tasks', module: 'Housekeeping', action: 'edit', description: 'Manage housekeeping tasks' },
      { id: '10', name: 'System Settings', module: 'Settings', action: 'edit', description: 'Manage system settings' },
      { id: '11', name: 'View Reports', module: 'Reports', action: 'view', description: 'View system reports' },
      { id: '12', name: 'Approve Damages', module: 'RoomOps', action: 'approve', description: 'Approve damage reports' },
    ];

    // Mock Roles
    this.roles = [
      {
        id: '1',
        name: 'Administrator',
        description: 'Full system access',
        isActive: true,
        permissions: this.permissions
      },
      {
        id: '2',
        name: 'Manager',
        description: 'Management level access',
        isActive: true,
        permissions: this.permissions.filter(p => p.id !== '10') // All except system settings
      },
      {
        id: '3',
        name: 'Front Desk',
        description: 'Front desk operations',
        isActive: true,
        permissions: this.permissions.filter(p =>
          ['1', '2', '3', '4', '5', '6', '11'].includes(p.id)
        )
      },
      {
        id: '4',
        name: 'Housekeeping',
        description: 'Housekeeping operations',
        isActive: true,
        permissions: this.permissions.filter(p =>
          ['1', '8', '9', '11'].includes(p.id)
        )
      },
      {
        id: '5',
        name: 'Maintenance',
        description: 'Maintenance operations',
        isActive: true,
        permissions: this.permissions.filter(p =>
          ['1', '8', '12', '11'].includes(p.id)
        )
      },
    ];

    // Mock Room Types
    this.roomTypes = [
      {
        id: '1',
        name: 'Standard Single',
        description: 'Comfortable single occupancy room',
        baseRate: 1200,
        capacity: 1,
        bedType: 'Single',
        amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Safe'],
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '2',
        name: 'Standard Double',
        description: 'Standard room for two guests',
        baseRate: 1800,
        capacity: 2,
        bedType: 'Double',
        amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Safe', 'Balcony'],
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '3',
        name: 'Superior Twin',
        description: 'Spacious room with twin beds',
        baseRate: 2200,
        capacity: 2,
        bedType: 'Twin',
        amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Safe', 'Balcony', 'Coffee Machine'],
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '4',
        name: 'Deluxe King',
        description: 'Luxury room with king size bed',
        baseRate: 3500,
        capacity: 2,
        bedType: 'King',
        amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Safe', 'Balcony', 'Coffee Machine', 'Bathtub', 'Work Desk'],
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '5',
        name: 'Executive Suite',
        description: 'Premium suite with separate living area',
        baseRate: 5500,
        capacity: 4,
        bedType: 'King',
        amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Safe', 'Balcony', 'Coffee Machine', 'Bathtub', 'Work Desk', 'Living Room', 'Kitchenette'],
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
    ];

    // Mock Products
    this.products = [
      {
        id: '1',
        name: 'Cola',
        category: 'Beverage',
        price: 25,
        cost: 12,
        unit: 'bottle',
        supplier: 'Local Distributor',
        stockQuantity: 150,
        minStockLevel: 20,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '2',
        name: 'Water Bottle',
        category: 'Beverage',
        price: 15,
        cost: 5,
        unit: 'bottle',
        supplier: 'Water Co.',
        stockQuantity: 200,
        minStockLevel: 50,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '3',
        name: 'Chips',
        category: 'Food',
        price: 30,
        cost: 15,
        unit: 'bag',
        supplier: 'Snack Foods Ltd.',
        stockQuantity: 80,
        minStockLevel: 15,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '4',
        name: 'Towel Set',
        category: 'Amenity',
        price: 200,
        cost: 80,
        unit: 'set',
        supplier: 'Textile Supplier',
        stockQuantity: 50,
        minStockLevel: 10,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '5',
        name: 'Room Service',
        category: 'Service',
        price: 100,
        cost: 0,
        unit: 'service',
        stockQuantity: 0,
        minStockLevel: 0,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
    ];

    // Mock Damage Items
    this.damageItems = [
      {
        id: '1',
        name: 'Bed Sheet',
        category: 'Bedding',
        replacementCost: 500,
        supplier: 'Textile Supplier',
        warranty: 6,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '2',
        name: 'TV Remote',
        category: 'Electronics',
        replacementCost: 150,
        supplier: 'Electronics Store',
        warranty: 12,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '3',
        name: 'Hair Dryer',
        category: 'Electronics',
        replacementCost: 800,
        supplier: 'Hotel Equipment Co.',
        warranty: 24,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '4',
        name: 'Towel',
        category: 'Bathroom',
        replacementCost: 200,
        supplier: 'Textile Supplier',
        warranty: 6,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '5',
        name: 'Chair',
        category: 'Furniture',
        replacementCost: 1500,
        supplier: 'Furniture Mart',
        warranty: 36,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
    ];

    // Mock Users
    this.users = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@hotel.com',
        firstName: 'ผู้ดูแล',
        lastName: 'ระบบ',
        role: this.roles[0], // Administrator
        department: 'Management',
        isActive: true,
        lastLogin: new Date('2025-10-17T08:00:00'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '2',
        username: 'manager01',
        email: 'manager@hotel.com',
        firstName: 'สมใจ',
        lastName: 'จัดการ',
        role: this.roles[1], // Manager
        department: 'Management',
        isActive: true,
        lastLogin: new Date('2025-10-16T18:00:00'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '3',
        username: 'frontdesk01',
        email: 'frontdesk@hotel.com',
        firstName: 'มานี',
        lastName: 'ต้อนรับ',
        role: this.roles[2], // Front Desk
        department: 'Front Desk',
        isActive: true,
        lastLogin: new Date('2025-10-17T07:30:00'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '4',
        username: 'housekeeper01',
        email: 'housekeeping@hotel.com',
        firstName: 'สมหญิง',
        lastName: 'ทำความสะอาด',
        role: this.roles[3], // Housekeeping
        department: 'Housekeeping',
        isActive: true,
        lastLogin: new Date('2025-10-17T06:00:00'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: '5',
        username: 'maintenance01',
        email: 'maintenance@hotel.com',
        firstName: 'สมชาย',
        lastName: 'ซ่อมบำรุง',
        role: this.roles[4], // Maintenance
        department: 'Maintenance',
        isActive: true,
        lastLogin: new Date('2025-10-16T16:00:00'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
    ];
  }

  // Room Type Management
  addRoomType(roomType: Omit<RoomType, 'id' | 'createdAt' | 'updatedAt'>) {
    const newRoomType: RoomType = {
      ...roomType,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.roomTypes.push(newRoomType);
    return newRoomType;
  }

  updateRoomType(id: string, updates: Partial<Omit<RoomType, 'id' | 'createdAt'>>) {
    const roomType = this.roomTypes.find(rt => rt.id === id);
    if (roomType) {
      Object.assign(roomType, updates, { updatedAt: new Date() });
    }
    return roomType;
  }

  deleteRoomType(id: string) {
    const index = this.roomTypes.findIndex(rt => rt.id === id);
    if (index > -1) {
      this.roomTypes.splice(index, 1);
      return true;
    }
    return false;
  }

  // Product Management
  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.push(newProduct);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      Object.assign(product, updates, { updatedAt: new Date() });
    }
    return product;
  }

  deleteProduct(id: string) {
    const index = this.products.findIndex(p => p.id === id);
    if (index > -1) {
      this.products.splice(index, 1);
      return true;
    }
    return false;
  }

  // Damage Item Management
  addDamageItem(item: Omit<DamageItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const newItem: DamageItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.damageItems.push(newItem);
    return newItem;
  }

  updateDamageItem(id: string, updates: Partial<Omit<DamageItem, 'id' | 'createdAt'>>) {
    const item = this.damageItems.find(di => di.id === id);
    if (item) {
      Object.assign(item, updates, { updatedAt: new Date() });
    }
    return item;
  }

  deleteDamageItem(id: string) {
    const index = this.damageItems.findIndex(di => di.id === id);
    if (index > -1) {
      this.damageItems.splice(index, 1);
      return true;
    }
    return false;
  }

  // User Management
  addUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) {
    const user = this.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, updates, { updatedAt: new Date() });
    }
    return user;
  }

  deleteUser(id: string) {
    const index = this.users.findIndex(u => u.id === id);
    if (index > -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }

  // Role Management
  addRole(role: Omit<UserRole, 'id'>) {
    const newRole: UserRole = {
      ...role,
      id: Date.now().toString()
    };
    this.roles.push(newRole);
    return newRole;
  }

  updateRole(id: string, updates: Partial<Omit<UserRole, 'id'>>) {
    const role = this.roles.find(r => r.id === id);
    if (role) {
      Object.assign(role, updates);
    }
    return role;
  }

  deleteRole(id: string) {
    const index = this.roles.findIndex(r => r.id === id);
    if (index > -1) {
      this.roles.splice(index, 1);
      return true;
    }
    return false;
  }

  // Getters
  getActiveRoomTypes() {
    return this.roomTypes.filter(rt => rt.isActive);
  }

  getActiveProducts() {
    return this.products.filter(p => p.isActive);
  }

  getActiveDamageItems() {
    return this.damageItems.filter(di => di.isActive);
  }

  getActiveUsers() {
    return this.users.filter(u => u.isActive);
  }

  getActiveRoles() {
    return this.roles.filter(r => r.isActive);
  }

  getLowStockProducts() {
    return this.products.filter(p => p.stockQuantity <= p.minStockLevel && p.isActive);
  }

  getUsersByRole(roleId: string) {
    return this.users.filter(u => u.role.id === roleId && u.isActive);
  }

  getUsersByDepartment(department: User['department']) {
    return this.users.filter(u => u.department === department && u.isActive);
  }
}

export const settingsService = new SettingsService();
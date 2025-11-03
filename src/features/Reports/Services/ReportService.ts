import { makeAutoObservable } from "mobx";

// Report Types
export interface IRevenueData {
  date: string;
  room_revenue: number;
  service_revenue: number;
  total_revenue: number;
  occupancy_rate: number;
}

export interface IOccupancyData {
  date: string;
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  occupancy_rate: number;
  adr: number; // Average Daily Rate
  revpar: number; // Revenue Per Available Room
}

export interface IAuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: string;
  module: string;
  details: string;
  ip_address: string;
}

class ReportService {
  // Revenue Report Data
  revenueData: IRevenueData[] = [];
  revenueLoading = false;
  revenueStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  revenueEndDate = new Date().toISOString().split('T')[0];

  // Occupancy Report Data
  occupancyData: IOccupancyData[] = [];
  occupancyLoading = false;
  occupancyStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  occupancyEndDate = new Date().toISOString().split('T')[0];

  // Audit Log Data
  auditLogs: IAuditLog[] = [];
  auditLoading = false;
  auditStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  auditEndDate = new Date().toISOString().split('T')[0];
  auditModule = 'all';

  constructor() {
    makeAutoObservable(this);
    this.generateMockData();
  }

  // Generate mock data for demonstration
  generateMockData() {
    this.generateRevenueData();
    this.generateOccupancyData();
    this.generateAuditLogs();
  }

  generateRevenueData() {
    const data: IRevenueData[] = [];
    const startDate = new Date(this.revenueStartDate);
    const endDate = new Date(this.revenueEndDate);

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const baseRevenue = 50000 + Math.random() * 30000;
      const occupancyRate = 0.6 + Math.random() * 0.35;

      data.push({
        date: dateStr,
        room_revenue: Math.round(baseRevenue * occupancyRate),
        service_revenue: Math.round(baseRevenue * 0.3 * occupancyRate),
        total_revenue: Math.round(baseRevenue * 1.3 * occupancyRate),
        occupancy_rate: Math.round(occupancyRate * 100),
      });
    }

    this.revenueData = data;
  }

  generateOccupancyData() {
    const data: IOccupancyData[] = [];
    const startDate = new Date(this.occupancyStartDate);
    const endDate = new Date(this.occupancyEndDate);
    const totalRooms = 30;

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const occupiedRooms = Math.floor(totalRooms * (0.5 + Math.random() * 0.45));
      const occupancyRate = (occupiedRooms / totalRooms) * 100;
      const adr = 2500 + Math.random() * 1000; // Average Daily Rate
      const revpar = (adr * occupiedRooms) / totalRooms; // Revenue Per Available Room

      data.push({
        date: dateStr,
        total_rooms: totalRooms,
        occupied_rooms: occupiedRooms,
        available_rooms: totalRooms - occupiedRooms,
        occupancy_rate: Math.round(occupancyRate * 100) / 100,
        adr: Math.round(adr),
        revpar: Math.round(revpar),
      });
    }

    this.occupancyData = data;
  }

  generateAuditLogs() {
    const actions = [
      'เข้าสู่ระบบ', 'ออกจากระบบ', 'สร้างการจอง', 'แก้ไขการจอง', 'ยกเลิกการจอง',
      'เช็คอิน', 'เช็คเอาท์', 'เพิ่มสินค้า', 'แก้ไขราคาห้อง', 'สร้างผู้ใช้ใหม่'
    ];
    const modules = ['Authentication', 'Reservations', 'FrontDesk', 'RoomOps', 'Settings'];
    const users = [
      { id: '1', name: 'แอดมิน ระบบ' },
      { id: '2', name: 'พนักงานต้อนรับ' },
      { id: '3', name: 'ผู้จัดการ' },
      { id: '4', name: 'แม่บ้าน' }
    ];

    const logs: IAuditLog[] = [];
    const startDate = new Date(this.auditStartDate);
    const endDate = new Date(this.auditEndDate);

    for (let i = 0; i < 100; i++) {
      const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
      const user = users[Math.floor(Math.random() * users.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const module = modules[Math.floor(Math.random() * modules.length)];

      logs.push({
        id: `log-${i + 1}`,
        timestamp: randomDate.toISOString(),
        user_id: user.id,
        user_name: user.name,
        action,
        module,
        details: `${action} - รายละเอียดเพิ่มเติม`,
        ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      });
    }

    // Sort by most recent first
    this.auditLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Revenue Report Methods
  setRevenueStartDate(date: string) {
    this.revenueStartDate = date;
    this.generateRevenueData();
  }

  setRevenueEndDate(date: string) {
    this.revenueEndDate = date;
    this.generateRevenueData();
  }

  async loadRevenueReport() {
    this.revenueLoading = true;
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.generateRevenueData();
    } finally {
      this.revenueLoading = false;
    }
  }

  get totalRevenue() {
    return this.revenueData.reduce((sum, item) => sum + item.total_revenue, 0);
  }

  get averageOccupancy() {
    if (this.revenueData.length === 0) return 0;
    return Math.round(
      this.revenueData.reduce((sum, item) => sum + item.occupancy_rate, 0) / this.revenueData.length
    );
  }

  // Occupancy Report Methods
  setOccupancyStartDate(date: string) {
    this.occupancyStartDate = date;
    this.generateOccupancyData();
  }

  setOccupancyEndDate(date: string) {
    this.occupancyEndDate = date;
    this.generateOccupancyData();
  }

  async loadOccupancyReport() {
    this.occupancyLoading = true;
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.generateOccupancyData();
    } finally {
      this.occupancyLoading = false;
    }
  }

  get averageADR() {
    if (this.occupancyData.length === 0) return 0;
    return Math.round(
      this.occupancyData.reduce((sum, item) => sum + item.adr, 0) / this.occupancyData.length
    );
  }

  get averageRevPAR() {
    if (this.occupancyData.length === 0) return 0;
    return Math.round(
      this.occupancyData.reduce((sum, item) => sum + item.revpar, 0) / this.occupancyData.length
    );
  }

  // Audit Log Methods
  setAuditStartDate(date: string) {
    this.auditStartDate = date;
    this.generateAuditLogs();
  }

  setAuditEndDate(date: string) {
    this.auditEndDate = date;
    this.generateAuditLogs();
  }

  setAuditModule(module: string) {
    this.auditModule = module;
  }

  async loadAuditLogs() {
    this.auditLoading = true;
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.generateAuditLogs();
    } finally {
      this.auditLoading = false;
    }
  }

  get filteredAuditLogs() {
    if (this.auditModule === 'all') {
      return this.auditLogs;
    }
    return this.auditLogs.filter(log => log.module === this.auditModule);
  }

  // Export Methods
  exportRevenueReport() {
    const csv = this.convertToCSV(this.revenueData, [
      { key: 'date', label: 'วันที่' },
      { key: 'room_revenue', label: 'รายได้ห้องพัก' },
      { key: 'service_revenue', label: 'รายได้บริการ' },
      { key: 'total_revenue', label: 'รายได้รวม' },
      { key: 'occupancy_rate', label: 'อัตราการเข้าพัก (%)' }
    ]);

    this.downloadCSV(csv, 'revenue-report.csv');
  }

  exportOccupancyReport() {
    const csv = this.convertToCSV(this.occupancyData, [
      { key: 'date', label: 'วันที่' },
      { key: 'total_rooms', label: 'ห้องทั้งหมด' },
      { key: 'occupied_rooms', label: 'ห้องที่เข้าพัก' },
      { key: 'occupancy_rate', label: 'อัตราการเข้าพัก (%)' },
      { key: 'adr', label: 'ADR (บาท)' },
      { key: 'revpar', label: 'RevPAR (บาท)' }
    ]);

    this.downloadCSV(csv, 'occupancy-report.csv');
  }

  exportAuditLogs() {
    const csv = this.convertToCSV(this.filteredAuditLogs, [
      { key: 'timestamp', label: 'เวลา' },
      { key: 'user_name', label: 'ผู้ใช้' },
      { key: 'module', label: 'โมดูล' },
      { key: 'action', label: 'การกระทำ' },
      { key: 'details', label: 'รายละเอียด' },
      { key: 'ip_address', label: 'IP Address' }
    ]);

    this.downloadCSV(csv, 'audit-logs.csv');
  }

  private convertToCSV(data: (IRevenueData | IOccupancyData | IAuditLog)[], columns: { key: string; label: string; }[]): string {
    const headers = columns.map(col => col.label).join(',');
    const rows = data.map(row =>
      columns.map(col => {
        const value = (row as unknown as Record<string, unknown>)[col.key];
        // Handle dates and special characters
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    );

    return [headers, ...rows].join('\n');
  }

  private downloadCSV(csvContent: string, filename: string) {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

const reportService = new ReportService();
export default reportService;
import { makeAutoObservable } from 'mobx';

export type MaintenanceTaskStatus = 'pending' | 'in_progress' | 'completed';
export type MaintenanceTaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceTaskType = 'repair' | 'replacement' | 'inspection' | 'preventive';

export interface MaintenanceTask {
    id: string;
    roomNumber: string;
    roomId: string;
    task: MaintenanceTaskType;
    description: string;
    priority: MaintenanceTaskPriority;
    status: MaintenanceTaskStatus;
    assignedTo?: string;
    reportedBy: string;
    reportedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    estimatedCost?: number;
    actualCost?: number;
    notes?: string;
}

class MaintenanceService {
    tasks: MaintenanceTask[] = [];

    constructor() {
        makeAutoObservable(this);
        this.initializeMockData();
    }

    private initializeMockData() {
        // Mock maintenance tasks
        this.tasks = [
            {
                id: 'MT001',
                roomNumber: '101',
                roomId: 'room-1',
                task: 'repair',
                description: 'แอร์เสียไม่เย็น ต้องเติมน้ำยา',
                priority: 'high',
                status: 'pending',
                reportedBy: 'พนักงานต้อนรับ',
                reportedAt: new Date(2025, 9, 24, 9, 30),
                estimatedCost: 1500,
            },
            {
                id: 'MT002',
                roomNumber: '205',
                roomId: 'room-5',
                task: 'repair',
                description: 'ก็อกน้ำในห้องน้ำรั่ว',
                priority: 'medium',
                status: 'in_progress',
                assignedTo: 'ช่างประปา สมชาย',
                reportedBy: 'แม่บ้าน',
                reportedAt: new Date(2025, 9, 23, 14, 15),
                startedAt: new Date(2025, 9, 24, 8, 0),
                estimatedCost: 500,
            },
            {
                id: 'MT003',
                roomNumber: '302',
                roomId: 'room-12',
                task: 'replacement',
                description: 'เปลี่ยนหลอดไฟในห้องน้ำ',
                priority: 'low',
                status: 'completed',
                assignedTo: 'ช่างไฟฟ้า สมศักดิ์',
                reportedBy: 'แม่บ้าน',
                reportedAt: new Date(2025, 9, 22, 10, 0),
                startedAt: new Date(2025, 9, 23, 9, 0),
                completedAt: new Date(2025, 9, 23, 9, 30),
                estimatedCost: 200,
                actualCost: 180,
                notes: 'เปลี่ยนหลอด LED ใหม่เรียบร้อย',
            },
            {
                id: 'MT004',
                roomNumber: '108',
                roomId: 'room-8',
                task: 'repair',
                description: 'ทีวีเปิดไม่ติด',
                priority: 'urgent',
                status: 'pending',
                reportedBy: 'ผู้พักห้อง',
                reportedAt: new Date(2025, 9, 24, 10, 45),
                estimatedCost: 2000,
            },
            {
                id: 'MT005',
                roomNumber: '203',
                roomId: 'room-3',
                task: 'preventive',
                description: 'ตรวจเช็คระบบไฟฟ้าประจำเดือน',
                priority: 'low',
                status: 'in_progress',
                assignedTo: 'ช่างไฟฟ้า สมศักดิ์',
                reportedBy: 'ระบบอัตโนมัติ',
                reportedAt: new Date(2025, 9, 24, 7, 0),
                startedAt: new Date(2025, 9, 24, 10, 0),
                estimatedCost: 0,
            },
        ];
    }

    // Getters สำหรับสถิติ
    get pendingTasks(): number {
        return this.tasks.filter(t => t.status === 'pending').length;
    }

    get inProgressTasks(): number {
        return this.tasks.filter(t => t.status === 'in_progress').length;
    }

    get completedTasks(): number {
        return this.tasks.filter(t => t.status === 'completed').length;
    }

    get urgentTasks(): number {
        return this.tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;
    }

    get totalEstimatedCost(): number {
        return this.tasks
            .filter(t => t.status !== 'completed')
            .reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
    }

    get totalActualCost(): number {
        return this.tasks
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + (t.actualCost || 0), 0);
    }

    // Actions
    createTask(task: Omit<MaintenanceTask, 'id' | 'reportedAt'>): void {
        const newTask: MaintenanceTask = {
            ...task,
            id: `MT${String(this.tasks.length + 1).padStart(3, '0')}`,
            reportedAt: new Date(),
        };
        this.tasks.unshift(newTask);
    }

    updateTaskStatus(taskId: string, status: MaintenanceTaskStatus, actualCost?: number): void {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = status;
            if (status === 'in_progress' && !task.startedAt) {
                task.startedAt = new Date();
            }
            if (status === 'completed') {
                task.completedAt = new Date();
                if (actualCost !== undefined) {
                    task.actualCost = actualCost;
                }
            }
        }
    }

    assignTask(taskId: string, assignedTo: string): void {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.assignedTo = assignedTo;
        }
    }

    updateTask(taskId: string, updates: Partial<MaintenanceTask>): void {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            Object.assign(task, updates);
        }
    }

    deleteTask(taskId: string): void {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
    }
}

const maintenanceService = new MaintenanceService();
export default maintenanceService;

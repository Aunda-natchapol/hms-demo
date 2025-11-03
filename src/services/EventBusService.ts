import { makeAutoObservable } from "mobx";

// Event types that can occur across the HMS system
export type HMSEvent =
    | { type: 'CHECKIN_COMPLETED'; data: { reservationId: string; roomId: string; guestId: string; }; }
    | { type: 'CHECKOUT_COMPLETED'; data: { reservationId: string; roomId: string; guestId: string; }; }
    | { type: 'ROOM_INSPECTION_COMPLETED'; data: { roomId: string; hasConsumption: boolean; hasDamage: boolean; }; }
    | { type: 'RESERVATION_CREATED'; data: { reservationId: string; roomId: string; guestId: string; }; }
    | { type: 'RESERVATION_UPDATED'; data: { reservationId: string; roomId: string; guestId: string; previousStatus?: string; newStatus?: string; }; }
    | { type: 'RESERVATION_CANCELLED'; data: { reservationId: string; roomId: string; }; }
    | { type: 'ROOM_STATUS_CHANGED'; data: { roomId: string; oldStatus: string; newStatus: string; }; }
    | { type: 'HOUSEKEEPING_TASK_COMPLETED'; data: { roomId: string; taskType: string; }; }
    | { type: 'CONSUMPTION_ADDED'; data: { roomId: string; reservationId: string; items: unknown[]; }; }
    | { type: 'DAMAGE_REPORTED'; data: { roomId: string; reservationId: string; damageItems: unknown[]; }; };

// Event listener function type
export type EventListener = (event: HMSEvent) => void;

/**
 * Central Event Bus for HMS System
 * This service manages communication between different modules
 * When one service performs an action, it can notify other services via events
 */
class EventBusService {
    private listeners: Map<string, EventListener[]> = new Map();
    private eventHistory: HMSEvent[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    // Subscribe to specific event types
    subscribe(eventType: HMSEvent['type'], listener: EventListener) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }

        const listeners = this.listeners.get(eventType)!;
        listeners.push(listener);

        // Return unsubscribe function
        return () => {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        };
    }

    // Emit an event to all subscribers
    emit(event: HMSEvent) {
        console.log(`[EventBus] Emitting event: ${event.type}`, event.data);

        // Add to history for debugging
        this.eventHistory.push(event);

        // Keep only last 100 events
        if (this.eventHistory.length > 100) {
            this.eventHistory.splice(0, 1);
        }

        // Notify all listeners for this event type
        const listeners = this.listeners.get(event.type) || [];
        listeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error(`[EventBus] Error in listener for ${event.type}:`, error);
            }
        });
    }

    // Get recent event history (for debugging)
    getEventHistory(): HMSEvent[] {
        return [...this.eventHistory];
    }

    // Clear event history
    clearHistory() {
        this.eventHistory = [];
    }

    // Get active listeners count for debugging
    getListenersCount(): Record<string, number> {
        const counts: Record<string, number> = {};
        this.listeners.forEach((listeners, eventType) => {
            counts[eventType] = listeners.length;
        });
        return counts;
    }
}

// Create singleton instance
const eventBusService = new EventBusService();
export default eventBusService;
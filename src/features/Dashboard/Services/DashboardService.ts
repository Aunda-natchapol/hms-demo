import { makeAutoObservable } from "mobx";

class DashboardService {
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  // Placeholder for future dashboard functionality
  async initializeDashboard() {
    this.isLoading = true;
    try {
      // TODO: Implement dashboard initialization when features are ready
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Failed to initialize dashboard:", error);
    } finally {
      this.isLoading = false;
    }
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
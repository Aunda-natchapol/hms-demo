import type { FC } from "react";
import { useEffect } from "react";
import DashboardView from "../Views/DashboardView.tsx";
import DashboardService from "../Services/DashboardService.ts";

const DashboardController: FC = () => {
  useEffect(() => {
    // Initialize dashboard data when component mounts
    DashboardService.initializeDashboard();
  }, []);

  return <DashboardView />;
};

export default DashboardController;
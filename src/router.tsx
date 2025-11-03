import { createBrowserRouter } from "react-router-dom";
import App from "./App";

// Import feature components
import DashboardController from "./features/Dashboard/Controllers/DashboardController.tsx";
import CheckinController from "./features/FrontDesk/Controllers/CheckinController.tsx";
import CheckoutController from "./features/FrontDesk/Controllers/CheckoutController.tsx";
import RoomTransferController from "./features/FrontDesk/Controllers/RoomTransferController.tsx";
import RoomManagementController from "./features/FrontDesk/Controllers/RoomManagementController.tsx";
import ReservationListController from "./features/Reservations/Controllers/ReservationListController.tsx";
import ReservationFormController from "./features/Reservations/Controllers/ReservationFormController.tsx";
import RoomInspectionController from "./features/RoomInspection/Controllers/RoomInspectionController";
import HousekeepingController from "./features/Housekeeping/Controllers/HousekeepingController.tsx";
import MaintenanceController from "./features/Maintenance/Controllers/MaintenanceController.tsx";
import RoomTypesController from "./features/Settings/Controllers/RoomTypesController.tsx";
import ProductsController from "./features/Settings/Controllers/ProductsController.tsx";
import DamageItemsController from "./features/Settings/Controllers/DamageItemsController.tsx";
import UsersController from "./features/Settings/Controllers/UsersController.tsx";
import RevenueReportController from "./features/Reports/Controllers/RevenueReportController.tsx";
import OccupancyReportController from "./features/Reports/Controllers/OccupancyReportController.tsx";
import AuditLogsController from "./features/Reports/Controllers/AuditLogsController.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <DashboardController />,
      },
      {
        path: "dashboard",
        element: <DashboardController />,
      },
      // Front Desk routes
      {
        path: "front-desk/rooms",
        element: <RoomManagementController />,
      },
      {
        path: "front-desk/checkin",
        element: <CheckinController />,
      },
      {
        path: "front-desk/checkout",
        element: <CheckoutController />,
      },
      {
        path: "front-desk/transfer",
        element: <RoomTransferController />,
      },
      // Reservations routes
      {
        path: "front-desk/reservations/list",
        element: <ReservationListController />,
      },
      {
        path: "front-desk/reservations/create",
        element: <ReservationFormController />,
      },
      {
        path: "front-desk/reservations/edit/:id",
        element: <ReservationFormController />,
      },
      // Room Operations routes
      {
        path: "room-operations/inspection",
        element: <RoomInspectionController />,
      },
      {
        path: "room-operations/housekeeping",
        element: <HousekeepingController />,
      },
      {
        path: "room-operations/maintenance",
        element: <MaintenanceController />,
      },
      // Legacy routes (redirect to new structure)
      {
        path: "room-inspection",
        element: <RoomInspectionController />,
      },
      {
        path: "housekeeping",
        element: <HousekeepingController />,
      },
      // Settings routes
      {
        path: "settings/room-types",
        element: <RoomTypesController />,
      },
      {
        path: "settings/products",
        element: <ProductsController />,
      },
      {
        path: "settings/damage-masters",
        element: <DamageItemsController />,
      },
      {
        path: "settings/users",
        element: <UsersController />,
      },
      // Reports routes
      {
        path: "reports/revenue",
        element: <RevenueReportController />,
      },
      {
        path: "reports/occupancy",
        element: <OccupancyReportController />,
      },
      {
        path: "reports/audit",
        element: <AuditLogsController />,
      },
    ],
  },
]);

export default router;

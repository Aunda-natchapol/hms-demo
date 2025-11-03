import type { FC } from "react";
import { useEffect } from "react";
import ReservationListView from "../Views/ReservationListView.tsx";
import reservationService from "../Services/ReservationService.ts";

const ReservationListController: FC = () => {
  useEffect(() => {
    // Load reservations when component mounts
    reservationService.loadReservations();
  }, []);

  return <ReservationListView />;
};

export default ReservationListController;
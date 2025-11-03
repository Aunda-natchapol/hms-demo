import type { FC } from "react";
import { useEffect } from "react";
import CheckinView from "../Views/CheckinView.tsx";
import frontDeskService from "../Services/FrontDeskService.ts";

const CheckinController: FC = () => {
  useEffect(() => {
    // Load available rooms and reservations when component mounts
    frontDeskService.loadAvailableData();
  }, []);

  return <CheckinView />;
};

export default CheckinController;
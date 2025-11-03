import type { FC } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import ReservationFormView from "../Views/ReservationFormView.tsx";
import reservationService from "../Services/ReservationService.ts";

const ReservationFormController: FC = () => {
  const { id } = useParams<{ id?: string; }>();
  const isEditMode = Boolean(id);

  useEffect(() => {
    // Load room types
    reservationService.loadReservations();

    if (isEditMode && id) {
      // Load reservation data for editing
      reservationService.loadReservationForEdit(id);
    } else {
      // Reset form for creating new reservation
      reservationService.resetForm();
    }
  }, [id, isEditMode]);

  return <ReservationFormView isEditMode={isEditMode} reservationId={id} />;
};

export default ReservationFormController;
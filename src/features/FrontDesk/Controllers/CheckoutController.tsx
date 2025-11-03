import type { FC } from "react";
import { useEffect } from "react";
import CheckoutView from "../Views/CheckoutView.tsx";
import checkoutService from "../Services/CheckoutService.ts";

const CheckoutController: FC = () => {
  useEffect(() => {
    // Load active reservations when component mounts
    checkoutService.loadActiveReservations();
  }, []);

  return <CheckoutView />;
};

export default CheckoutController;
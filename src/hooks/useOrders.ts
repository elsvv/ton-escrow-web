import { useContext } from "react";
import { OrdersContext } from "../contexts/Orders";

export function useOrders() {
  return useContext(OrdersContext);
}

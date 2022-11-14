import { createContext } from "react";
import { Escrow } from "../../contracts/Escrow";

interface IOrdersContext {
  orders: Escrow[];
  addOrder: (order: Escrow) => void;
  removeOrder: (order: Escrow) => void;
}

export const OrdersContext = createContext<IOrdersContext>({
  orders: [],
  addOrder: () => {},
  removeOrder: () => {},
});

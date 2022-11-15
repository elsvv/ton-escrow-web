import React, { useCallback, useEffect, useState } from "react";
import { Escrow } from "../../contracts/Escrow";
import { isAddrEq } from "../../utils";
import { OrdersContext } from "./context";

type Props = {
  children: React.ReactNode;
};

const ordersKey = "escrow-orders";

type RawEscrow = string;

function hydrateOrders() {
  const res = window.localStorage.getItem(ordersKey);
  if (res === null) {
    return [];
  }
  const rawData: RawEscrow[] = JSON.parse(res);
  return rawData.map((dBoc) => Escrow.createFromRaw(dBoc));
}

function persistOrders(orders: Escrow[]) {
  const bocs = orders.map((item) => item.dataCell.toBoc({ idx: false }).toString("base64"));
  window.localStorage.setItem(ordersKey, JSON.stringify(bocs));
}

export function OrdersProvider({ children }: Props) {
  const [orders, setOrders] = useState<Escrow[]>(hydrateOrders());

  const addOrder = useCallback(
    (order: Escrow) => {
      setOrders((prev) => {
        return prev.find((item) => isAddrEq(item.address, order.address)) ? prev : [...prev, order];
      });
    },
    [setOrders]
  );

  const removeOrder = useCallback(
    (order: Escrow) => {
      setOrders((prev) => prev.filter((item) => !isAddrEq(item.address, order.address)));
    },
    [setOrders]
  );

  useEffect(() => {
    persistOrders(orders);
  }, [orders]);

  return (
    <OrdersContext.Provider value={{ orders, addOrder, removeOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}

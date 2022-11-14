import { Group, CardGrid, useAdaptivity, ViewWidth } from "@vkontakte/vkui";

import { Escrow } from "../contracts/Escrow";
import { useOrders } from "../hooks/useOrders";
import { OrderItem } from "./OrderItem";

type Props = {
  onAccept: (contract: Escrow) => void;
  onDecline: (contract: Escrow) => void;
};

export function OrdersGrid({ onAccept, onDecline }: Props) {
  const { orders, removeOrder } = useOrders();
  const { viewWidth } = useAdaptivity();
  const mobile = viewWidth > ViewWidth.MOBILE;

  return (
    <Group>
      <CardGrid size={mobile ? "s" : "l"}>
        {orders.map((contract, i) => (
          <OrderItem
            key={contract.address.toString()}
            {...{ contract, onAccept, onDecline, removeOrder }}
          />
        ))}
      </CardGrid>
    </Group>
  );
}

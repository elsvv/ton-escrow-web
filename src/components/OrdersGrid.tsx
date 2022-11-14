import { Group, CardGrid } from "@vkontakte/vkui";

import { Escrow } from "../contracts/Escrow";
import { OrderItem } from "./OrderItem";

type Props = {
  contracts: Escrow[];
  onAccept: (contract: Escrow) => void;
  onDecline: (contract: Escrow) => void;
};

export function OrdersGrid({ contracts, onAccept, onDecline }: Props) {
  return (
    <Group>
      <CardGrid size="l">
        {[...contracts, ...contracts, ...contracts, ...contracts].map((contract, i) => (
          <OrderItem
            key={i ?? contract.address.toString()}
            {...{ contract, onAccept, onDecline }}
          />
        ))}
      </CardGrid>
    </Group>
  );
}

import {
  Card,
  SimpleCell,
  InfoRow,
  Header,
  ButtonGroup,
  Button,
  PanelSpinner,
  Div,
} from "@vkontakte/vkui";
import BN from "bn.js";
import { useEffect, useState } from "react";
import { fromNano } from "ton";
import { Escrow } from "../contracts/Escrow";
import { EscrowData } from "../contracts/types";
import { useConnect } from "../hooks/useConnect";
import { showAddr } from "../utils";

type Props = {
  contract: Escrow;
  onAccept: (contract: Escrow) => void;
  onDecline: (contract: Escrow) => void;
};

export function OrderItem({ contract, onAccept, onDecline }: Props) {
  const { address } = useConnect();
  const [data, setData] = useState<EscrowData | null>(null);
  const [balance, setBalance] = useState<BN | null>(null);

  useEffect(() => {
    Promise.all([contract.getInfo(), contract.getBalance()]).then(([info, _balance]) => {
      setData(info!);
      setBalance(_balance);
    });
  }, []);

  if (data === null) {
    return (
      <Card style={{ minHeight: 300 }}>
        <PanelSpinner size="large" />
      </Card>
    );
  }

  const isGuarantor = address === showAddr(data.guarantorAddress);

  return (
    <Card>
      <Header mode="secondary">
        <>Contact address {showAddr(contract.address)}</>
      </Header>
      {balance && (
        <SimpleCell>
          <InfoRow header="Contract balance">{fromNano(balance)}</InfoRow>
        </SimpleCell>
      )}
      <SimpleCell>
        <InfoRow header="Order id">{data.orderId as number}</InfoRow>
      </SimpleCell>
      <SimpleCell multiline>
        <InfoRow header="Initialized">{data.inited ? "Yes" : "No"}</InfoRow>
      </SimpleCell>
      <SimpleCell multiline>
        <InfoRow header="Buyer address">{showAddr(data.buyerAddress)}</InfoRow>
      </SimpleCell>
      <SimpleCell multiline>
        <InfoRow header="Seller address">{showAddr(data.sellerAddress)}</InfoRow>
      </SimpleCell>
      <SimpleCell multiline>
        <InfoRow header="Guarantor address">{showAddr(data.guarantorAddress)}</InfoRow>
      </SimpleCell>
      <SimpleCell>
        <InfoRow header="Full price">{fromNano(data.fullPrice)}</InfoRow>
      </SimpleCell>
      <SimpleCell>
        <InfoRow header="Royalty (included)">{fromNano(data.guarantorRoyalty)}</InfoRow>
      </SimpleCell>

      {isGuarantor && (
        <Div>
          <ButtonGroup mode="horizontal" gap="m" stretched>
            <Button onClick={() => onAccept(contract)} size="l" appearance="positive">
              Accept
            </Button>
            <Button onClick={() => onDecline(contract)} size="l" appearance="negative">
              Decline
            </Button>
          </ButtonGroup>
        </Div>
      )}
    </Card>
  );
}

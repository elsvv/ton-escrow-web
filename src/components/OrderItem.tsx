import {
  Card,
  SimpleCell,
  InfoRow,
  Header,
  ButtonGroup,
  Button,
  PanelSpinner,
  Div,
  IconButton,
} from "@vkontakte/vkui";
import { Icon16Delete, Icon20RefreshOutline } from "@vkontakte/icons";
import BN from "bn.js";
import { useEffect, useState } from "react";
import { fromNano } from "ton";
import { Escrow } from "../contracts/Escrow";
import { EscrowData } from "../contracts/types";
import { useConnect } from "../hooks/useConnect";
import { delay, showAddr } from "../utils";

type Props = {
  contract: Escrow;
  onAccept: (contract: Escrow) => void;
  onDecline: (contract: Escrow) => void;
  removeOrder: (contract: Escrow) => void;
};

export function OrderItem({ contract, onAccept, onDecline, removeOrder }: Props) {
  const { address } = useConnect();
  const [data, setData] = useState<EscrowData | null>(null);
  const [balance, setBalance] = useState<BN | null>(null);

  const getInfo = async () => {
    const info = await contract.getInfo();
    setData(info!);
  };

  useEffect(() => {
    async function fetch() {
      await getInfo();
      await delay(1000);
      const _balance = await contract.getBalance();
      setBalance(_balance);
    }

    fetch();
    // Promise.all([contract.getInfo(), contract.getBalance()]).then(([info, _balance]) => {
    //   setData(info!);
    //   setBalance(_balance);
    // });
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
      <Div className="row-split">
        <Header mode="tertiary">Escrow order</Header>
        <div className="row-split">
          <IconButton onClick={getInfo}>
            <Icon20RefreshOutline />
          </IconButton>
          <IconButton onClick={() => removeOrder(contract)}>
            <Icon16Delete />
          </IconButton>
        </div>
      </Div>
      <SimpleCell>
        <InfoRow header="Contact address">{showAddr(contract.address)}</InfoRow>
      </SimpleCell>
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

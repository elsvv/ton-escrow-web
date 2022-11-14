import { DeLabButton } from "@delab-team/connect";
import { Card, Div, SimpleCell, InfoRow, Spinner, Group, Header } from "@vkontakte/vkui";
import { fromNano } from "ton";
import { useConnect } from "../hooks/useConnect";

export function Wallet() {
  const { isConnected, connector, address, balance } = useConnect();
  return (
    <Group header={<Header>Wallet info</Header>}>
      {isConnected ? (
        <Div>
          {address && (
            <SimpleCell multiline>
              <InfoRow header="Wallet address:">{address}</InfoRow>
            </SimpleCell>
          )}
          <SimpleCell multiline>
            {balance ? <InfoRow header="Balance:">{fromNano(balance)}</InfoRow> : <Spinner />}
          </SimpleCell>
        </Div>
      ) : (
        <DeLabButton DeLabConnectObject={connector} scheme={"dark"} />
      )}
    </Group>
  );
}

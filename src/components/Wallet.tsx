import { DeLabButton } from "@delab-team/connect";
import {
  Div,
  SimpleCell,
  InfoRow,
  Spinner,
  Group,
  Header,
  Button,
  Text,
  Spacing,
} from "@vkontakte/vkui";
import { fromNano } from "ton";
import { useConnect } from "../hooks/useConnect";

export function Wallet() {
  const { isConnected, connector, address, balance } = useConnect();

  const onDisconnect = () => {
    connector.disconnect();
  };

  return (
    <Group
      header={
        isConnected && (
          <Div className="row-split">
            <Header>Wallet info</Header>
            <Button onClick={onDisconnect} mode="outline">
              Disconnect
            </Button>
          </Div>
        )
      }
    >
      {isConnected && (
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
      )}
      {!isConnected && (
        <Div>
          <Text weight="3">
            To use this dapp please connect to a wallet app. With DeLab-Connect you can easily use
            any wallet You like: Tonkeeper, Tonhub, TonWallet etc.
          </Text>
          <Spacing size={20} />
          <Text weight="3">
            With DeLab-Connect you can easily use any wallet You like: Tonkeeper, Tonhub, TonWallet
            etc.
          </Text>

          <Spacing size={20} />

          <div className="center-children delab-connect_wrap">
            <DeLabButton DeLabConnectObject={connector} scheme={"dark"} />
          </div>
        </Div>
      )}
    </Group>
  );
}

import { DeLabAddress, DeLabConnect } from "@delab-team/connect";
import BN from "bn.js";
import { createContext } from "react";
import { Connector } from "../../services";

interface IConnectContext {
  isConnected: boolean;
  address: DeLabAddress;
  approveLink: string | null;
  balance: BN | null;
  connector: DeLabConnect;
}

export const ConnectContext = createContext<IConnectContext>({
  isConnected: false,
  address: undefined,
  approveLink: null,
  balance: null,
  connector: Connector,
});

import { DeLabAddress, DeLabConnecting, DeLabEvent } from "@delab-team/connect";
import BN from "bn.js";
import React, { useEffect, useState } from "react";
import { Address } from "ton";
import { Client, Connector } from "../../services";
import { ConnectContext } from "./context";

type Props = {
  children: React.ReactNode;
};

const BALANCE_TIMER = 5000;

export function ConnectProvider({ children }: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<DeLabAddress>();
  const [approveLink, setApproveLink] = useState(null);
  const [balance, setBalance] = useState<BN | null>(null);

  useEffect(() => {
    function listenDeLab() {
      Connector.on("connect", ({ data }: DeLabEvent) => {
        setIsConnected(true);
        const connectConfig: DeLabConnecting = data;
        setAddress(connectConfig.address);
      });
      Connector.on("disconnect", () => {
        setIsConnected(false);
        setAddress(undefined);
      });
      Connector.on("approve-link", ({ data }: DeLabEvent) => {
        setApproveLink(data ?? null);
      });
      Connector.on("error", (data: DeLabEvent) => {
        console.log("error-> ", data);
      });
      Connector.on("error-transaction", ({ data }: DeLabEvent) => {
        console.log("error-transaction-> ", data);
      });
      Connector.on("error-toncoinwallet", ({ data }: DeLabEvent) => {
        console.log("error-toncoinwallet-> ", data);
      });
      Connector.on("error-tonhub", ({ data }: DeLabEvent) => {
        console.log("error-tonhub-> ", data);
      });
      Connector.on("error-tonkeeper", ({ data }: DeLabEvent) => {
        console.log("error-tonkeeper-> ", data);
      });
      Connector.loadWallet();
    }
    listenDeLab();

    // How to remove listeners?..
  }, []);

  useEffect(() => {
    if (!address) {
      return;
    }

    const addr = Address.parseFriendly(address).address;
    const timer = setInterval(() => {
      Client.getBalance(addr)
        .then((res) => {
          setBalance(res);
        })
        .catch(() => {
          clearInterval(timer);
        });
    }, BALANCE_TIMER);

    return () => {
      clearInterval(timer);
      setBalance(null);
    };
  }, [address]);

  return (
    <ConnectContext.Provider
      value={{ isConnected, address, approveLink, balance, connector: Connector }}
    >
      {children}
    </ConnectContext.Provider>
  );
}

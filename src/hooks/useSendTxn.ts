// https://github.com/ton-defi-org/tonstarter-twa/blob/main/src/hooks/useSendTxn.ts

import { useCallback, useState } from "react";
import { Address, Cell } from "ton";
import BN from "bn.js";
import { useConnect } from "./useConnect";
import { Client } from "../services";
import { toUrlSafe } from "../utils";
import { DeLabTransaction } from "@delab-team/connect";

export type TxnState = "idle" | "requested" | "pending" | "success" | "error";

type SendTxnParams = {
  address: Address;
  value: BN;
  body: Cell;
  stateInit?: Cell;
  onDeeplink?: (link: string) => void;
  pullInterval?: number;
  pullCount?: number;
};

export function useSendTxn() {
  const [txnState, setTxnState] = useState<TxnState>("idle");
  const { connector } = useConnect();

  const markTxnEnded = () => setTxnState("idle");

  const sendTxn = useCallback(
    async ({
      value,
      body,
      stateInit,
      onDeeplink,
      address,
      pullInterval = 6000,
      pullCount = 5,
    }: SendTxnParams) => {
      markTxnEnded();
      const isTonkeeper = connector.typeConnect === "tonkeeper";
      const payloadEncoded = body.toBoc().toString("base64");

      const params: DeLabTransaction = {
        to: address.toFriendly({ urlSafe: isTonkeeper }),
        value: value.toString(),
        payload: isTonkeeper ? toUrlSafe(payloadEncoded) : payloadEncoded,
      };
      if (stateInit) {
        const stateInitEncoded = stateInit.toBoc().toString("base64");
        params.stateInit = isTonkeeper ? toUrlSafe(stateInitEncoded) : stateInitEncoded;
      }
      setTxnState("requested");
      const res = await connector.sendTransaction(params);

      let found = false;

      if (res) {
        if (isTonkeeper) {
          onDeeplink?.(res);
        }
        setTxnState("pending");

        let now = Date.now();
        for (let i = 0; i < pullCount; i++) {
          let txns = await Client.getTransactions(address, { limit: 5 });
          let hasTx = txns.find((tx) => tx.inMessage?.value.eq(value) && tx.time * 1000 > now);
          if (hasTx) {
            found = true;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, pullInterval));
        }
        if (found) {
          setTxnState("success");
        } else {
          setTxnState("error");
        }
      } else {
        setTxnState("error");
      }

      return found;
    },
    [connector]
  );

  return {
    sendTxn,
    txnState,
    isIssuedTxn: txnState === "requested" || txnState === "pending",
    markTxnEnded,
  };
}

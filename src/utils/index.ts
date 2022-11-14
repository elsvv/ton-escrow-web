import { Address, Cell } from "ton";
import BN from "bn.js";

export const showAddr = (addr: Address) => addr.toFriendly({ urlSafe: true, bounceable: true });

export const delay = async (duration: number) => {
  return new Promise((resolve) => setTimeout(resolve, duration));
};

const toBase64url = (str: string) => str.replace(/\+/g, "-").replace(/\//g, "_");

export const tonDeepLink = (address: Address, amount: BN, body?: Cell, stateInit?: Cell) =>
  `ton://transfer/${address.toFriendly({
    urlSafe: true,
    bounceable: true,
  })}?amount=${amount.toString()}${
    body ? "&bin=" + toBase64url(body.toBoc().toString("base64")) : ""
  }${stateInit ? "&init=" + toBase64url(stateInit.toBoc().toString("base64")) : ""}`;

export const isAddrEq = (a1: Address, a2: Address) => a1.toString() === a2.toString();

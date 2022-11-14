import BN from "bn.js";
import { Cell } from "ton";

import { EscrowData } from "../types";

export const parseStackNum = (n: any) => new BN(n[1].substring(2), 16);
export const parseStackCell = (c: any) => Cell.fromBoc(Buffer.from(c[1].bytes, "base64"))[0];

// return (inited?, full_price, order_id, buyer_addr, seller_addr, guarantor_addr, royalty?);
export const parseInfoStack = (stack: any[]): EscrowData => {
  const buyerAddress = parseStackCell(stack[3]).beginParse().readAddress();
  if (buyerAddress === null) {
    throw new Error("could not read buyer address");
  }
  const sellerAddress = parseStackCell(stack[4]).beginParse().readAddress();
  if (sellerAddress === null) {
    throw new Error("could not read seller address");
  }
  const guarantorAddress = parseStackCell(stack[5]).beginParse().readAddress();
  if (guarantorAddress === null) {
    throw new Error("could not read fee guarantor address");
  }

  return {
    inited: parseStackNum(stack[0]).toNumber(),
    fullPrice: parseStackNum(stack[1]),
    orderId: parseStackNum(stack[2]).toNumber(),
    buyerAddress,
    sellerAddress,
    guarantorAddress,
    guarantorRoyalty: parseStackNum(stack[6]),
  };
};

export function parseEscrowDataCell(data: Cell) {
  const cs = data.beginParse();

  const guarantorSlice = cs.readCell().beginParse();

  return {
    inited: cs.readUint(1),
    fullPrice: cs.readCoins(),
    buyerAddress: cs.readAddress()!,
    sellerAddress: cs.readAddress()!,
    orderId: cs.readUint(64),
    guarantorAddress: guarantorSlice.readAddress()!,
    guarantorRoyalty: guarantorSlice.readCoins(),
  };
}

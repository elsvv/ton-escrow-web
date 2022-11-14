import BN from "bn.js";
import { Address } from "ton";

export type CommonEscrowData = {
  inited?: number;
  fullPrice: BN;
  guarantorRoyalty: BN;
};
export type EscrowDeployBody = Omit<CommonEscrowData, "inited">;

export type DynamicEscrowData = {
  buyerAddress: Address;
  sellerAddress: Address;
  orderId: BN | number;
  guarantorAddress: Address;
};
export type EscrowData = CommonEscrowData & DynamicEscrowData;

export type InputsData = {
  orderId: string;
  buyer: string;
  seller: string;
  guarantor: string;
  role: string;
};

import { BN } from "bn.js";
import { Address, Builder, Cell, contractAddress, StateInit, toNano } from "ton";
import { Client } from "../services";
import { parseEscrowDataCell, parseInfoStack } from "./parsers";
import { DynamicEscrowData, EscrowData, InputsData, EscrowDeployBody } from "./types";

export enum OpCodes {
  topUp = 1,
  accept = 2,
  reject = 3,
  get_info_onchain = 10,
  get_info_response = 11,
  success_guarantor_notification = 20,
  success_buyer_notification = 21,
  success_seller_notification = 22,
  reject_guarantor_notification = 30,
  reject_buyer_notification = 31,
  reject_seller_notification = 32,
}

export enum ErrorCodes {
  not_a_buyer = 501,
  not_a_guarantor = 502,
  min_gas_amount = 503,
}

export const codeBoc =
  "te6ccgECDgEAAWsAART/APSkE/S88sgLAQIBIAIDAgFIBAUABPIwBPLQAdDTAwFxsPJA2zwG+kAwBY8vMzY2URXHBfLh9QL6APoAMALbPDBY2zwUQzBxyMsAUAX6AlADzxYBzxbLP8zJ7VThMAXTHyHACo4oNV8DbCIy0z8w7USAC3CAEMjLBVAFzxYk+gIUy2oTyx/LP8zJgED7AOAwIMABDA0GBwIVoUvDtnm2eCBIIEcMDQAQyFjPFgH6AskCKpJfCOAgwALjAjI2wAPjAl8FhA/y8AgJBGYwNQLbPFEhxwXy4fYiggkxLQCgFrny0fdmoRKAFnHbPCCOhhKAFHHbPJIwMeJwgBWBAKANCwsKBFAB2zwwZscF8uH2AoIJMS0AvvLh9wFwgB6AQNs8cYAgIds8cIAfgQCgDQsLCgEE2zwLADBwgBDIywVQBc8WUAP6AhPLahLLH8kB+wAAHu1E0NMA+gD6QPpA0z/UMAAM0PpA+gAw";
const codeCell = Cell.fromBoc(Buffer.from(codeBoc, "base64"))[0];

function buildEscrowDataCell(params: EscrowData) {
  const guarantorData = new Builder()
    .storeAddress(params.guarantorAddress)
    .storeCoins(params.guarantorRoyalty);

  return new Builder()
    .storeUint(0, 1)
    .storeCoins(params.fullPrice)
    .storeAddress(params.buyerAddress)
    .storeAddress(params.sellerAddress)
    .storeUint(params.orderId, 64)
    .storeRef(guarantorData.endCell())
    .endCell();
}

export class Escrow {
  public readonly address: Address;
  public readonly stateInit: Cell;
  public readonly dataCell: Cell;
  public deployed = false;

  static readonly codeCell: Cell = codeCell;

  constructor(data: DynamicEscrowData) {
    const dataCell = buildEscrowDataCell({
      ...data,
      guarantorRoyalty: toNano(0),
      fullPrice: toNano(0),
    });

    const _stateInit = new StateInit({
      code: Escrow.codeCell,
      data: dataCell,
    });
    const stateInit = new Cell();
    _stateInit.writeTo(stateInit);

    this.address = contractAddress({
      workchain: 0,
      initialCode: Escrow.codeCell,
      initialData: dataCell,
    });
    this.stateInit = stateInit;
    this.dataCell = dataCell;
  }

  async getInfo() {
    const res = await Client.callGetMethod(this.address, "get_info");

    return parseInfoStack(res.stack);
  }

  async getBalance() {
    return Client.getBalance(this.address);
  }

  async isDeployed() {
    const res = await Client.isContractDeployed(this.address);
    this.deployed = res;
    return res;
  }

  static createDeployBody(params: EscrowDeployBody) {
    return new Builder().storeCoins(params.fullPrice).storeCoins(params.guarantorRoyalty).endCell();
  }

  static createAcceptBody() {
    return new Builder().storeUint(OpCodes.accept, 32).endCell();
  }

  static createRejectBody() {
    return new Builder().storeUint(OpCodes.reject, 32).endCell();
  }

  static createGetInfoBody(queryId: number = 0) {
    return new Builder().storeUint(OpCodes.get_info_onchain, 32).storeUint(queryId, 64).endCell();
  }

  static createFromRaw(dataBoc: string) {
    const dataCell = Cell.fromBoc(Buffer.from(dataBoc, "base64"))[0];
    const _data = parseEscrowDataCell(dataCell);
    const data = { ..._data, guarantorRoyalty: undefined, fullPrice: undefined };

    return new Escrow(data);
  }

  static createTopUpBody() {
    return new Builder().storeUint(OpCodes.topUp, 32).endCell();
  }

  static async checkAndCrete(params: Omit<InputsData, "role">) {
    let data;
    try {
      data = {
        buyerAddress: Address.parseFriendly(params.buyer).address,
        sellerAddress: Address.parseFriendly(params.seller).address,
        guarantorAddress: Address.parseFriendly(params.guarantor).address,
        orderId: new BN(params.orderId),
      };
    } catch (e) {
      throw new Error("serailization error", { cause: "serailization" });
    }

    const contract = new Escrow(data);
    await contract.isDeployed();

    return contract;
  }
}

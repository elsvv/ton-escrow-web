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
  "te6ccgECDgEAAWwAART/APSkE/S88sgLAQIBIAIDAgFIBAUABPIwBPLQAdDTAwFxsPJA2zwG+kAGjy80NDY2JccF8uH1AvoA+gAwAts8MFjbPBRDMHHIywBQBfoCUAPPFgHPFss/zMntVOExBtMfMCDACo4oEEVfBWwi0z8w7USAC3GAEMjLBVAFzxZw+gIUy2oTyx/LP8zJgED7AOA0I8ABDA0GBwIVoUvDtnm2eCBIIEcMDQAQyFjPFgH6AskCLJJfCOAjwALjAjI2AcAD4wJfBYQP8vAICQRmMzUC2zxRQccF8uH2IoIJMS0AoBa58tH3URKhgBZx2zwgjoYSgBRx2zySMDHicIAVgQCgDQsLCgRQAds8MFEixwXy4fYCggkxLQC+8uH3cIAegEDbPHGAICHbPHCAH4EAoA0LCwoBBNs8CwAwcIAQyMsFUAXPFlAD+gITy2oSyx/JAfsAAB7tRNDTAPoA+kD6QNM/1DAADND6QPoAMA==";
export const codeCell = Cell.fromBoc(Buffer.from(codeBoc, "base64"))[0];

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
  public readonly codeCell: Cell = codeCell;
  public deployed = false;

  constructor(data: DynamicEscrowData) {
    const dataCell = buildEscrowDataCell({
      ...data,
      guarantorRoyalty: toNano(0),
      fullPrice: toNano(0),
    });

    const _stateInit = new StateInit({
      code: codeCell,
      data: dataCell,
    });
    const stateInit = new Cell();
    _stateInit.writeTo(stateInit);

    this.address = contractAddress({
      workchain: 0,
      initialCode: codeCell,
      initialData: dataCell,
    });
    this.stateInit = stateInit;
    this.dataCell = dataCell;
  }

  async getInfo() {
    try {
      const res = await Client.callGetMethod(this.address, "get_info");
      this.deployed = true;

      return parseInfoStack(res.stack);
    } catch (e) {
      this.deployed = false;
    }
  }

  async getBalance() {
    return Client.getBalance(this.address);
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

    await contract.getInfo();
    // try {
    // } catch (e) {
    //   throw new Error("getInfo error", { cause: "getInfo" });
    // }

    return contract;
  }
}

import { Address } from "ton";

export const showAddr = (addr: Address) => addr.toFriendly({ urlSafe: true, bounceable: true });

export const sleep = async (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

export const toUrlSafe = (str: string) => str.replace(/\+/g, "-").replace(/\//g, "_");

export const isAddrEq = (a1: Address, a2: Address) => a1.toString() === a2.toString();

export function openLink(link: string) {
  window.open(link, "_blank");
}

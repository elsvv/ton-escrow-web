import { Address } from "ton";

export const showAddr = (addr: Address) => addr.toFriendly({ urlSafe: true, bounceable: true });

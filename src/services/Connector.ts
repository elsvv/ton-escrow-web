import { DeLabConnect } from "@delab-team/connect";
import { AppConfig } from "../config";

export const Connector = new DeLabConnect(
  window.location.origin,
  AppConfig.name,
  AppConfig.network as "testnet"
  // window.location.origin
);

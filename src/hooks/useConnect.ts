import { useContext } from "react";
import { ConnectContext } from "../contexts/Connect";

export function useConnect() {
  return useContext(ConnectContext);
}

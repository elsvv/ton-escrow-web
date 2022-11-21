import { AdaptivityProvider, AppRoot, ConfigProvider } from "@vkontakte/vkui";
import React from "react";
import { ConnectProvider } from "./Connect";
import { OrdersProvider } from "./Orders";

type Props = {
  children: React.ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <React.StrictMode>
      <ConnectProvider>
        <OrdersProvider>
          <ConfigProvider platform="android" locale="en" scheme="vkcom_dark">
            <AppRoot>
              <AdaptivityProvider>{children}</AdaptivityProvider>
            </AppRoot>
          </ConfigProvider>
        </OrdersProvider>
      </ConnectProvider>
    </React.StrictMode>
  );
}

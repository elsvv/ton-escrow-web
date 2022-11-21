import React from "react";
import ReactDOM from "react-dom/client";
import { AdaptivityProvider, ConfigProvider, AppRoot } from "@vkontakte/vkui";
import { DeLabModal } from "@delab-team/connect";
import App from "./App";
import { Connector } from "./services";
import { ConnectProvider } from "./contexts/Connect";
import { OrdersProvider } from "./contexts/Orders";

import "@vkontakte/vkui/dist/vkui.css";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <ConnectProvider>
      <OrdersProvider>
        <ConfigProvider platform="android" locale="en" scheme="vkcom_dark">
          <AppRoot>
            <AdaptivityProvider>
              <App />
              <DeLabModal DeLabConnectObject={Connector} scheme={"dark"} />
            </AdaptivityProvider>
          </AppRoot>
        </ConfigProvider>
      </OrdersProvider>
    </ConnectProvider>
  </React.StrictMode>
);

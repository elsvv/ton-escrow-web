import ReactDOM from "react-dom/client";
import { DeLabModal } from "@delab-team/connect";
import App from "./App";
import { Connector } from "./services";
import { Providers } from "./contexts";

import "@vkontakte/vkui/dist/vkui.css";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <Providers>
    <App />
    <DeLabModal DeLabConnectObject={Connector} scheme={"dark"} />
  </Providers>
);

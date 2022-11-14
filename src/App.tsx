import { useState } from "react";
import { SplitLayout, PanelHeader, useAdaptivity, SplitCol, ViewWidth } from "@vkontakte/vkui";
import { useConnect } from "./hooks/useConnect";
import { Form } from "./components/Form";
import { InputsData } from "./contracts/types";
import { Escrow } from "./contracts/Escrow";
import { OrderItem } from "./components/OrderItem";
import { Wallet } from "./components/Wallet";
import { toNano } from "ton";
import BN from "bn.js";
import { OrdersGrid } from "./components/OrdersGrid";

function App() {
  const [loading, setLoading] = useState(false);
  const [smc, setSmc] = useState<Escrow | null>(null);
  const { isConnected, address, connector } = useConnect();

  const { viewWidth } = useAdaptivity();
  const desktop = viewWidth > ViewWidth.SMALL_TABLET;
  const mobile = viewWidth > ViewWidth.MOBILE;

  async function onSubmit(inputs: InputsData) {
    setLoading(true);

    const data = { ...inputs };
    switch (inputs.role) {
      case "buyer":
        data.buyer = address!;
        break;
      case "seller":
        data.seller = address!;
        break;
      case "guarantor":
        data.guarantor = address!;
        break;
    }

    let contract: Escrow;
    try {
      contract = await Escrow.checkAndCrete(data);

      console.log("data", data);

      if (contract.deployed) {
        setSmc(contract);
        console.log("Ok, deployed!");
        // Ok
      } else if (inputs.role === "buyer") {
        // Contract is not deployed; deploy if role == buyer
        const fullPrice = toNano(0.5);
        const guarantorRoyalty = fullPrice.div(new BN(20));

        console.log("fullPrice", fullPrice.toString(10));
        console.log("guarantorRoyalty", guarantorRoyalty.toString(10));

        const value = fullPrice.add(toNano(0.05)).toString(10);

        const _ = await connector.sendTransaction({
          value,
          to: contract.address.toFriendly(),
          payload: Escrow.createDeployBody({ fullPrice, guarantorRoyalty })
            .toBoc({ idx: false })
            .toString("base64"),
          stateInit: contract.stateInit.toBoc({ idx: false }).toString("base64"),
        });
        console.log("Ok, deploy");
      } else {
      }
    } catch (e) {
      if (typeof e === "object" && Object.hasOwn(e!, "cause")) {
        // @ts-ignore
        switch (e.cause) {
          case "serailization":
            console.log("Serailization error");
            // Error in form data
            break;
          default:
            // Unknown Error
            break;
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const onAccept = async (contract: Escrow) => {
    connector.sendTransaction({
      value: toNano(0.05).toString(10),
      to: contract.address.toFriendly(),
      payload: Escrow.createAcceptBody().toBoc({ idx: false }).toString("base64"),
    });
  };

  const onDecline = async (contract: Escrow) => {
    connector.sendTransaction({
      value: toNano(0.05).toString(10),
      to: contract.address.toFriendly(),
      payload: Escrow.createRejectBody().toBoc({ idx: false }).toString("base64"),
    });
  };

  return (
    <main>
      <PanelHeader className="testnet">🛠 Dapp works in Testnet only</PanelHeader>
      {!desktop && <Wallet />}
      <SplitLayout>
        <SplitCol width={30} spaced={mobile}>
          {isConnected && <Form onSubmit={onSubmit} loading={loading} />}
        </SplitCol>
        {desktop && (
          <SplitCol spaced>
            <Wallet />
          </SplitCol>
        )}
      </SplitLayout>
      {smc && <OrdersGrid contracts={[smc]} onAccept={onAccept} onDecline={onDecline} />}
    </main>
  );
}

export default App;

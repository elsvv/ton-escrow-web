import React, { useRef, useState } from "react";
import {
  SplitLayout,
  PanelHeader,
  useAdaptivity,
  SplitCol,
  ViewWidth,
  Snackbar,
  Avatar,
} from "@vkontakte/vkui";
import { Icon16ErrorCircleFill } from "@vkontakte/icons";
import { useConnect } from "./hooks/useConnect";
import { Form } from "./components/Form";
import { InputsData } from "./contracts/types";
import { Escrow } from "./contracts/Escrow";
import { Wallet } from "./components/Wallet";
import { toNano } from "ton";
import { OrdersGrid } from "./components/OrdersGrid";
import { ModalRef, Modals } from "./components/Modals/Modals";
import { sleep, toUrlSafe } from "./utils";
import { Fees } from "./config";
import { useOrders } from "./hooks/useOrders";
import { useSendTxn } from "./hooks/useSendTxn";

function App() {
  const [loading, setLoading] = useState(false);
  const { isConnected, address } = useConnect();
  const modalRef = useRef<ModalRef>(null);
  const [snackbar, setSnackbar] = useState<React.ReactNode>(null);
  const { addOrder, removeOrder } = useOrders();
  const { sendTxn, isIssuedTxn, txnState } = useSendTxn();

  const { viewWidth } = useAdaptivity();
  const desktop = viewWidth > ViewWidth.SMALL_TABLET;
  const mobile = viewWidth > ViewWidth.MOBILE;

  const openDark = (text: string) => {
    if (snackbar) return;
    setSnackbar(
      <Snackbar
        mode="dark"
        onClose={() => setSnackbar(null)}
        children={text}
        before={
          <Avatar size={24} style={{ backgroundColor: "tomato" }}>
            <Icon16ErrorCircleFill fill="#fff" />
          </Avatar>
        }
      />
    );
  };

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
      if (contract.deployed) {
        addOrder(contract);
      } else if (inputs.role === "buyer") {
        // Contract is not deployed; deploy if role == buyer
        modalRef.current?.createEscrow(contract);
      } else {
      }
    } catch (e) {
      if (typeof e === "object" && Object.hasOwn(e!, "cause")) {
        // @ts-ignore
        if (e.cause === "serailization") {
          openDark("Invalid form data. Check the addresses or order id you entered");
        }
      } else {
        openDark("Unknown error...");
      }
    } finally {
      setLoading(false);
    }
  }

  const onAccept = async (contract: Escrow) => {
    const value = toNano(Fees.gasFee);
    const body = Escrow.createAcceptBody();

    const ok = await sendTxn({
      value,
      body,
      address: contract.address,
      onDeeplink: (link) => {
        modalRef.current?.confirm(link);
      },
    });
    await sleep(1000);

    if (ok) {
      // update
    }
  };

  const onDecline = async (contract: Escrow) => {
    const value = toNano(Fees.gasFee);
    const body = Escrow.createRejectBody();

    const ok = await sendTxn({
      value,
      body,
      address: contract.address,
      onDeeplink: (link) => {
        modalRef.current?.confirm(link);
      },
    });
    await sleep(1000);

    if (ok) {
      removeOrder(contract);
    }
  };

  return (
    <main>
      <PanelHeader className="testnet">🛠 Dapp works in Testnet only</PanelHeader>
      {!desktop && <Wallet />}
      <SplitLayout modal={<Modals ref={modalRef} />}>
        {isConnected && (
          <SplitCol width={30} spaced={mobile}>
            <Form onSubmit={onSubmit} loading={loading} />
          </SplitCol>
        )}
        {desktop && (
          <SplitCol spaced>
            <Wallet />
          </SplitCol>
        )}
      </SplitLayout>
      <OrdersGrid onAccept={onAccept} onDecline={onDecline} />
      {snackbar}
    </main>
  );
}

export default App;

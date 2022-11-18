import {
  ModalRoot,
  ModalPage,
  ModalPageHeader,
  Div,
  Button,
  FormItem,
  Input,
  PanelHeaderBack,
  useAdaptivity,
  ViewWidth,
  PanelHeaderClose,
  ButtonGroup,
  Spinner,
} from "@vkontakte/vkui";
import BN from "bn.js";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { toNano } from "ton";

import { Fees } from "../../config";
import { Escrow } from "../../contracts/Escrow";
import { useConnect } from "../../hooks/useConnect";
import { useOrders } from "../../hooks/useOrders";
import { useSendTxn } from "../../hooks/useSendTxn";
import { openLink } from "../../utils";

export enum ModalTypes {
  deploy = "deploy",
  confirmTonkeeper = "confirmTonkeeper",
}

export interface ModalRef {
  createEscrow: (contract: Escrow) => void;
  confirm: (link: string) => void;
}

export const Modals = forwardRef<ModalRef>((_, modalRef) => {
  const [activeModal, _setActiveModal] = useState<ModalTypes | null>(null);
  const [modalHistory, setModalHistory] = useState<ModalTypes[]>([]);
  const { viewWidth } = useAdaptivity();
  const [fullPriceValue, setFullPriceValue] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const contractRef = useRef<Escrow | null>(null);
  const { sendTxn, isIssuedTxn } = useSendTxn();
  const { addOrder } = useOrders();
  const { connector } = useConnect();

  const isMobile = viewWidth <= ViewWidth.MOBILE;

  const modalBack = () => {
    setActiveModal(modalHistory[modalHistory.length - 2]);
  };

  const setActiveModal = (_activeModal: ModalTypes | null = null) => {
    let _modalHistory = modalHistory ? [...modalHistory] : [];

    if (_activeModal === null) {
      _modalHistory = [];
    } else if (_modalHistory.indexOf(_activeModal) !== -1) {
      _modalHistory = modalHistory.splice(0, modalHistory.indexOf(_activeModal) + 1);
    } else {
      _modalHistory.push(_activeModal);
    }

    _setActiveModal(_activeModal);
    setModalHistory(_modalHistory);
  };

  const closeModal = () => setActiveModal(null);

  useImperativeHandle(modalRef, () => ({
    createEscrow: (contract: Escrow) => {
      setActiveModal(ModalTypes.deploy);
      contractRef.current = contract;
    },
    confirm: (_link: string) => {
      setActiveModal(ModalTypes.confirmTonkeeper);
      setLink(_link);
    },
  }));

  useEffect(() => {
    if (activeModal === null) {
      contractRef.current = null;
      setLink(null);
    }
  }, [activeModal]);

  const handleDeploy = async () => {
    if (!contractRef.current) return;
    const contract = contractRef.current;

    const fullPrice = toNano(fullPriceValue);
    const guarantorRoyalty = fullPrice.mul(new BN(Fees.royaltyPercent)).div(new BN(100));

    const value = fullPrice.add(toNano(Fees.gasFee));
    const body = Escrow.createDeployBody({ fullPrice, guarantorRoyalty });

    const ok = await sendTxn({
      value,
      body,
      address: contract.address,
      stateInit: contract.stateInit,
      onDeeplink: (link) => {
        setActiveModal(ModalTypes.confirmTonkeeper);
        setLink(link);
      },
    });
    if (ok) {
      closeModal();
      addOrder(contract);
    }
  };

  const displayRoyalty = (parseFloat(fullPriceValue) / 100) * Fees.royaltyPercent;
  const totalSpend = parseFloat(fullPriceValue) + Fees.gasFee;
  const notTonkeeperLoading = connector.typeConnect !== "tonkeeper" && isIssuedTxn;

  return (
    <ModalRoot activeModal={activeModal} onClose={modalBack}>
      <ModalPage
        id={ModalTypes.deploy}
        onClose={modalBack}
        header={
          <ModalPageHeader before={isMobile && <PanelHeaderClose onClick={modalBack} />}>
            Create a new escrow contract
          </ModalPageHeader>
        }
      >
        <FormItem top="Full price: ">
          <Input
            type="number"
            placeholder="Full price in toncoins"
            value={fullPriceValue}
            onChange={(e) => setFullPriceValue(e.target.value)}
          />
        </FormItem>
        <FormItem top={`Guarantor Royalties, ${Fees.royaltyPercent}% of 💎 (included):`}>
          <Input
            placeholder="Royalty"
            disabled
            value={isNaN(displayRoyalty) ? "" : displayRoyalty}
          />
        </FormItem>
        <FormItem top={`To spend (including ${Fees.gasFee} 💎 fees):`}>
          <Input disabled value={isNaN(totalSpend) ? "0" : totalSpend} />
        </FormItem>

        <FormItem>
          <Button loading={notTonkeeperLoading} onClick={handleDeploy} size="l" stretched>
            Deploy
          </Button>
        </FormItem>
      </ModalPage>

      <ModalPage
        id={ModalTypes.confirmTonkeeper}
        onClose={modalBack}
        header={
          <ModalPageHeader before={<PanelHeaderBack label="Назад" onClick={modalBack} />}>
            Confirm
          </ModalPageHeader>
        }
      >
        <Div className="center-children">
          {link ? (
            <QRCode
              value={link}
              size={360}
              quietZone={2}
              eyeRadius={10}
              logoImage={"/favicon.svg"}
              fgColor="#000000"
            />
          ) : (
            <Spinner />
          )}
        </Div>
        <Div>
          <ButtonGroup stretched mode="vertical">
            {link && (
              <Button onClick={() => openLink(link)} size="l" stretched>
                Open via Tonkeeper
              </Button>
            )}
          </ButtonGroup>
        </Div>
      </ModalPage>
    </ModalRoot>
  );
});

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
} from "@vkontakte/vkui";
import BN from "bn.js";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { QRCode } from "react-qrcode-logo";

import { toNano } from "ton";
import { Fees } from "../../config";
import { Escrow } from "../../contracts/Escrow";
import { useConnect } from "../../hooks/useConnect";
import { tonDeepLink } from "../../utils";

export enum ModalTypes {
  deploy = "deploy",
  confirmTonkeeper = "confirmTonkeeper",
}

type Links = {
  tonkeeper: string;
  any: string;
};

export interface ModalRef {
  createEscrow: (contract: Escrow) => void;
  confirm: (links: Links) => void;
}

export const Modals = forwardRef<ModalRef>((_, modalRef) => {
  const [activeModal, _setActiveModal] = useState<ModalTypes | null>(null);

  const [modalHistory, setModalHistory] = useState<ModalTypes[]>([]);
  const { viewWidth } = useAdaptivity();
  const [fullPriceValue, setFullPriceValue] = useState("");
  const [links, setLinks] = useState<Links | null>({ tonkeeper: "", any: "" });
  const contractRef = useRef<Escrow | null>(null);
  const { connector } = useConnect();

  const isMobile = viewWidth <= ViewWidth.MOBILE;

  const modalBack = () => {
    console.log({ modalHistory });
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
    confirm: (_links: Links) => {
      setActiveModal(ModalTypes.confirmTonkeeper);
      setLinks(_links);
    },
  }));

  useEffect(() => {
    if (activeModal === null) {
      contractRef.current = null;
      setLinks(null);
    }
  }, [activeModal]);

  const handleDeploy = async () => {
    if (!contractRef.current) return;
    const contract = contractRef.current;

    const fullPrice = toNano(fullPriceValue);
    const guarantorRoyalty = fullPrice.mul(new BN(Fees.royaltyPercent));

    const value = fullPrice.add(toNano(Fees.gasFee));
    const body = Escrow.createDeployBody({ fullPrice, guarantorRoyalty });

    const res = await connector.sendTransaction({
      value: value.toString(10),
      to: contract.address.toFriendly(),
      payload: body.toBoc({ idx: false }).toString("base64"),
      stateInit: contract.stateInit.toBoc({ idx: false }).toString("base64"),
    });
    if (connector.typeConnect === "tonkeeper") {
      const anyLink = tonDeepLink(contract.address, value, body, contract.stateInit);
      setLinks({ tonkeeper: res, any: anyLink });
      setActiveModal(ModalTypes.confirmTonkeeper);
    } else if (res === true) {
      // Push orders
      closeModal();
    }
  };

  const openLink = (link: string) => {
    window.open(link, "_blank");
  };

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
        <FormItem top="Guarantor Royalties in toncoins (included)">
          <Input
            type="number"
            placeholder="Enter order id"
            disabled
            value={(parseFloat(fullPriceValue) * Fees.royaltyPercent).toFixed(9)}
          />
        </FormItem>

        <FormItem>
          <Button onClick={handleDeploy} size="l" stretched>
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
        {links && (
          <Div className="center-children">
            <QRCode
              value={links?.any ?? links?.tonkeeper}
              size={360}
              quietZone={4}
              eyeRadius={20}
              removeQrCodeBehindLogo
              fgColor="#333333"
            />
          </Div>
        )}
        <Div>
          <ButtonGroup stretched mode="vertical">
            {links?.tonkeeper && (
              <Button onClick={() => openLink(links?.tonkeeper)} size="l" stretched>
                Open via Tonkeeper
              </Button>
            )}
            {links?.any && (
              <Button mode="secondary" onClick={() => openLink(links?.any)} size="l" stretched>
                Open with any TON-app
              </Button>
            )}
          </ButtonGroup>
        </Div>

        {/* <FormItem>
          <Button onClick={openLink} size="l" stretched>
            Open Tonkeeper
          </Button>
        </FormItem> */}
      </ModalPage>
    </ModalRoot>
  );
});

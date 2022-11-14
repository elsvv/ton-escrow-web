import {
  Avatar,
  Button,
  Div,
  HorizontalCell,
  HorizontalScroll,
  IconButton,
  ModalPage,
  ModalPageHeader,
  ModalRoot,
  PanelHeaderButton,
  SimpleCell,
} from "@vkontakte/vkui";

export function Modal() {
  return (
    <ModalRoot activeModal={activeModal}>
      <ModalPage
        id="connect"
        settlingHeight={100}
        onClose={() => props.DeLabConnectObject.closeModal()}
        header={
          <ModalPageHeader>
            <img src={props.scheme === "dark" ? white : black} className="delab-logo delab-logo2" />
            DeLab Connect
          </ModalPageHeader>
        }
      >
        <div>
          {type === 0 ? (
            <div>
              <SimpleCell
                disabled
                className="delab_text"
                before={<Icon20SmartphoneOutline fill="var(--de_lab_color)" />}
              >
                Mobile
              </SimpleCell>
              <HorizontalScroll showArrows={false}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <HorizontalCell
                    size="l"
                    header="Tonhub"
                    onClick={() => props.DeLabConnectObject.connectTonHub()}
                  >
                    <Avatar size={60} mode="app" src={tonhubLogo} />
                  </HorizontalCell>

                  <HorizontalCell
                    size="l"
                    header="Tonkeeper"
                    onClick={() => props.DeLabConnectObject.connectTonkeeper()}
                  >
                    <Avatar size={60} mode="app" src={tonkeeperLogo} />
                  </HorizontalCell>

                  <HorizontalCell size="l" header="JUSTON" disabled>
                    <Avatar size={60} mode="app" src={justonLogo} />
                  </HorizontalCell>
                </div>
              </HorizontalScroll>

              <SimpleCell
                disabled
                className="delab_text"
                before={<Icon20ComputerOutline fill="var(--de_lab_color)" />}
              >
                Desktop
              </SimpleCell>

              <HorizontalScroll showArrows={false}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <HorizontalCell
                    size="l"
                    header="Ton Wallet"
                    onClick={() => props.DeLabConnectObject.connectToncoinWallet()}
                  >
                    <Avatar size={60} mode="app" src={toncoinwalletLogo} />
                  </HorizontalCell>

                  <HorizontalCell
                    size="l"
                    header="MyTonWallet"
                    onClick={() => props.DeLabConnectObject.connectToncoinWallet()}
                  >
                    <Avatar size={60} mode="app" src={mytonwalletLogo} />
                  </HorizontalCell>

                  <HorizontalCell
                    size="l"
                    header="Uniton"
                    onClick={() => props.DeLabConnectObject.connectToncoinWallet()}
                  >
                    <Avatar size={60} mode="app" src={unitonLogo} />
                  </HorizontalCell>
                </div>
              </HorizontalScroll>

              <Div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Button
                  className="delab_lern"
                  target="_blank"
                  href="https://github.com/delab-team/connect"
                >
                  Learn More
                </Button>
              </Div>
            </div>
          ) : null}
        </div>
      </ModalPage>
    </ModalRoot>
  );
}

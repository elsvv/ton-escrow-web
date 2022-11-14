import { DeLabModal, DeLabButton, DeLabConnect } from "@delab-team/connect";

import "./App.css";

const DeLabConnector = new DeLabConnect("https://google.com", "Test");

function App() {
  console.log(Buffer.isBuffer(Buffer.alloc(10)));
  return (
    <div className="App">
      <DeLabButton DeLabConnectObject={DeLabConnector} scheme={"dark"} />

      <DeLabModal DeLabConnectObject={DeLabConnector} scheme={"dark"} />
    </div>
  );
}

export default App;

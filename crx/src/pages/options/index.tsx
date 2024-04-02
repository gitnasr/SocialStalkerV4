import "@src/styles/tailwind.css";

import Options from "./options";
import React from "react";
import ReactDOM from "react-dom/client";

const rootDiv = ReactDOM.createRoot(document.querySelector("#root")!);
rootDiv.render(
	<React.StrictMode>
		<Options />
	</React.StrictMode>
);

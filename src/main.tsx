import {createRoot} from "react-dom/client";
import {Provider} from "react-redux";
import "./index.css";
import App from "./App.tsx";
import {AppWrapper} from "./components/common/PageMeta.tsx";
import {store} from "./store";

createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <AppWrapper>
        <App/>
        </AppWrapper>
    </Provider>
);

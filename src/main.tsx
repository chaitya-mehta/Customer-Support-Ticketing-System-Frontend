import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./store/store";
import { NotificationProvider } from "./context/NotificationContext.tsx";

createRoot(document.getElementById("root")!).render(
  <ReduxProvider store={store}>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </ReduxProvider>
);

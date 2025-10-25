import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { externalServerSync } from "./utils/externalServerSync";

// Iniciar sincronização automática com servidor externo
externalServerSync.startAutoSync();

createRoot(document.getElementById("root")!).render(<App />);

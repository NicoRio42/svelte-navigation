import App from "./App.svelte";
import { setConfig } from "./lib/config";

// setConfig({ hashMode: true });

const app = new App({
  target: document.getElementById("app")!,
});

export default app;

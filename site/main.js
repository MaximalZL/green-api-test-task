import { APP_CONFIG } from "./js/config/app-config.js";
import { GreenApiPage } from "./js/pages/green-api-page.js";

const app = new GreenApiPage(APP_CONFIG);
app.init();


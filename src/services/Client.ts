import { TonClient } from "ton";
import { AppConfig } from "../config";

export const Client = new TonClient({ endpoint: AppConfig.enpoint, apiKey: AppConfig.apiKey });

import { MicroRollup } from "@stackr/sdk";
import { stackrConfig } from "../../stackr.config";
import { blockExplorerMachine } from "./machine";
import { 
  StoreTransactionSchema, 
  StoreTokenTransferSchema, 
  StoreContractInteractionSchema,
  StoreQueryResultSchema
} from "./schemas";

const mru = await MicroRollup({
  config: stackrConfig,
  actionSchemas: [
    StoreTransactionSchema, 
    StoreTokenTransferSchema, 
    StoreContractInteractionSchema,
    StoreQueryResultSchema
  ],
  stateMachines: [blockExplorerMachine],
  stfSchemaMap: {
    storeTransaction: StoreTransactionSchema,
    storeTokenTransfer: StoreTokenTransferSchema,
    storeContractInteraction: StoreContractInteractionSchema,
    storeQueryResult: StoreQueryResultSchema,
  },
});

await mru.init();

export { mru };
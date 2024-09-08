import { ActionSchema, SolidityType } from "@stackr/sdk";

export const StoreTransactionSchema = new ActionSchema("store-transaction", {
  txHash: SolidityType.BYTES32,
  from: SolidityType.ADDRESS,
  to: SolidityType.ADDRESS,
  value: SolidityType.UINT,
  gasUsed: SolidityType.UINT,
  blockNumber: SolidityType.UINT,
  timestamp: SolidityType.UINT,
});

export const StoreTokenTransferSchema = new ActionSchema("store-token-transfer", {
  txHash: SolidityType.BYTES32,
  token: SolidityType.ADDRESS,
  from: SolidityType.ADDRESS,
  to: SolidityType.ADDRESS,
  value: SolidityType.UINT,
  timestamp: SolidityType.UINT,
});

export const StoreContractInteractionSchema = new ActionSchema("store-contract-interaction", {
  txHash: SolidityType.BYTES32,
  contract: SolidityType.ADDRESS,
  method: SolidityType.BYTES32,
  params: SolidityType.BYTES,
  timestamp: SolidityType.UINT,
});

export const StoreQueryResultSchema = new ActionSchema("store-query-result", {
  intent: SolidityType.STRING,
  confidence: SolidityType.UINT,
  entities: SolidityType.STRING,
  data: SolidityType.STRING,
});


export const schemas = {
  StoreTransactionSchema,
  StoreTokenTransferSchema,
  StoreContractInteractionSchema,
  StoreQueryResultSchema,
};
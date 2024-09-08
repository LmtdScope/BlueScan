import { STF, Transitions } from "@stackr/sdk/machine";
import { BlockExplorerState } from "./state";

const storeTransaction: STF<BlockExplorerState> = {
  handler: ({ state, inputs, msgSender, block, emit }) => {
    const { txHash, from, to, value, gasUsed } = inputs;
    const newTransaction = {
      txHash,
      from,
      to,
      value: BigInt(value),
      gasUsed: BigInt(gasUsed),
      blockNumber: BigInt(block.height),
      timestamp: BigInt(block.timestamp)
    };

    state.transactions.push(newTransaction);
    emit({ name: "transactionStored", value: txHash });
    emit({ name: "storedBy", value: msgSender });

    return state;
  },
};

const storeTokenTransfer: STF<BlockExplorerState> = {
  handler: ({ state, inputs, block, emit }) => {
    const { txHash, token, from, to, value } = inputs;
    const newTokenTransfer = {
      txHash,
      token,
      from,
      to,
      value: BigInt(value),
      timestamp: BigInt(block.timestamp)
    };

    state.tokenTransfers.push(newTokenTransfer);
    emit({ name: "tokenTransferStored", value: txHash });

    return state;
  },
};

const storeContractInteraction: STF<BlockExplorerState> = {
  handler: ({ state, inputs, block, emit }) => {
    const { txHash, contract, method, params } = inputs;
    const newContractInteraction = {
      txHash,
      contract,
      method,
      params,
      timestamp: BigInt(block.timestamp)
    };

    state.contractInteractions.push(newContractInteraction);
    emit({ name: "contractInteractionStored", value: txHash });

    return state;
  },
};

const storeQueryResult: STF<BlockExplorerState> = {
  handler: ({ state, inputs, block, emit }) => {
    const { intent, confidence, entities, data } = inputs;
    const newQueryResult = {
      intent,
      confidence: Number(confidence),
      entities,
      data,
      timestamp: BigInt(block.timestamp)
    };

    state.queryResults.push(newQueryResult);
    emit({ name: "queryResultStored", value: JSON.stringify(newQueryResult) });

    return state;
  },
};


export const transitions: Transitions<BlockExplorerState> = {
  storeTransaction,
  storeTokenTransfer,
  storeContractInteraction,
  storeQueryResult,
};
import { StateMachine } from "@stackr/sdk/machine";
import { BlockExplorerState, BlockExplorerStateType } from "./state";
import { transitions } from "./transitions";

const initialState: BlockExplorerStateType = {
  transactions: [],
  tokenTransfers: [],
  contractInteractions: [],
  queryResults: [],
};

const blockExplorerMachine = new StateMachine({
  id: "blockExplorer",
  stateClass: BlockExplorerState,
  initialState: initialState,
  on: transitions,
});

export { blockExplorerMachine };
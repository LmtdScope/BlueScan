import { State } from "@stackr/sdk/machine";
import { BytesLike, solidityPackedKeccak256 } from "ethers";



interface QueryResult {
  intent: string;
  confidence: number;
  entities: string;
  data: string;
  timestamp: bigint;
}
// Define the state type
export interface BlockExplorerStateType {
  transactions: {
    txHash: string;
    from: string;
    to: string;
    value: bigint;
    gasUsed: bigint;
    blockNumber: bigint;
    timestamp: bigint;
  }[];
  tokenTransfers: {
    txHash: string;
    token: string;
    from: string;
    to: string;
    value: bigint;
    timestamp: bigint;
  }[];
  contractInteractions: {
    txHash: string;
    contract: string;
    method: string;
    params: string;
    timestamp: bigint;
  }[];
  queryResults: QueryResult[];
}


export class BlockExplorerState extends State<BlockExplorerStateType> {
  constructor(state: BlockExplorerStateType) {
    super({
      ...state,
      queryResults: state.queryResults || [],
    });
  }

  getRootHash(): BytesLike {
    return solidityPackedKeccak256(
      ["bytes32", "bytes32", "bytes32", "bytes32"],
      [
        this.getTransactionsHash(),
        this.getTokenTransfersHash(),
        this.getContractInteractionsHash(),
        this.getQueryResultsHash()
      ]
    );
  }

  private getTransactionsHash(): BytesLike {
    return solidityPackedKeccak256(
      ["bytes32[]"],
      [this.state.transactions.map(tx => 
        solidityPackedKeccak256(
          ["bytes32", "address", "address", "uint256", "uint256", "uint256", "uint256"],
          [tx.txHash, tx.from, tx.to, tx.value, tx.gasUsed, tx.blockNumber, tx.timestamp]
        )
      )]
    );
  }

  private getTokenTransfersHash(): BytesLike {
    return solidityPackedKeccak256(
      ["bytes32[]"],
      [this.state.tokenTransfers.map(tt => 
        solidityPackedKeccak256(
          ["bytes32", "address", "address", "address", "uint256", "uint256"],
          [tt.txHash, tt.token, tt.from, tt.to, tt.value, tt.timestamp]
        )
      )]
    );
  }

  private getContractInteractionsHash(): BytesLike {
    return solidityPackedKeccak256(
      ["bytes32[]"],
      [this.state.contractInteractions.map(ci => 
        solidityPackedKeccak256(
          ["bytes32", "address", "bytes32", "bytes", "uint256"],
          [ci.txHash, ci.contract, ci.method, ci.params, ci.timestamp]
        )
      )]
    );
  }


  private getQueryResultsHash(): BytesLike {
    return solidityPackedKeccak256(
      ["bytes32[]"],
      [this.state.queryResults.map(qr => 
        solidityPackedKeccak256(
          ["string", "uint256", "string", "string", "uint256"],
          [qr.intent, qr.confidence, qr.entities, qr.data, qr.timestamp]
        )
      )]
    );
  }
}
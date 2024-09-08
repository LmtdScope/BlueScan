import type { NextApiRequest, NextApiResponse } from 'next';
import natural from 'natural';
import axios from 'axios';

const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY;
const BASESCAN_API_URL = 'https://api.basescan.org/api';

class BlockExplorerNLP {
  private tokenizer: natural.WordTokenizer;
  private stemmer: typeof natural.PorterStemmer;
  private classifier: natural.BayesClassifier;
  private tfidf: natural.TfIdf;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.classifier = new natural.BayesClassifier();
    this.tfidf = new natural.TfIdf();

    this.trainClassifier();
  }

  private trainClassifier() {
    // Expanded list of intents
    this.classifier.addDocument('Show me the latest transactions', 'latest_transactions');
    this.classifier.addDocument('What is the balance of this address', 'account_balance');
    this.classifier.addDocument('Give me information about this block', 'block_info');
    this.classifier.addDocument('Show token transfers for this account', 'token_transfers');
    this.classifier.addDocument('What is the current gas price', 'gas_price');
    this.classifier.addDocument('Show me the top holders of this token', 'token_holders');
    this.classifier.addDocument('What is the total supply of this token', 'token_supply');
    this.classifier.addDocument('Show me the transaction history for this address', 'transaction_history');
    this.classifier.addDocument('Get the balance of multiple addresses', 'multi_account_balance');
    this.classifier.addDocument('Show me the internal transactions for this address', 'internal_transactions');
    this.classifier.addDocument('Get the internal transactions for this transaction hash', 'internal_transactions_by_hash');
    this.classifier.addDocument('Show me the ERC20 token transfers for this address', 'erc20_token_transfers');
    this.classifier.addDocument('Get the ERC721 token transfers for this address', 'erc721_token_transfers');
    this.classifier.addDocument('Show me the ERC1155 token transfers for this address', 'erc1155_token_transfers');
    this.classifier.addDocument('What was the balance of this address at this block number', 'historical_balance');
    this.classifier.addDocument('Get the ABI for this contract', 'contract_abi');
    this.classifier.addDocument('Show me the contract ABI', 'contract_abi');
    this.classifier.addDocument('Fetch the Application Binary Interface for this smart contract', 'contract_abi');
    this.classifier.addDocument('Get event logs for this address', 'event_logs_by_address');
    this.classifier.addDocument('Fetch event logs filtered by topics', 'event_logs_by_topics');
    this.classifier.addDocument('Get event logs for this address filtered by topics', 'event_logs_by_address_and_topics');
    this.classifier.addDocument('Check the contract execution status of this transaction', 'contract_execution_status');
    this.classifier.addDocument('Get the transaction receipt status for this hash', 'transaction_receipt_status');
    this.classifier.addDocument('Show me a chart of token transfers', 'visualize_token_transfers');
    this.classifier.addDocument('Visualize account balance over time', 'visualize_account_balance_history');
    this.classifier.addDocument('Create a graph of transaction volume', 'visualize_transaction_volume');
    this.classifier.train();
  }

  public async processQuery(query: string, context?: string): Promise<{ intent: string; entities: any; confidence: number; data: any }> {
    const tokens = this.tokenizer.tokenize(query);
    const stemmedTokens = tokens.map(token => this.stemmer.stem(token));
    
    this.tfidf.addDocument(stemmedTokens);
    const intent = this.classifier.classify(query);
    let confidence = this.classifier.getClassifications(query)[0].value;

    const entities = this.extractEntities(tokens);

    if (context && context === intent) {
      confidence *= 1.2;
    }

    const data = await this.fetchDataFromBaseScan(intent, entities);

    return { intent, entities, confidence, data };
  }

  private extractEntities(tokens: string[]): any {
    const entities: any = {
      addresses: [],
      transactionHashes: [],
      blockNumbers: [],
      tokenSymbols: [],
      contractAddresses: [],
      timeRange: null
    };

    tokens.forEach(token => {
      if (this.isAddress(token)) {
        entities.addresses.push(token);
      } else if (this.isTransactionHash(token)) {
        entities.transactionHashes.push(token);
      } else if (this.isBlockNumber(token)) {
        entities.blockNumbers.push(parseInt(token));
      } else if (this.isTokenSymbol(token)) {
        entities.tokenSymbols.push(token.toUpperCase());
      } else if (this.isAddress(token)) {
        entities.contractAddresses.push(token);
      } else if (this.isTimeRange(token)) {
        entities.timeRange = token;
      }
    });

    return entities;
  }


  private isAddress(token: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(token);
  }

  private isTransactionHash(token: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(token);
  }

  private isBlockNumber(token: string): boolean {
    return /^\d+$/.test(token);
  }

  private isTokenSymbol(token: string): boolean {
    return /^[A-Za-z]{2,6}$/.test(token);
  }

  private isTimeRange(token: string): boolean {
    // Implement logic to identify time range tokens
    // For example: "last 7 days", "past month", etc.
    return false; // Placeholder
  }

  private async fetchDataFromBaseScan(intent: string, entities: any): Promise<any> {
    try {
      switch (intent) {
        case 'account_balance':
          if (entities.addresses.length > 0) {
            return await this.getAccountBalance(entities.addresses[0]);
          }
          break;
        case 'multi_account_balance':
          if (entities.addresses.length > 1) {
            return await this.getMultiAccountBalance(entities.addresses);
          }
          break;
        case 'transaction_history':
          if (entities.addresses.length > 0) {
            return await this.getTransactionHistory(entities.addresses[0]);
          }
          break;
        case 'internal_transactions':
          if (entities.addresses.length > 0) {
            return await this.getInternalTransactions(entities.addresses[0]);
          }
          break;
        case 'internal_transactions_by_hash':
          if (entities.transactionHashes.length > 0) {
            return await this.getInternalTransactionsByHash(entities.transactionHashes[0]);
          }
          break;
        case 'erc20_token_transfers':
          if (entities.addresses.length > 0) {
            return await this.getERC20TokenTransfers(entities.addresses[0], entities.contractAddresses[0]);
          }
          break;
        case 'erc721_token_transfers':
          if (entities.addresses.length > 0) {
            return await this.getERC721TokenTransfers(entities.addresses[0], entities.contractAddresses[0]);
          }
          break;
        case 'erc1155_token_transfers':
          if (entities.addresses.length > 0) {
            return await this.getERC1155TokenTransfers(entities.addresses[0], entities.contractAddresses[0]);
          }
          break;
        case 'historical_balance':
          if (entities.addresses.length > 0 && entities.blockNumbers.length > 0) {
            return await this.getHistoricalBalance(entities.addresses[0], entities.blockNumbers[0]);
          }
          break;
        case 'contract_abi':
          if (entities.addresses.length > 0) {
            return await this.getContractABI(entities.addresses[0]);
          }
          break;
        case 'event_logs_by_address':
          if (entities.addresses.length > 0) {
            return await this.getEventLogsByAddress(
              entities.addresses[0],
              entities.fromBlock,
              entities.toBlock
            );
          }
          break;
        case 'event_logs_by_topics':
          if (entities.topics && entities.topics.length > 0) {
            return await this.getEventLogsByTopics(
              entities.topics,
              entities.fromBlock,
              entities.toBlock
            );
          }
          break;
        case 'event_logs_by_address_and_topics':
          if (entities.addresses.length > 0 && entities.topics && entities.topics.length > 0) {
            return await this.getEventLogsByAddressAndTopics(
              entities.addresses[0],
              entities.topics,
              entities.fromBlock,
              entities.toBlock
            );
          }
          break;
        case 'contract_execution_status':
          if (entities.transactionHashes.length > 0) {
            return await this.getContractExecutionStatus(entities.transactionHashes[0]);
          }
          break;
        case 'transaction_receipt_status':
          if (entities.transactionHashes.length > 0) {
            return await this.getTransactionReceiptStatus(entities.transactionHashes[0]);
          }
          break;
          case 'visualize_token_transfers':
            return await this.getTokenTransfersForVisualization(entities.addresses[0], entities.timeRange);
          case 'visualize_account_balance_history':
            return await this.getAccountBalanceHistoryForVisualization(entities.addresses[0], entities.timeRange);
          case 'visualize_transaction_volume':
            return await this.getTransactionVolumeForVisualization(entities.timeRange);
          default:
          return null;
      }
    } catch (error) {
      console.error('Error fetching data from BaseScan:', error);
      return null;
    }
  }


  

  private async getEventLogsByAddress(address: string, fromBlock?: number, toBlock?: number): Promise<any> {
    const params: any = {
      module: 'logs',
      action: 'getLogs',
      address: address,
      apikey: BASESCAN_API_KEY
    };
    if (fromBlock) params.fromBlock = fromBlock;
    if (toBlock) params.toBlock = toBlock;

    const response = await axios.get(`${BASESCAN_API_URL}`, { params });
    return response.data.result;
  }

  private async getEventLogsByTopics(topics: string[], fromBlock?: number, toBlock?: number): Promise<any> {
    const params: any = {
      module: 'logs',
      action: 'getLogs',
      apikey: BASESCAN_API_KEY
    };
    if (fromBlock) params.fromBlock = fromBlock;
    if (toBlock) params.toBlock = toBlock;

    topics.forEach((topic, index) => {
      params[`topic${index}`] = topic;
      if (index > 0) {
        params[`topic${index-1}_${index}_opr`] = 'and'; // Default to 'and' operator
      }
    });

    const response = await axios.get(`${BASESCAN_API_URL}`, { params });
    return response.data.result;
  }

  private async getEventLogsByAddressAndTopics(address: string, topics: string[], fromBlock?: number, toBlock?: number): Promise<any> {
    const params: any = {
      module: 'logs',
      action: 'getLogs',
      address: address,
      apikey: BASESCAN_API_KEY
    };
    if (fromBlock) params.fromBlock = fromBlock;
    if (toBlock) params.toBlock = toBlock;

    topics.forEach((topic, index) => {
      params[`topic${index}`] = topic;
      if (index > 0) {
        params[`topic${index-1}_${index}_opr`] = 'and'; // Default to 'and' operator
      }
    });

    const response = await axios.get(`${BASESCAN_API_URL}`, { params });
    return response.data.result;
  }

    private async getContractABI(address: string): Promise<any> {
        const response = await axios.get(`${BASESCAN_API_URL}`, {
          params: {
            module: 'contract',
            action: 'getabi',
            address: address,
            apikey: BASESCAN_API_KEY
          }
        });
        
        if (response.data.status === '1') {
          return JSON.parse(response.data.result);
        } else {
          throw new Error(response.data.result);
        }
      }


  private async getAccountBalance(address: string): Promise<any> {
    const response = await axios.get(`${BASESCAN_API_URL}`, {
      params: {
        module: 'account',
        action: 'balance',
        address: address,
        tag: 'latest',
        apikey: BASESCAN_API_KEY
      }
    });
    return response.data.result;
  }

  private async getMultiAccountBalance(addresses: string[]): Promise<any> {
    const response = await axios.get(`${BASESCAN_API_URL}`, {
      params: {
        module: 'account',
        action: 'balancemulti',
        address: addresses.join(','),
        tag: 'latest',
        apikey: BASESCAN_API_KEY
      }
    });
    return response.data.result;
  }

  private async getTransactionHistory(address: string): Promise<any> {
    const response = await axios.get(`${BASESCAN_API_URL}`, {
      params: {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 10,
        sort: 'desc',
        apikey: BASESCAN_API_KEY
      }
    });
    return response.data.result;
  }

  private async getInternalTransactions(address: string): Promise<any> {
    const response = await axios.get(`${BASESCAN_API_URL}`, {
      params: {
        module: 'account',
        action: 'txlistinternal',
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 10,
        sort: 'desc',
        apikey: BASESCAN_API_KEY
      }
    });
    return response.data.result;
  }

  private async getInternalTransactionsByHash(txhash: string): Promise<any> {
    const response = await axios.get(`${BASESCAN_API_URL}`, {
      params: {
        module: 'account',
        action: 'txlistinternal',
        txhash: txhash,
        apikey: BASESCAN_API_KEY
      }
    });
    return response.data.result;
  }

  private async getERC20TokenTransfers(address: string, contractaddress?: string): Promise<any> {
    const params: any = {
      module: 'account',
      action: 'tokentx',
      address: address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      offset: 100,
      sort: 'desc',
      apikey: BASESCAN_API_KEY
    };
    if (contractaddress) {
      params.contractaddress = contractaddress;
    }
    const response = await axios.get(`${BASESCAN_API_URL}`, { params });
    return response.data.result;
  }

  private async getERC721TokenTransfers(address: string, contractaddress?: string): Promise<any> {
    const params: any = {
      module: 'account',
      action: 'tokennfttx',
      address: address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      offset: 100,
      sort: 'desc',
      apikey: BASESCAN_API_KEY
    };
    if (contractaddress) {
      params.contractaddress = contractaddress;
    }
    const response = await axios.get(`${BASESCAN_API_URL}`, { params });
    return response.data.result;
  }

  private async getERC1155TokenTransfers(address: string, contractaddress?: string): Promise<any> {
    const params: any = {
      module: 'account',
      action: 'token1155tx',
      address: address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      offset: 100,
      sort: 'desc',
      apikey: BASESCAN_API_KEY
    };
    if (contractaddress) {
      params.contractaddress = contractaddress;
    }
    const response = await axios.get(`${BASESCAN_API_URL}`, { params });
    return response.data.result;
  }

  private async getHistoricalBalance(address: string, blockNo: number): Promise<any> {
    const response = await axios.get(`${BASESCAN_API_URL}`, {
      params: {
        module: 'account',
        action: 'balancehistory',
        address: address,
        blockno: blockNo,
        apikey: BASESCAN_API_KEY
      }
    });
    return response.data.result;
  }
  private async getContractExecutionStatus(txhash: string): Promise<any> {
    const response = await axios.get(`${BASESCAN_API_URL}`, {
      params: {
        module: 'transaction',
        action: 'getstatus',
        txhash: txhash,
        apikey: BASESCAN_API_KEY
      }
    });
    return response.data.result;
  }

  private async getTransactionReceiptStatus(txhash: string): Promise<any> {
    const response = await axios.get(`${BASESCAN_API_URL}`, {
      params: {
        module: 'transaction',
        action: 'gettxreceiptstatus',
        txhash: txhash,
        apikey: BASESCAN_API_KEY
      }
    });
    return response.data.result;
  }



  private async getTokenTransfersForVisualization(address: string, timeRange: string): Promise<any> {
    // Implement BaseScan API call and data processing for token transfers
    // This is a placeholder implementation
    const response = await axios.get(`${BASESCAN_API_URL}`, {
      params: {
        module: 'account',
        action: 'tokentx',
        address: address,
        startblock: 0,
        endblock: 99999999,
        sort: 'asc',
        apikey: BASESCAN_API_KEY
      }
    });
    // Process the data for visualization
    return response.data.result;
  }

  private async getAccountBalanceHistoryForVisualization(address: string, timeRange: string): Promise<any> {
    // Implement BaseScan API call and data processing for account balance history
    // This is a placeholder implementation
    const response = await axios.get(`${BASESCAN_API_URL}`, {
      params: {
        module: 'account',
        action: 'balancehistory',
        address: address,
        blockno: 'latest',
        apikey: BASESCAN_API_KEY
      }
    });
    // Process the data for visualization
    return response.data.result;
  }

  private async getTransactionVolumeForVisualization(timeRange: string): Promise<any> {
    // Implement BaseScan API call and data processing for transaction volume
    // This is a placeholder implementation
    const response = await axios.get(`${BASESCAN_API_URL}`, {
      params: {
        module: 'stats',
        action: 'dailytx',
        startdate: '2023-01-01',
        enddate: '2023-12-31',
        sort: 'asc',
        apikey: BASESCAN_API_KEY
      }
    });
    // Process the data for visualization
}
}


const nlpProcessor = new BlockExplorerNLP();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("HERE!!")
  console.log("HERE!!")
  console.log("HERE!!")
  console.log("HERE!!")
  console.log("HERE!!")
  if (req.method === 'POST') {
    const { query, context } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    try {
      const nlpProcessor = new BlockExplorerNLP();
      const result = await nlpProcessor.processQuery(query, context);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error processing query:', error);
      res.status(500).json({ error: 'An error occurred while processing the query' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method Not Allowed', detail: `HTTP method ${req.method} is not allowed` });
  }
}

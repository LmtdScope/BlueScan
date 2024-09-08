I could not complete the project on time, but below are a list of the required dependencies and how one would use the project if it were functional.

# AI Blockchain Explorer for Base

This project is an AI-powered Blockchain Explorer for the Base blockchain. It provides a natural language interface for users to query blockchain data, visualize results, and store query outcomes on-chain.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or later)
- npm (v6 or later)
- Git

This project uses several key libraries and SDKs:

- Stackr SDK: for blockchain interactions and state management
- natural: for natural language processing
- recharts: for data visualization
- axios: for making HTTP requests

You will also need:

- A Basescan API key
- A Privy API key (for authentication)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/LmtdScope/BlueScan
   cd hackerpack
   ```

2. Install dependencies:

   ```
   npm install natural

   npm install recharts

   npm install axios
   ```

   This will install all required dependencies, including Stackr SDK, natural, recharts, and axios.

3. Initialize the project by running the setup script
   cd hackerpack
   ./setup.sh

## Configuration

1. Create a `.env` file in the root directory of the project.

2. Add the following environment variables to the `.env` file:

   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   BASESCAN_API_KEY=your_basescan_api_key_here
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
   ```

   Replace `your_basescan_api_key_here` and `your_privy_app_id_here` with your actual API keys.

## Running the Development Server

1. Start the development server:

   ```
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage

1. Connect your wallet using the "Connect Wallet" button.
2. Enter your blockchain-related query in the input field.
3. Click "Process Query" to get results.
4. View the interpreted intent, confidence, and retrieved data.
5. If desired, click "Publish Results to Blockchain" to store the query results on-chain.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

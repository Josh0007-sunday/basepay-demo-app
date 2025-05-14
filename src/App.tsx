import { useEffect, useState } from "react";
import { WEB3AUTH_NETWORK } from "@web3auth/base";
import { Web3AuthProvider, useWeb3Auth } from "@web3auth/modal-react-hooks";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import type { Web3AuthOptions } from "@web3auth/modal";
import ConnectWeb3AuthButton from "./component/ConnectWeb3AuthButton";
import DisconnectWeb3AuthButton from "./component/DisconnectWeb3AuthButton";
import UserProfile from "./component/UserProfile";
import AccountDetails from "./component/AccountDetails";
import BasePayInvoice from "./component/BasePayInvoice";
import { baseSepoliaChainConfig, web3AuthClientId } from "./web3auth/config";

// Web3Auth configuration
const web3AuthConfig = {
  web3AuthOptions: {
    clientId: web3AuthClientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    privateKeyProvider: new EthereumPrivateKeyProvider({
      config: { chainConfig: baseSepoliaChainConfig },
    }),
    uiConfig: {
      appName: "BasePay Demo App",
      mode: "light" as const,
      defaultLanguage: "en",
      theme: {
        primary: "#0364ff",
      },
    },
  } as Web3AuthOptions,
};

// Main App Component
function AppContent() {
  const { web3Auth, isInitialized, isConnected } = useWeb3Auth();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      if (!isInitialized && web3Auth) {
        try {
          setIsInitializing(true);
          setInitError("");
          await web3Auth.initModal();
          console.log("Web3Auth initialized successfully");
        } catch (error) {
          console.error("Failed to initialize Web3Auth:", error);
          setInitError(error instanceof Error ? error.message : "Unknown error");
        } finally {
          setIsInitializing(false);
        }
      }
    };

    init();
  }, [isInitialized, web3Auth]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Web3Auth...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg">
          <h2 className="text-red-600 text-lg font-semibold mb-2">Initialization Error</h2>
          <p className="text-gray-700 mb-4">{initError}</p>
          <details className="text-sm">
            <summary className="cursor-pointer text-blue-600 hover:underline">Debug Information</summary>
            <pre className="mt-2 bg-gray-100 p-3 rounded overflow-x-auto text-xs">{JSON.stringify({
              clientId: web3Auth?.options.clientId,
              network: web3Auth?.options.web3AuthNetwork
            }, null, 2)}</pre>
          </details>
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Troubleshooting tips:</p>
            <ul className="text-sm text-gray-600 list-disc pl-5">
              <li>Verify your client ID is correct</li>
              <li>Check if the network matches your Web3Auth dashboard</li>
              <li>Ensure your domain is whitelisted in Web3Auth dashboard</li>
              <li>Try different networks: MAINNET, TESTNET, or SAPPHIRE_DEVNET</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">BasePay Demo App</h1>
        <div className="flex space-x-4">
          <ConnectWeb3AuthButton />
          <DisconnectWeb3AuthButton />
        </div>
      </header>
      <main className="w-full max-w-4xl">
        {isConnected ? (
          <div className="space-y-8">
            <AccountDetails>
              <UserProfile />
            </AccountDetails>
            <BasePayInvoice />
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-semibold mb-4">Welcome to Web3Auth</h2>
            <p className="text-gray-600 mb-6">Connect your wallet to get started</p>
            <ConnectWeb3AuthButton />
          </div>
        )}
      </main>
    </div>
  );
}

// Wrapper component with Web3AuthProvider
const App = () => {
  return (
    <Web3AuthProvider config={web3AuthConfig}>
      <AppContent />
    </Web3AuthProvider>
  );
};

export default App;

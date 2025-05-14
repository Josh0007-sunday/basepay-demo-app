import type { CustomChainConfig } from "@web3auth/base";
import { CHAIN_NAMESPACES } from "@web3auth/base";

export const baseSepoliaChainConfig: CustomChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x14A34",
  rpcTarget: "https://sepolia.base.org",
  displayName: "Base Sepolia",
  blockExplorerUrl: "https://sepolia-explorer.base.org",
  ticker: "ETH",
  tickerName: "ETH",
  logo: "https://web3auth.io/images/web3authlog.png",
};

// Use your actual client ID from environment variable or hardcode for testing
export const web3AuthClientId = "BGZnoRxvK8EBv7WlVQo9590ExdTugBrT239q2uanHIxo8_FUJ3Q1sQ8GkWsECOU9CrHLsReipaNhAoteikkqZBo";

export const chainList: Record<string, CustomChainConfig> = {
  baseSepolia: baseSepoliaChainConfig,
};
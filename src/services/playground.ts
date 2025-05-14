import { useWeb3Auth } from "@web3auth/modal-react-hooks";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import type { CustomChainConfig } from "@web3auth/base";
import { chainList, baseSepoliaChainConfig } from "../web3auth/config";

export const usePlayground = () => {
  const { provider, isConnected, web3Auth } = useWeb3Auth();
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [connectedChain, setConnectedChain] = useState<CustomChainConfig>(baseSepoliaChainConfig);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chainListOptionSelected, setChainListOptionSelected] = useState<string>("baseSepolia");

  const getProvider = (): ethers.BrowserProvider | null => {
    if (!provider) return null;
    return new ethers.BrowserProvider(provider);
  };

  const getAddress = async () => {
    const ethersProvider = getProvider();
    if (ethersProvider) {
      const signer = await ethersProvider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
    }
  };

  const getBalance = async () => {
    const ethersProvider = getProvider();
    if (ethersProvider && address) {
      const bal = await ethersProvider.getBalance(address);
      setBalance(ethers.formatEther(bal));
    }
  };

  const getUserInfo = async () => {
    if (web3Auth) {
      const user = await web3Auth.getUserInfo();
      console.log("User Info:", user);
    }
  };

  const getChainId = async (): Promise<string | null> => {
    const ethersProvider = getProvider();
    if (ethersProvider) {
      const network = await ethersProvider.getNetwork();
      return `0x${network.chainId.toString(16)}`;
    }
    return null;
  };

  const switchChain = async (chainConfig: CustomChainConfig) => {
    setIsLoading(true);
    try {
      if (web3Auth && provider) {
        await web3Auth.addChain(chainConfig);
        await web3Auth.switchChain({ chainId: chainConfig.chainId });
        setConnectedChain(chainConfig);
        await getAddress();
        await getBalance();
      }
    } catch (error) {
      console.error("Error switching chain:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConnectedChain = (chainKey: string) => {
    setChainListOptionSelected(chainKey);
    setConnectedChain(chainList[chainKey]);
  };

  useEffect(() => {
    if (isConnected && provider) {
      getAddress();
      getBalance();
    } else {
      setAddress("");
      setBalance("0");
    }
  }, [isConnected, provider, address]);

  return {
    address,
    balance,
    getUserInfo,
    updateConnectedChain,
    connectedChain,
    isLoading,
    chainList,
    switchChain,
    getChainId,
    chainListOptionSelected,
  };
};
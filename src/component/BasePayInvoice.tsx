import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BasePay } from 'basepaysdk-core';
import { useWeb3Auth } from '@web3auth/modal-react-hooks';

interface InvoiceState {
  ethBalance: string;
  merchantBalance: string;
  userUsdcBalance: string;
  invoiceStatus: string;
  invoiceHash: string;
  txHash: string;
  error: string;
  loading: boolean;
}

const BasePayInvoice: React.FC = () => {
  const { web3Auth, provider, isConnected } = useWeb3Auth();
  const [state, setState] = useState<InvoiceState>({
    ethBalance: '',
    merchantBalance: '',
    userUsdcBalance: '',
    invoiceStatus: '',
    invoiceHash: '',
    txHash: '',
    error: '',
    loading: false,
  });

  const MERCHANT_ADDRESS = '0xd38808a2BB9163822aaCeAc2e704b86Aa4F00228';
  const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
  const INVOICE_TRACKER_ADDRESS = '0xB8685deAB3a075EC495A4848321567F4224611c9';
  const INVOICE_AMOUNT = '8';

  const updateState = (newState: Partial<InvoiceState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  const initializeWallet = async () => {
    if (!provider || !web3Auth) return;
    
    try {
      updateState({ loading: true });
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();

      const balance = await ethersProvider.getBalance(address);
      updateState({ ethBalance: ethers.formatEther(balance) });

      // Get USDC balance for user
      const usdc = new ethers.Contract(
        USDC_ADDRESS,
        ['function balanceOf(address) view returns (uint256)'],
        ethersProvider
      );
      const userUsdcBal = await usdc.balanceOf(address);
      updateState({ userUsdcBalance: ethers.formatUnits(userUsdcBal, 6) });

      // Get merchant USDC balance
      const merchantBal = await usdc.balanceOf(MERCHANT_ADDRESS);
      updateState({ merchantBalance: ethers.formatUnits(merchantBal, 6) });

      updateState({ loading: false });
    } catch (err) {
      updateState({ error: (err as Error).message, loading: false });
    }
  };

  const handleCreateAndPayInvoice = async () => {
    if (!provider || !web3Auth) {
      updateState({ error: 'Please connect your wallet first' });
      return;
    }

    try {
      updateState({ loading: true, error: '' });
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const basePay = new BasePay('base-sepolia');

      // Create invoice
      const result = await basePay.createInvoice(
        {
          token: 'USDC',
          amount: INVOICE_AMOUNT,
          memo: 'Test invoice',
          merchant: MERCHANT_ADDRESS,
        },
        signer as any
      );

      updateState({
        invoiceHash: result.invoiceHash,
        txHash: result.txHash,
        invoiceStatus: 'Invoice created',
      });

      // Approve USDC
      const usdcContract = new ethers.Contract(
        USDC_ADDRESS,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        signer
      );
      const approveAmount = ethers.parseUnits(INVOICE_AMOUNT, 6);
      const approveTx = await usdcContract.approve(INVOICE_TRACKER_ADDRESS, approveAmount);
      await approveTx.wait();

      // Pay invoice
      const payTx = await basePay.payInvoice(result.invoiceHash, signer as any);
      await payTx.wait();

      // Verify payment
      const tracker = await basePay.getContract(signer as any);
      const invoice = await tracker.invoices(result.invoiceHash);
      updateState({ invoiceStatus: invoice.isPaid ? 'Paid' : 'Unpaid' });

      // Update merchant balance
      const usdc = new ethers.Contract(
        USDC_ADDRESS,
        ['function balanceOf(address) view returns (uint256)'],
        ethersProvider
      );
      const finalMerchantBal = await usdc.balanceOf(MERCHANT_ADDRESS);
      updateState({ merchantBalance: ethers.formatUnits(finalMerchantBal, 6) });

      updateState({ loading: false });
    } catch (err) {
      updateState({ error: (err as Error).message, loading: false });
    }
  };

  useEffect(() => {
    if (provider && web3Auth && isConnected) {
      initializeWallet();
    }
  }, [provider, web3Auth, isConnected]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[200px] bg-gray-50 rounded-lg shadow-sm p-6">
        <p className="text-gray-600 text-lg">Please connect your wallet first</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">INVOICE</h2>
              <p className="text-blue-100 mt-1">BasePay USDC Payment</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                state.invoiceStatus === 'Paid' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {state.invoiceStatus || 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-6 space-y-6">
          {state.loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {state.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              Error: {state.error}
            </div>
          )}

          {/* Wallet Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">From</h3>
              <p className="text-gray-900 font-medium">Your Wallet</p>
              <div className="space-y-1">
                <p className="text-gray-600 text-sm">ETH Balance: {state.ethBalance} ETH</p>
                <p className="text-gray-600 text-sm">USDC Balance: {state.userUsdcBalance} USDC</p>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">To</h3>
              <p className="text-gray-900 font-medium">Merchant</p>
              <p className="text-gray-600 text-sm">USDC Balance: {state.merchantBalance} USDC</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-500 mb-2">
                <div>Description</div>
                <div className="text-right">Amount</div>
                <div className="text-right">Currency</div>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-t border-gray-200">
                <div className="text-gray-900">USDC Payment</div>
                <div className="text-right text-gray-900">{INVOICE_AMOUNT}</div>
                <div className="text-right text-gray-900">USDC</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleCreateAndPayInvoice} 
            disabled={state.loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.loading ? 'Processing...' : `Pay ${INVOICE_AMOUNT} USDC`}
          </button>

          {/* Transaction Details */}
          {state.invoiceHash && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Transaction Details</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 break-all">
                  <span className="font-medium">Invoice Hash:</span> {state.invoiceHash}
                </p>
                <p className="text-gray-600 break-all">
                  <span className="font-medium">Transaction Hash:</span> {state.txHash}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasePayInvoice; 
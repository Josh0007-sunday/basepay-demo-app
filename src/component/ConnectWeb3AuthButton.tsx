import { useWeb3Auth } from '@web3auth/modal-react-hooks';

const ConnectWeb3AuthButton = () => {
  const { connect, isConnected } = useWeb3Auth();

  if (isConnected) return null;

  return (
    <button
      className="flex flex-row rounded-full px-6 py-3 text-white justify-center items-center cursor-pointer"
      style={{ backgroundColor: '#0364ff' }}
      onClick={connect}
    >
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQacxje9Z-NILjsDO-nZVu_hUvDKIM48QVRAA&s"
        alt="Web3Auth Logo"
        className="headerLogo w-6 h-6 mr-2"
      />
      Connect to Web3Auth
    </button>
  );
};

export default ConnectWeb3AuthButton;
import { useWeb3Auth } from "@web3auth/modal-react-hooks";

const DisconnectWeb3AuthButton = () => {
  const { isConnected, logout } = useWeb3Auth();

  if (!isConnected) return null;

  const handleLogout = async () => {
    await logout({ cleanup: true });
  };

  return (
    <div
      className="flex flex-row rounded-full px-6 py-3 text-white justify-center items-center cursor-pointer"
      style={{ backgroundColor: "#0364ff" }}
      onClick={handleLogout}
    >
      <img
        src="https://web3auth.io/images/web3authlog.png"
        alt="Web3Auth Logo"
        className="headerLogo w-6 h-6 mr-2"
      />
      Disconnect
    </div>
  );
};

export default DisconnectWeb3AuthButton;
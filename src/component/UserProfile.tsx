import { useWeb3Auth } from "@web3auth/modal-react-hooks";

const UserProfile = () => {
  const { userInfo, isConnected } = useWeb3Auth();

  if (!isConnected || !userInfo) return null;

  try {
    return (
      <div className="sticky px-4 inset-x-0 bottom-0 border-t border-gray-100">
        <div className="flex items-center justify-start py-4 shrink-0 overflow-hidden">
          {userInfo.profileImage ? (
            <img
              className="object-fill w-10 h-10 rounded-full"
              src={userInfo.profileImage}
              alt="User Profile"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex justify-center items-center bg-purple-100 font-bold w-10 h-10 rounded-full text-[28px] text-purple-800">
              {userInfo.name?.charAt(0).toUpperCase() || "?"}
            </span>
          )}
          <div className="ml-1.5 overflow-hidden">
            <strong className="text-xs block font-medium truncate">{userInfo.name || "Unknown User"}</strong>
          </div>
        </div>
      </div>
    );
  } catch (e) {
    console.error("Error rendering user profile:", e);
    return null;
  }
};

export default UserProfile;
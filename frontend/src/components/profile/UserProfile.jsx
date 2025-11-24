import useUser from "../../zustand/user.store";
import { Heading } from "../index";
import { CgProfile } from "react-icons/cg";
const UserProfile = () => {
  const { user } = useUser();
  return (
    <header className="w-full flex items-end h-40 relative bg-slate-800 p-4">
      {/* user name */}
      <Heading title={user ? `${user.username}` : "User Name"} />
      {/* user profile icon  */}
      <div className="absolute w-30 h-30 bottom-0 translate-y-3/10 right-20 bg-base-200 rounded-full">
        {user?.avatar ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-full h-full object-cover rounded-full border-4 border-base-100"
          />
        ) : (
          <CgProfile className="w-full h-full p-2 text-gray-400 rounded-full border-4 border-base-100" />
        )}
      </div>
    </header>
  );
};

export default UserProfile;

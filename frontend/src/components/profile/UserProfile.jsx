import { logoutUser } from "../../api/user.api";
import { ShowToast } from "../../utils/ShowToast";
import useUser from "../../zustand/user.store";
import { Heading } from "../index";
import { CgProfile } from "react-icons/cg";
import { VscSignOut } from "react-icons/vsc";

const UserProfile = () => {
  const { user, setUser } = useUser();

  const handleLogout = async () => {
    const res = await logoutUser();
    if (res.status >= 400 && res.error) {
      ShowToast(res.error, {
        type: "error",
      });
    }
    setUser(null);
    useUser.persist.clearStorage();
    ShowToast(res.data?.message, {
      type: "success",
    });
  };

  return (
    <header className="w-full flex items-end h-40 relative bg-slate-800 p-4">
      {/* user name */}
      <div className="flex items-baseline justify-between gap-4">
        <Heading title={user ? `${user.username}` : "User Name"} />
        <div className="dropdown">
          <VscSignOut
            tabIndex={0}
            className="w-4 h-4 xl:w-8 xl:h-8 cursor-pointer"
          />
          <ul
            tabIndex="-1"
            className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
          >
            <li onClick={handleLogout} className="cursor-pointer">
              signout
            </li>
          </ul>
        </div>
      </div>

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

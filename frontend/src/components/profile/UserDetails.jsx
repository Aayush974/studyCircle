import { getCurrentUser, sendVerificationEmail } from "../../api/user.api";
import { ShowToast } from "../../utils/ShowToast";
import useUser from "../../zustand/user.store";
import { useEffect, useState } from "react";

const UserDetails = () => {
  const { user, setUser } = useUser();
  const [isSendingMail, setIsSendingMail] = useState(false);

  const verifyEmail = async () => {
    setIsSendingMail(true);
    const res = await sendVerificationEmail();
    setIsSendingMail(false);
    console.log(res);
    if (res.status >= 400 && res.error) {
      ShowToast(res.error?.message, { type: "error" });
      return;
    }
    ShowToast(res.data?.message, { type: "success" });
  };

  // when user goes out of tab and comes back the user if fetched again in case the verification status changed
  useEffect(() => {
    const onFocus = async () => {
      const res = await getCurrentUser();
      if (res.status >= 400 && res.error) {
        ShowToast(res.error?.message, { type: "error" });
        return;
      }
      setUser(res.data.user);
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl md:text-2xl lg:text4xl xl:text-5xl font-semibold my-8">
        User Details
      </h2>

      <div className="space-y-1 text-lg md:text-xl lg:text:2xl xl:text-2xl">
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p className="flex items-center gap-4">
          <strong>Email Verified:</strong>{" "}
          <span
            className={`badge ${
              user.isEmailVerified ? "badge-success" : "badge-error"
            } text-base md:text-lg lg:text:xl xl:text-xl`}
          >
            Yes
          </span>
        </p>
      </div>

      {!user?.isEmailVerified && (
        <button
          disabled={isSendingMail}
          onClick={verifyEmail}
          className="px-4 py-2  rounded-md btn btn-primary text-lg md:text-xl lg:text:2xl xl:text-2xl"
        >
          {isSendingMail ? "sending..." : "Send mail"}
        </button>
      )}
    </div>
  );
};

export default UserDetails;

import { useEffect } from "react";
import useUser from "../../zustand/user.store";
import { Outlet, useNavigate } from "react-router-dom";
import SocketInit from "./SocketInit";

const ProtectedRoute = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate("/auth/login", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <>
      <Outlet />
      <SocketInit user={user} />
    </>
  );
};

export default ProtectedRoute;

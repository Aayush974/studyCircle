import { useEffect } from "react";
import useUser from "../../zustand/user.store";
import { Outlet, replace, useNavigate } from "react-router-dom";

const ProtectedRoute = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate("/auth/login",replace);
    }
  });
  return <Outlet />;
};

export default ProtectedRoute;

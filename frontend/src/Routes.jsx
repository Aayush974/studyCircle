import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Login, Signup, Home, Profile, Workspace } from "./pages";
import { ToastContainer } from "react-toastify";
import { ProtectedRoute } from "./components";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} />
      <Route path="auth">
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="profile" element={<Profile />} />
        <Route path="/workspace/:workspaceId" element={<Workspace />} />
      </Route>
    </>
  )
);

const Routes = function () {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
};

export default Routes;

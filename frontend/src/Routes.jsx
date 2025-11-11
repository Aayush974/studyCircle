import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Login, Signup, Home } from "./pages";
import { ToastContainer } from "react-toastify";
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />}>
        <Route path="auth/signup" element={<Signup />}></Route>
        <Route path="auth/login" element={<Login />}></Route>
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

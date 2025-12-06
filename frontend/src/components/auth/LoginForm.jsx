import { useForm } from "react-hook-form";
import { Input } from "../index";
import { loginUser } from "../../api/user.api";
import { ShowToast } from "../../utils/ShowToast";
import { useNavigate } from "react-router-dom";
import useUser from "../../zustand/user.store";
import useSocket from "../../zustand/socket.store";

const LoginForm = function () {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { setUser, user } = useUser();
  const { setSocket } = useSocket();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const res = await loginUser(data);

    if (res.status > 400 && res.error) {
      // if error occured
      ShowToast(res.error?.message, {
        type: "error",
      });
      return;
    }

    setUser(res.data?.user);
    setSocket(res.data?.user);
    ShowToast(res.data?.message, {
      type: "success",
      onClose: () => {
        navigate("/profile");
      },
    });
  };

  return (
    <>
      <div className="sm:w-100 rounded-md p-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col justify-between items-center gap-4 "
        >
          {/* email field */}
          <div className="w-full flex flex-col justify-evenly gap-1">
            <label htmlFor="email">email</label>
            <Input
              id="email"
              {...register("email", {
                required: true,
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "not a valid email",
                },
              })}
              type={"input"}
              className={"input"}
              placeholder={"please enter your email"}
            />
            {errors.email && (
              <p className="text-error">{errors.email.message}</p>
            )}
          </div>

          {/* password field */}
          <div className="w-full flex flex-col justify-evenly gap-1">
            <label htmlFor="password">password</label>
            <Input
              id="password"
              {...register("password", {
                required: true,
                minLength: { value: 5, message: "must be 5 character long" },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{5,}$/,
                  message:
                    "must have atlease 1 capital, 1 special and 1 number character",
                },
              })}
              type={"password"}
              className={"input"}
              placeholder={"please enter your password"}
            />
            {errors.password && (
              <p className="text-error">{errors.password.message}</p>
            )}
          </div>

          {/* submit button */}
          <div className="w-full flex justify-center items-center mt-8">
            <button className="btn btn-primary">Submit</button>
          </div>

          {/* signup form link */}
          <i
            onClick={() => {
              navigate("/auth/signup");
            }}
            className="w-full flex justify-start items-center mt-4 text-gray-400 opacity-70 hover:text-gray-300 hover:opacity-100 transition-all cursor-pointer"
          >
            Don't have an account? Signup
          </i>
        </form>
      </div>
    </>
  );
};

export default LoginForm;

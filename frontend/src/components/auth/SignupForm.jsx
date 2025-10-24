import { useForm } from "react-hook-form";
import { Input } from "../index";
import { useState } from "react";
import { registerUser } from "../../api/user.api";
import { useNavigate } from "react-router-dom";
const SignUpForm = function () {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [preview, setPreview] = useState(null); // handles the preview of the image file

  const onSubmit = async (data) => {
    data.avatar = data.avatar?.[0]; // we require only one file for the api call

    const res = await registerUser(data);

    if (res.status > 400 && res.error) {
      // if error occurred
      ShowToast(res.error?.message, {
        type: "error",
      });
      return;
    }

    ShowToast(res.data?.message, {
      type: "success",
      onClose: () => {
        navigate("/auth/login"); // navigate to login upon successful signup
      },
    });
  };

  const handlePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <>
      <div className="sm:w-100 rounded-md p-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col justify-between items-center gap-4 "
        >
          {/* username field */}
          <div className="w-full flex flex-col justify-evenly gap-1">
            <label htmlFor="username">username</label>
            <Input
              id="username"
              {...register("username", {
                required: true,
                minLength: { value: 4, message: "must be 4 character long" },
              })}
              type={"input"}
              className={"input"}
              placeholder={"please enter the username"}
            />
            {/* Show error if validation fails */}
            {errors.username && (
              <p className="text-error">{errors.username.message}</p>
            )}
          </div>

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

          {/* avatar field */}
          <div className="w-full flex flex-col justify-evenly gap-1">
            <label htmlFor="avatar">avatar</label>
            <Input
              {...register("avatar", {
                validate: (files) => {
                  if (files.length == 0)
                    // if the file has not been selected no need to check further just return true
                    return true;
                  if (files.length > 1)
                    // only 1 file allowed
                    return "only 1 file is to be selected";
                  if (!["image/png", "image/jpeg"].includes(files?.[0].type))
                    // only jpeg and png type data allowed
                    return "select only jpeg or png files";
                  if (files?.[0].size > 5 * 1024 * 1024)
                    // data must be below 5 mb
                    return "file size must be below 5mb";
                  return true;
                },
              })}
              type={"file"}
              className={"file-input"}
              onChange={(e) => {
                // register function of RHF returns the the object if it does not already exists and if it exists it returns the old refrence of the object
                register("avatar").onChange(e); // passing the event to the regsitered avatar field's onChange event since calling our own onChange will override RHF's onChange event registered for this field
                handlePreview(e);
              }}
            />
            {/* this holds the preview for the imagge */}
            {preview && (
              <img src={preview} alt="preview" style={{ width: 100 }} />
            )}
            {errors.avatar && (
              <p className="text-error">{errors.avatar.message}</p>
            )}
          </div>

          {/* submit button */}
          <div className="w-full flex justify-center items-center">
            <button className="btn btn-primary">Submit</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SignUpForm;

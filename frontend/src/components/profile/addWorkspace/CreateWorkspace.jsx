import { useForm } from "react-hook-form";
import { Input } from "../../index";
import { useState } from "react";
import { createWorkspace } from "../../../api/workspace.api.js";
import { ShowToast } from "../../../utils/ShowToast.jsx";
import { useNavigate } from "react-router-dom";

const CreateWorkspaceModal = ({ dialogRef }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [passwordRequired, setPasswordRequired] = useState(false);

  const onSubmit = async (data) => {
    data.logo = data.logo?.[0];
    data.passwordRequired = passwordRequired;
    data.password = passwordRequired ? data.password : ""; // if passwordRequired is set to false password field will not register hence set to null
    console.log(data);
    const res = await createWorkspace(data);

    if (res.status > 400 && res.error) {
      // if error occured
      console.log(res.error?.message);
      ShowToast(res.error?.message, {
        type: "error",
      });
      return;
    }
    ShowToast(res.data?.message, {
      type: "success",
      onClose: () => {
        dialogRef.current.close();
      },
    });
  };

  const togglePassword = () => {
    setPasswordRequired((prev) => !prev);
  };

  return (
    <>
      <dialog ref={dialogRef} id="add_workspace_modal" className="modal">
        <div className="modal-box flex flex-col items-center justify-between w-4/10 min-w-90 max-w-5xl gap-4 relative">
          <h2 className="text-center mb-8 text-xl md:text-2xl lg:text4xl xl:text-5xl font-semibold">
            Create Workspace
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col justify-between items-center gap-4 "
          >
            {/* ws name field */}
            <div className="w-full flex flex-col justify-evenly gap-1">
              <label htmlFor="name">name</label>
              <Input
                id="name"
                {...register("name", {
                  required: true,
                  minLength: { value: 4, message: "must be 4 character long" },
                })}
                type={"input"}
                className={"input"}
                placeholder={"please enter the name"}
              />
              {/* Show error if validation fails */}
              {errors.name && (
                <p className="text-error">{errors.name.message}</p>
              )}
            </div>

            {/* logo field */}
            <div className="w-full flex flex-col justify-evenly gap-1">
              <label htmlFor="logo">logo</label>
              <Input
                {...register("logo", {
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
              />
              {errors.logo && (
                <p className="text-error">{errors.logo.message}</p>
              )}
            </div>

            {/*password required*/}
            <div className="w-full flex justify-start gap-4">
              <label
                htmlFor="password"
                className="whitespace-nowrap text-center"
              >
                Require password
              </label>
              <div className="flex justify-start items-center">
                <input
                  onChange={togglePassword}
                  checked={passwordRequired}
                  type="checkbox"
                  className="toggle"
                />
              </div>
            </div>
            {/* password field */}
            {passwordRequired && (
              <div className="w-full flex flex-col justify-evenly gap-1">
                <label htmlFor="password">password</label>
                <Input
                  id="password"
                  {...register("password", {
                    required: true,
                    minLength: {
                      value: 5,
                      message: "must be 5 characters long",
                    },
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{5,}$/,
                      message:
                        "Password must be at least 5 char and include a letter, a number, and a special char",
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
            )}

            {/* submit button */}
            <div className="w-full flex justify-center items-center">
              <button className="btn btn-primary">Submit</button>
            </div>
          </form>
          {/* dialog close */}
          <div className="absolute top-1 right-1 m-0 ">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost">✕</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default CreateWorkspaceModal;

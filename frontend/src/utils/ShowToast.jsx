import { toast } from "react-toastify";
import { Toast } from "../components";

const ShowToast = function (
  msg,
  { type = "default", theme = "dark", className, onClose }
) {
  toast(<Toast msg={msg} />, {
    autoClose: 2000,
    type,
    theme,
    className: `${className}`,
    onClose,
  });
};

export { ShowToast };

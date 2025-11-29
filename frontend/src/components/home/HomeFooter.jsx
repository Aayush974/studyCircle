import { Heading } from "../index";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const HomeFooter = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/auth/login");
  };
  return (
    <>
      <footer className="w-full h-screen flex flex-col justify-center items-center gap-10">
        <Heading
          className={
            "text-center text-2xl md:text-3xl lg:text-4xl  xl:text-5xl"
          }
          title={"Get started with StudyCircle now"}
        />
        <button
          onClick={handleClick}
          className="shadow-sm shadow-gray-600 cursor-pointer p-4 flex justify-center items-center gap-4 rounded-2xl shadowxl bg-primary hover:shadow-md transition-shadow"
        >
          <div className="text-2xl md:text-3xl lg:text-4xl  xl:text-5x">
            Go
          </div>
          <FaArrowRight className="text-lg md:text-xl lg:text-2xl  xl:text-3x" />
        </button>
      </footer>
    </>
  );
};

export default HomeFooter;

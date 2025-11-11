import { useRef } from "react";
import { FlexContainer, Heading, Image } from "../index.js";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import {
  FaPencilAlt,
  FaConnectdevelop,
  FaSlideshare,
  FaLightbulb,
} from "react-icons/fa";
import gsap from "gsap";
import useWindowDimensions from "../../hooks/useWindowDimensions.js";

const HomeTitle = function () {
  const windowDimensions = useWindowDimensions();

  const containerRef = useRef();
  useGSAP(() => {
    let tl = gsap.timeline();
    let split = new SplitText(containerRef.current.querySelector(".title"), {
      type: "words",
    });

    // text animation
    tl.from(split.words, {
      y: -100,
      opacity: 0,
      rotation: "random(-80, 80)",
      duration: 1,
      ease: "back",
      stagger: 0.15,
    });

    // icon animations
    tl.from(containerRef.current.querySelector(".icon1"), {
      xPercent: -200,
      yPercent: -200,
      duration: 0.5,
      rotate: 90,
      opacity: 0,
    });
    tl.from(containerRef.current.querySelector(".icon2"), {
      xPercent: 200,
      yPercent: -200,
      duration: 0.5,
      rotate: 90,
      opacity: 0,
    });
    tl.from(containerRef.current.querySelector(".icon3"), {
      xPercent: -200,
      yPercent: 200,
      duration: 0.5,
      rotate: 90,
      opacity: 0,
    });
    tl.from(containerRef.current.querySelector(".icon4"), {
      xPercent: 200,
      yPercent: 200,
      duration: 0.5,
      rotate: 90,
      opacity: 0,
    });
  });

  return (
    <>
      <FlexContainer
        ref={containerRef}
        className="w-screen h-screen relative m-0"
      >
        {/* bg image */}
        <Image
          src="/src/assets/studyCircleDark.png"
          alt="background image"
          className={"opacity-15 absolute"}
        />
        {/* icons */}
        <FaSlideshare
          className={`icon icon1 absolute ${
            windowDimensions.width > 1280
              ? "top-30 left-30 text-8xl"
              : "top-24 left-24 text-6xl"
          } ${windowDimensions.height < 500 || windowDimensions.width < 900 ? "hidden" : "inline"}`}
        />
        <FaConnectdevelop
          className={`icon icon2 absolute ${
            windowDimensions.width > 1280
              ? "top-30 right-30 text-8xl"
              : "top-24 right-24 text-6xl"
          } ${windowDimensions.height < 500 || windowDimensions.width < 900  ? "hidden" : "inline"}`}
        />
        <FaLightbulb
          className={`icon icon3 absolute ${
            windowDimensions.width > 1280
              ? "bottom-30 left-30 text-8xl"
              : "bottom-24 left-24 text-6xl"
          } ${windowDimensions.height < 500 || windowDimensions.width < 900  ? "hidden" : "inline"}`}
        />
        <FaPencilAlt
          className={`icon icon4 absolute ${
            windowDimensions.width > 1280
              ? "bottom-30 right-30 text-8xl"
              : " bottom-24 right-24 text-6xl"
          } ${windowDimensions.height < 500 || windowDimensions.width < 900  ? "hidden" : "inline"}`}
        />
        {/* title */}
        <Heading
          className={`title text-4xl lg:text-5xl w-60/100 lg:70/100  text-center leading-relaxed`}
          title={"COLLABORATE, CONNECT AND SHARE IDEAS VIA STUDY CIRCLE"}
        />
      </FlexContainer>
    </>
  );
};

export default HomeTitle;

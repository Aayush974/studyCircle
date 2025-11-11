import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { GiTeamIdea } from "react-icons/gi";

const HomeSection1 = ({ className,windowDimensions, ...props }) => {
const containerRef = useRef();
  useGSAP(() => {
    if (windowDimensions.width<1300)
      return 
    if (!containerRef.current) return;
    const icon = containerRef.current.querySelector(".icon")
    const para = containerRef.current.querySelector(".para")
    gsap.from(icon, {
      yPercent: -100,
      opacity:0,
      duration: 2,
      ease: "elastic",
      scrollTrigger: {
        trigger: icon,
        start: "right center",
      }
    })
    gsap.from(para, {
      yPercent: 100,
      opacity:0,
      duration: 2,
      ease: "power1.out",
      scrollTrigger: {
        trigger: para,
        start: "right center",
      }
    })
    
  });
  return (
    <div
      ref={containerRef}
      className={`w-screen h-screen flex items-center justify-between flex-nowrap ${className}`}
      {...props}
    >
      <GiTeamIdea className="icon w-40 h-40 md:w-50 md:h-50  lg:w-60 lg:h-60  xl:w-80 xl:h-80 basis-1/2" />
      <div className="basis-1/2 flex justify-center items-center">
        <p className="para p-16 text-2xl md:text-3xl lg:text-4xl  xl:text-5xl text-center leading-relaxed">
          SHARE YOUR IDEAS AND THOUGHTS
        </p>
      </div>
    </div>
  );
};

export default HomeSection1;
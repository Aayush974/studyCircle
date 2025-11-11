import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { GrGroup } from "react-icons/gr";

const HomeSection2 = ({ className,windowDimensions, ...props }) => {
  const containerRef = useRef();

  useGSAP(() => {
    if (windowDimensions.width<1300)
      return 
    if (!containerRef.current) return;
    const icon = containerRef.current.querySelector(".icon");
    const para = containerRef.current.querySelector(".para")
    gsap.from(icon, {
      xPercent: -100,
      opacity:0,
      duration: 2,
      rotate:360,
      ease: "slow(0.7,0.7,false)",
      scrollTrigger:{
        trigger: icon,
        start: "right center-=1000px",
      }
    })
    gsap.from(para, {
      xPercent: 100,
      opacity:0,
      duration: 2,
      ease: "power1.out",
      scrollTrigger:{
        trigger: para,
        start: "right center-=1500px",
      }
    })
  });

  return (
    <div
      ref={containerRef}
      className={`w-screen h-screen flex items-center justify-between flex-nowrap ${className}`}
      {...props}
    >
      <GrGroup className="icon w-40 h-40 md:w-50 md:h-50  lg:w-60 lg:h-60  xl:w-80 xl:h-80 basis-1/2" />
      <div className="basis-1/2 flex justify-center items-center">
        <p className="para p-16 text-2xl md:text-3xl lg:text-4xl  xl:text-5xl text-center leading-relaxed">
          COLLABORATE BY CREATING WORKSPACES AND STUDYCIRCLES
        </p>
      </div>
    </div>
  );
};

export default HomeSection2;
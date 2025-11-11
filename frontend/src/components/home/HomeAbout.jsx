import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import HomeSection1 from "./HomeSection1.jsx";
import HomeSection2 from "./HomeSection2.jsx";
import HomeSection3 from "./HomeSection3.jsx";
import useWindowDimensions from "../../hooks/useWindowDimensions.js";

const HomeAbout = () => {
  const containerRef = useRef();
  const trackRef = useRef();
  const windowDimensions = useWindowDimensions()

  useGSAP(() => {
    if (windowDimensions.width<1300)
      return 
    const sections = gsap.utils.toArray(trackRef.current.children);
    // tried to pass this timeline as a prop to the child components so the animations could be synced to one scroll timeline but that wasn't working for some reason, so now the childs have some ugly start positions found via trial and error on thheir animation trigger <(＿　＿)>
    const scrolltimeline = gsap.timeline({
      scrollTrigger: {// adding trigger to the timeline
        trigger: containerRef.current,
        pin: true,
        scrub: true,
        end: "+=3000",
      },
    });

    // slider effect
    scrolltimeline.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: "none",
    });
  });

  return (
    <>
      <main ref={containerRef}>
        <div ref={trackRef} className={`track flex h-full ${windowDimensions.width<1300?'flex-col':null}`}>
          <HomeSection1
            windowDimensions = {windowDimensions}
            className="panel  flex-shrink-0 "
          />
          <HomeSection2
            windowDimensions = {windowDimensions}
            className="panel  flex-shrink-0 "
          />
          <HomeSection3
            windowDimensions = {windowDimensions}
            className="panel flex-shrink-0"
          />
        </div>
      </main>
    </>
  );
};

export default HomeAbout;
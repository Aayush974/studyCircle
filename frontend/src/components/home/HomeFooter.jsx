import {Heading} from "../index"
import { FaArrowRight } from "react-icons/fa";

const HomeFooter = ()=>{
    return(
            <>
                <footer className="w-full h-screen flex flex-col justify-center items-center gap-10">
                    <Heading 
                    className={"text-center text-2xl md:text-3xl lg:text-4xl  xl:text-5xl"}
                    title={"Get started with StudyCircle now"}/>
                    <div className=" p-4 flex justify-center items-center gap-4 rounded-2xl shadowxl bg-primary">
                        <button className="text-2xl md:text-3xl lg:text-4xl  xl:text-5x">Go</button>
                        <FaArrowRight className="text-lg md:text-xl lg:text-2xl  xl:text-3x"/>
                    </div>
                    
                </footer>
            </>
    )
}

export default HomeFooter
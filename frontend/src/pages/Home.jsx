import { HomeTitle, HomeAbout, HomeFooter } from "../components";

const Home = function () {
  return (
    <div className="overflow-x-hidden">
      <HomeTitle />
      <HomeAbout />
      <HomeFooter/>
    </div>
  );
};

export default Home;

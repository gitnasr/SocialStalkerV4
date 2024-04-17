import { FaFacebook, FaInstagram, FaUnlock } from "react-icons/fa";

import { MdHistoryToggleOff } from "react-icons/md";
import Card from "./card";

const Features = () => {
  return (
    <div className="w-full pt-16">
      <h1 className="text-white ">Features</h1>
      <p>We introduce a great features for your journey in social media</p>
      <div className="grid grid-cols-1 mt-5 gap-x-8 gap-y-5 md:grid-cols-2 ">
        <Card
          title="Unlock Profile Picture"
          description="You can view full size of any profile picture for any user in Facebook or Instagram"
          Icon={FaUnlock}
        />
        <Card
          title="Instagram Posts"
          description="You can download single or multiple images from Instagram with ease"
          Icon={FaInstagram}
        />
        <Card
          title="Stories, Highlights"
          description="Easily download stories and highlights from Instagram and Facebook, Video, Image, Video as Image and Archive!"
          Icon={MdHistoryToggleOff}
        />
        <Card
          title="Facebook Posts"
          description="Download uploaded photos of any user in Facebook, including photos uploaded by others"
          Icon={FaFacebook}
        />
      </div>
    </div>
  );
};

export default Features;

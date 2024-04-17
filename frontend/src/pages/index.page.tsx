import { FaChrome, FaVideo } from "react-icons/fa";

import Features from "~/components/Features";
import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="w-full py-12 mx-auto prose text-center lg:prose-2xl prose-invert prose-headings:m-1 prose-p:m-1">
      <h1 className="mb-0 text-transparent bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text">
        Enhance Your Social Media Experience
      </h1>
      <h6 className="mt-2 ">
        SocialStalker, Extension that allows you to Unlock Profile Picture,
        Download Media & Stories and Much More!
      </h6>

      <div className="flex flex-col gap-4 my-4 font-bold lg:flex-row">
        <div className="flex-col flex-1">
          <Link
            href="https://chromewebstore.google.com/detail/hbpaegjojojclojokkjfkbmlenollnpl"
            referrerPolicy="no-referrer"
            target="_blank"
          >
            <button
              type="button"
              className="w-full h-12 py-1 text-gray-100 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 hover:shadow-xl"
            >
              <div className="flex flex-row items-center justify-center gap-2 m-auto ">
                <FaChrome className="text-2xl " />
                <h6 className="m-0">Add to Browser</h6>
              </div>
            </button>
          </Link>
          <small>V1.0.0</small>
        </div>
        <button
          type="button"
          className="h-12 px-4 text-white rounded-md bg-gradient-to-r from-blue-800 to-indigo-900"
        >
          <div className="flex flex-row items-center justify-center gap-2 m-auto ">
            <FaVideo className="text-2xl " />
            <h6>What can I Do?</h6>
          </div>
        </button>
      </div>
      <Features />
    </div>
  );
};

export default Home;

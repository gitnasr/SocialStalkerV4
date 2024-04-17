import { ChildrenInterface } from "~/shared/interfaces/general/childrenNode";
import React from "react";

const GlobalContext: React.FC<ChildrenInterface> = ({ children }) => {
  return (
    <div className="w-full min-h-screen px-4 bg-black lg:px-0">{children}</div>
  );
};

export default GlobalContext;

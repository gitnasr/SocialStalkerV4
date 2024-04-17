import { IconType } from "react-icons";

interface CardProps {
  title: string;
  description: string;
  Icon: IconType;
}
const Card = ({ title, description, Icon }: CardProps) => {
  return (
    <div className="w-full p-4 prose text-left shadow-xl cursor-pointer hover:bg-slate-50 bg-slate-200 hover:shadow-2xl rounded-2xl ring-2 ring-blue-500">
      <div className="flex flex-col ">
        <Icon className="inline-block w-6 h-6 text-slate-800" />
        <h2 className="my-0 text-black">{title}</h2>
      </div>
      <p className="my-2 leading-5 text-teal-800">{description}</p>
    </div>
  );
};

export default Card;

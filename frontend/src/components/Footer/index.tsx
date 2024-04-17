import Image from "next/image";

export default function Footer() {
  return (
    <div className="fixed bottom-0 flex flex-col items-center justify-center w-full pb-5 bg-transparent">
      <a href="https://gitnasr.com" rel="noreferrer" target="_blank">
        <Image
          src="/gitnasr.png"
          alt="Gitnasr Logo"
          width={32}
          height={32}
          className="m-auto rounded-full cursor-pointer ring-2 ring-gray-500"
        />
      </a>
    </div>
  );
}

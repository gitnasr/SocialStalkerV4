import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <Link href="/" className="flex justify-center mt-5">
      <Image src="/logo.png" alt="SocialStalker: Logo" width={64} height={64} />
    </Link>
  );
}

import React from "react";
import Image from "next/image";
import { ASSETS } from "@/lib/constants";
import Link from "next/link";

const Logo = () => {
  const { LOGO_TEXT, FAVICON } = ASSETS;
  return (
    <Link href="/home">
      <div className="flex flex-row gap-2 items-center">
        <div className="w-14 h-12 relative">
          <Image src={FAVICON} fill alt="Favicon" className="object-cover" />
        </div>
        <div className="w-30 h-10 relative">
          <Image
            src={LOGO_TEXT}
            fill
            alt="AutoCre8"
            className="object-contain"
          />
        </div>
      </div>
    </Link>
  );
};

export default Logo;

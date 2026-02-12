import Image from "next/image";
import React from "react";

export default function SidebarWidget() {
  return (
    <div className="pb-8 px-6 mt-auto flex justify-center">
      <Image
        src="/images/logo/SCOPA-LOGO-R.png"
        alt="Logo SCOPA"
        width={90}
        height={90}
        className="w-auto h-auto max-w-[90px]"
        unoptimized
      />
    </div>
  );
}

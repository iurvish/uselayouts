import React, { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  Cancel01Icon,
  ClosedCaptionAltFreeIcons,
  Menu01FreeIcons,
  Menu11Icon,
  GithubIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const menuItems = [
  { name: "Components", href: "/components" },
  { name: "Documentation", href: "/docs" },
  { name: "About", href: "/about" },
];

const Header = () => {
  const [menuState, setMenuState] = useState(false);
  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="group sticky top-0 z-50 w-full  bg-transparent"
      >
        <div className="m-auto w-full px-4 md:px-8 lg:px-12 xl:px-20 max-sm:px-2">
          <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                {/* <span className="text-xl font-bold tracking-tight text-zinc-900">
                  uselayouts
                </span> */}

                <svg
                  width="220"
                  height="30"
                  viewBox="0 0 302 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMinYMid meet"
                  className="block text-foreground"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M23.5294 0C23.9188 0 24.3059 0.00933158 24.6906 0.0280324C24.6983 0.0284056 24.7047 0.0222832 24.7047 0.0145966V0.0145966C24.7047 0.00716965 24.7108 0.0011489 24.7182 0.0011489H46.227C46.6865 0.00137965 47.0588 0.373466 47.0588 0.83295C47.0588 1.05356 46.9712 1.26515 46.8153 1.42119L41.1753 7.05882H53.203C53.998 7.05882 54.7248 7.52694 55.0019 8.27203C55.9513 10.825 56.4706 13.5871 56.4706 16.4706C56.4706 29.4655 45.9361 40 32.9412 40C32.552 40 32.1651 39.9896 31.7806 39.9708C31.7726 39.9705 31.7659 39.9768 31.7659 39.9848V39.9848C31.7659 39.9926 31.7596 39.9989 31.7518 39.9989H10.2436C9.78414 39.9986 9.41177 39.6265 9.41177 39.1671C9.41179 38.9464 9.49938 38.7348 9.65533 38.5788L15.293 32.9412H3.26757C2.47264 32.9412 1.74575 32.4731 1.46868 31.728C0.519328 29.175 0 26.4129 0 23.5294C0 10.5345 10.5345 0 23.5294 0ZM31.5809 16.6556C29.6389 14.383 26.7531 12.9412 23.5294 12.9412C17.6817 12.9412 12.9412 17.6817 12.9412 23.5294C12.9412 24.7672 13.1552 25.9547 13.5455 27.0588H21.1753L24.8897 23.3444C26.8317 25.617 29.7175 27.0588 32.9412 27.0588C38.7889 27.0588 43.5294 22.3183 43.5294 16.4706C43.5294 15.2328 43.3154 14.0453 42.9251 12.9412H35.2953L31.5809 16.6556Z"
                    fill="#3754FA"
                  ></path>
                  <path
                    d="M291.015 30.1738V16.1031C291.015 15.6976 290.65 15.3326 290.244 15.3326H289.717C289.393 15.3326 289.109 15.5354 288.987 15.8192L284.081 27.4165C283.392 29.1195 281.729 30.1738 279.904 30.1738C278.08 30.1738 276.458 29.1195 275.768 27.4165L270.821 15.8192C270.74 15.5354 270.456 15.3326 270.132 15.3326H269.605C269.199 15.3326 268.834 15.6976 268.834 16.1031V30.1738H264.252V16.1031C264.252 13.143 266.645 10.71 269.605 10.71H270.132C272.281 10.71 274.227 12.0076 275.079 14.035L279.904 25.4701L284.73 14.035C285.581 12.0076 287.528 10.71 289.717 10.71H290.244C293.205 10.71 295.597 13.143 295.597 16.1031V30.1738H291.015Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M243.339 30.1738C238.675 30.1738 234.904 26.4027 234.904 21.7395V10.71H239.486V21.7395C239.486 23.8481 241.23 25.5917 243.339 25.5917H253.071C255.179 25.5917 256.923 23.8481 256.923 21.7395V10.71H261.505V21.7395C261.505 26.4027 257.734 30.1738 253.071 30.1738H243.339Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M226.462 25.5917C227.233 25.5917 227.882 24.9429 227.882 24.1725C227.882 23.402 227.273 22.7938 226.543 22.7532H215.717C212.392 22.7532 209.715 20.077 209.715 16.7519C209.715 13.4268 212.392 10.71 215.717 10.71H232.504V15.3326H215.717C214.946 15.3326 214.297 15.9814 214.297 16.7519C214.297 17.5223 214.946 18.1711 215.717 18.1711H226.624C229.868 18.2522 232.504 20.888 232.504 24.1725C232.504 27.4976 229.787 30.1738 226.462 30.1738H209.715V25.5917H226.462Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M183.984 30.1738V16.1031C183.984 13.143 186.377 10.71 189.337 10.71H201.137C204.948 10.71 208.03 13.8323 208.03 17.644C208.03 21.4556 204.948 24.578 201.137 24.578H188.566V30.1738H183.984ZM188.566 16.1031V19.9553H201.137C202.394 19.9553 203.448 18.901 203.448 17.644C203.448 16.3869 202.394 15.3326 201.137 15.3326H189.337C188.931 15.3326 188.566 15.6976 188.566 16.1031Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M176.266 10.71H180.848V30.1738H176.266V10.71Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M164.127 25.5917C166.966 25.5917 169.277 23.2804 169.277 20.4419C169.277 17.644 166.966 15.3326 164.127 15.3326H156.99C154.152 15.3326 151.841 17.644 151.841 20.4419C151.841 23.2804 154.152 25.5917 156.99 25.5917H164.127ZM164.127 10.71C169.52 10.71 173.859 15.0893 173.859 20.4419C173.859 25.835 169.52 30.1738 164.127 30.1738H156.99C151.597 30.1738 147.259 25.835 147.259 20.4419C147.259 15.0893 151.597 10.71 156.99 10.71H164.127Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M129.429 30.1738C124.036 30.1738 119.697 25.835 119.697 20.4419C119.697 15.0893 124.036 10.71 129.429 10.71H143.5V15.3326H129.429C126.591 15.3326 124.28 17.644 124.28 20.4419C124.28 23.2804 126.591 25.5917 129.429 25.5917H139.77C140.54 25.5917 141.189 24.9429 141.189 24.1725C141.189 23.402 140.54 22.7532 139.77 22.7532H128.659V18.1711H139.77C143.095 18.1711 145.811 20.8474 145.811 24.1725C145.811 27.4976 143.095 30.1738 139.77 30.1738H129.429Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M108.451 25.5917C111.289 25.5917 113.6 23.2804 113.6 20.4419C113.6 17.644 111.289 15.3326 108.451 15.3326H101.314C98.4753 15.3326 96.164 17.644 96.164 20.4419C96.164 23.2804 98.4753 25.5917 101.314 25.5917H108.451ZM108.451 10.71C113.844 10.71 118.182 15.0893 118.182 20.4419C118.182 25.835 113.844 30.1738 108.451 30.1738H101.314C95.9207 30.1738 91.5819 25.835 91.5819 20.4419C91.5819 15.0893 95.9207 10.71 101.314 10.71H108.451Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M72.8175 24.8212C72.8175 25.2267 73.1824 25.5917 73.5879 25.5917H90.7405V30.1738H73.5879C70.6278 30.1738 68.2354 27.7814 68.2354 24.8212V10.5883H72.8175V24.8212Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M301.177 10.5883C301.177 11.8878 300.123 12.9412 298.824 12.9412C297.524 12.9412 296.471 11.8878 296.471 10.5883C296.471 9.2888 297.524 8.23535 298.824 8.23535C300.123 8.23535 301.177 9.2888 301.177 10.5883Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden text-foreground transition-all duration-700"
              >
                <HugeiconsIcon
                  icon={Menu11Icon}
                  className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200"
                />
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200"
                />
              </button>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-muted/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:pr-4">
                <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                <Link
                  href="https://github.com/iurvish/uselayouts"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="icon"
                    variant={"secondary"}
                    className="rounded-md p-1 "
                  >
                    <HugeiconsIcon icon={GithubIcon} className="size-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

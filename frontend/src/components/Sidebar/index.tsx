"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const menuGroups = [
  {
    name: "MENU",
    menuItems: [
      {
        icon: (
          <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2.98125 0.328476H1.20938C0.5625 0.328476 0 0.868519 0 1.55068V3.34135C0 3.99509 0.534375 4.56355 1.20938 4.56355H2.98125C3.62813 4.56355 4.19063 4.02351 4.19063 3.34135V1.52226C4.1625 0.868519 3.62813 0.328476 2.98125 0.328476ZM2.89688 3.25608H1.29375V1.60753H2.89688V3.25608Z"
              fill="#F4F4F4"
            />
            <path
              d="M6.75002 3.08553H16.3969C16.7344 3.08553 17.0438 2.8013 17.0438 2.4318C17.0438 2.06229 16.7625 1.77806 16.3969 1.77806H6.75002C6.41252 1.77806 6.10315 2.06229 6.10315 2.4318C6.10315 2.8013 6.41252 3.08553 6.75002 3.08553Z"
              fill="#F4F4F4"
            />
            <path
              d="M2.98125 6.15526H1.20938C0.5625 6.15526 0 6.6953 0 7.37746V9.16813C0 9.82187 0.534375 10.3903 1.20938 10.3903H2.98125C3.62813 10.3903 4.19063 9.85029 4.19063 9.16813V7.37746C4.1625 6.6953 3.62813 6.15526 2.98125 6.15526ZM2.89688 9.08286H1.29375V7.43431H2.89688V9.08286Z"
              fill="#F4F4F4"
            />
            <path
              d="M16.3969 7.63327H6.75002C6.41252 7.63327 6.10315 7.9175 6.10315 8.28701C6.10315 8.65651 6.3844 8.91232 6.75002 8.91232H16.3969C16.7344 8.91232 17.0438 8.62809 17.0438 8.28701C17.0438 7.94593 16.7344 7.63327 16.3969 7.63327Z"
              fill="#F4F4F4"
            />
            <path
              d="M2.98125 12.3231H1.20938C0.5625 12.3231 0 12.8632 0 13.5453V15.336C0 15.9897 0.534375 16.5582 1.20938 16.5582H2.98125C3.62813 16.5582 4.19063 16.0182 4.19063 15.336V13.5453C4.1625 12.8632 3.62813 12.3231 2.98125 12.3231ZM2.89688 15.2507H1.29375V13.6022H2.89688V15.2507Z"
              fill="#F4F4F4"
            />
            <path
              d="M16.3969 13.7727H6.75002C6.41252 13.7727 6.10315 14.057 6.10315 14.4265C6.10315 14.796 6.3844 15.0802 6.75002 15.0802H16.3969C16.7344 15.0802 17.0438 14.796 17.0438 14.4265C17.0438 14.057 16.7344 13.7727 16.3969 13.7727Z"
              fill="#F4F4F4"
            />
          </svg>
        ),
        label: "My Invoice",
        route: "/invoices",
      },
    ],
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`fixed left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* <!-- SIDEBAR HEADER --> */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
          <Link href="/">
            <Image width={176} height={32} src={"/images/logo/logo.svg"} alt="Logo" priority />
          </Link>

          <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-controls="sidebar" className="block lg:hidden">
            <svg className="fill-current" width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                fill=""
              />
            </svg>
          </button>
        </div>
        {/* <!-- SIDEBAR HEADER --> */}

        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          {/* <!-- Sidebar Menu --> */}
          <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">{group.name}</h3>

                <ul className="mb-6 flex flex-col gap-1.5">
                  {group.menuItems.map((menuItem, menuIndex) => (
                    <SidebarItem key={menuIndex} item={menuItem} pageName={pageName} setPageName={setPageName} />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          {/* <!-- Sidebar Menu --> */}
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;

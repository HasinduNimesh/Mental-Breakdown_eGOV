'use client';

import React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { BRAND, getDeptBrand, type DeptKey } from "../../lib/branding";

const Clock = dynamic(() => import("../Clock"), { ssr: false });

interface LayoutProps {
  children: React.ReactNode;
  /** Optional page title (shows next to the department) */
  title?: string;
  /** Which department is in context; controls name + logo shown in the header */
  dept?: DeptKey;
  /** Show small live clock on the right (optional) */
  showClock?: boolean;
}

export function Layout({
  children,
  title = "Admin Dashboard",
  dept = "general",
  showClock = false,
}: LayoutProps) {
  const deptMeta = getDeptBrand(dept);
  const [siteLogoError, setSiteLogoError] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          {/* LEFT: Gov crest → Department name/logo → (optional) title */}
          <div className="min-w-0 flex items-center gap-3 sm:gap-4">
            <Image
              src={BRAND.govSeal}
              alt="Government crest"
              width={36}
              height={36}
              className="shrink-0 rounded-sm"
              priority
            />

            <div className="min-w-0">
              <div
                className="text-xs font-semibold leading-tight text-slate-700 dark:text-slate-300 truncate"
                title={deptMeta.name}
                aria-label="Department name"
              >
                {deptMeta.name}
              </div>
              <h1
                className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-violet-500 truncate"
                title={title}
              >
                {title}
              </h1>
            </div>

            <Image
              src={deptMeta.logoSrc}
              alt={`${deptMeta.name} logo`}
              width={40}
              height={40}
              className="shrink-0 h-10 w-10 object-contain"
              priority
            />
          </div>

          {/* RIGHT: eGov logo + theme toggle (+ optional clock) */}
          <div className="flex items-center gap-3">
            {siteLogoError ? (
              <span className="text-xl font-extrabold tracking-tight select-none">
                <span className="text-sky-700">e</span>
                <span className="text-orange-600">gov</span>
              </span>
            ) : (
              <Image
                src={BRAND.siteLogo}
                alt="eGov"
                width={96}
                height={28}
                className="h-7 w-auto"
                priority
                onError={() => setSiteLogoError(true)}
              />
            )}
            {showClock && <Clock />}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

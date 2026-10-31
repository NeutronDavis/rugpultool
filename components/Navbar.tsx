"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { ConnectButton } from "@/components/wallet/ConnectButton";

export function Navbar() {
  const { data: session, status } = useSession();
  const authed = status === "authenticated";

  // Launch and Positions are the paid surface, so they stay hidden until sign-in.
  const links = [
    { href: "/dashboard", label: "Rugs" },
    ...(authed
      ? [
          { href: "/launch", label: "Launch" },
          { href: "/portfolio", label: "Positions" },
        ]
      : []),
    { href: "/#pricing", label: "Pricing" },
    { href: "/#faq", label: "FAQ" },
  ];

  const email = session?.user?.email ?? "";
  const initials = email ? email.slice(0, 2).toUpperCase() : "??";

  return (
    <header className="sticky top-0 z-50 border-b border-base-300 bg-base-100/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="navbar min-h-14 px-0">
          <div className="navbar-start gap-1">
            <div className="dropdown lg:hidden">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-sm btn-square"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="h-5 w-5" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu z-50 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-box border border-base-300 bg-base-200 p-2 shadow-2xl"
              >
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="py-2 text-sm">{link.label}</Link>
                  </li>
                ))}
                {!authed && (
                  <li className="border-t border-base-300 pt-1 mt-1">
                    <Link href="/login" className="py-2 text-sm font-semibold text-primary">Sign in</Link>
                  </li>
                )}
                {authed && (
                  <li className="border-t border-base-300 pt-1 mt-1">
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="py-2 text-sm text-error"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </li>
                )}
              </ul>
            </div>

            <Link href="/" className="ml-0.5 sm:ml-1 lg:ml-0 flex items-center">
              <Logo />
            </Link>
          </div>

          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal gap-0.5 px-1 text-[13px]">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-base-content/60 hover:text-base-content">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="navbar-end gap-1.5 sm:gap-2">
            {authed ? (
              <>
                <ConnectButton />
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-sm gap-1.5 sm:gap-2 px-1 sm:px-1.5"
                    aria-label="Account menu"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary shrink-0">
                      {initials}
                    </span>
                    <span className="hidden max-w-[130px] truncate text-xs text-base-content/60 sm:inline">
                      {email}
                    </span>
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu z-50 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-box border border-base-300 bg-base-200 p-2 shadow-xl"
                  >
                    <li className="menu-title max-w-full truncate text-[11px] text-base-content/40">
                      {email}
                    </li>
                    <li>
                      <Link href="/portfolio">Positions</Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-error"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <Link href="/login" className="btn btn-primary btn-sm px-3">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

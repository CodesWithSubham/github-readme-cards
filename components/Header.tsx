"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { HiMenuAlt3, HiX } from "react-icons/hi";

import { cn } from "@/utils/cn";

const navLinks = [{ href: "/", label: "Home" }];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-zinc-200/70 bg-zinc-50/80 backdrop-blur-sm dark:border-zinc-700/70 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-2 md:px-5">
          <Logo />

          <div className="flex flex-1 items-center justify-end gap-2">
            {/* Desktop links */}
            <div className="mr-2 hidden items-center gap-0.5 md:flex">
              {navLinks.map((link) => (
                <NavLink key={link.href} active={pathname === link.href} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </div>

            <NavIcon
              aria-label="Toggle menu"
              className="md:hidden"
              onClick={() => {
                setIsOpen((prev) => !prev);
              }}
            >
              {isOpen ? <HiX size={18} /> : <HiMenuAlt3 size={18} />}
            </NavIcon>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-all duration-300 md:hidden",
          isOpen ? "visible opacity-100" : "pointer-events-none invisible opacity-0",
        )}
        onClick={() => {
          setIsOpen(false);
        }}
      >
        <div
          className={cn(
            "absolute top-0 right-0 flex h-full w-72 flex-col border-l border-zinc-200 bg-white transition-transform duration-300 ease-out dark:border-zinc-800 dark:bg-black",
            isOpen ? "translate-x-0" : "translate-x-full",
          )}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-4 dark:border-zinc-800">
            <Logo />

            <NavIcon
              onClick={() => {
                setIsOpen(false);
              }}
            >
              <HiX size={16} />
            </NavIcon>
          </div>

          <div className="flex flex-1 flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                className={cn(
                  "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-cyan-500/12 text-cyan-500"
                    : "text-zinc-600 dark:text-zinc-400",
                )}
                href={link.href}
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 px-4 pb-6">
            <Link
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition-colors dark:bg-cyan-500 dark:text-black"
              href="https://github.com/CodesWithSubham/github-readme-cards"
              target="_blank"
            >
              Open in GitHub
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <FaGithub size={22} />

      <span className="text-lg font-extrabold">README Cards</span>

      <span className="rounded-sm bg-cyan-500/20 px-1.5 py-0.5 font-mono text-xs text-cyan-600 dark:text-cyan-400">
        v2
      </span>
    </div>
  );
}

interface NavIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

function NavIcon({ children, className, ...props }: NavIconProps) {
  return (
    <button
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-neutral-200/50 hover:bg-neutral-300/70 text-neutral-900 dark:bg-neutral-700/30 hover:dark:bg-neutral-600/50 dark:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link className="relative rounded-xl px-3.5 py-2" href={href}>
      <span
        className={cn(
          "relative z-10 text-sm font-medium",
          active ? "text-cyan-500" : "text-zinc-600 dark:text-zinc-400",
        )}
      >
        {children}
      </span>
      {active ? <div className="absolute inset-0 rounded-xl bg-cyan-500/12" /> : null}
    </Link>
  );
}

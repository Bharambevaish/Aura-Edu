"use client";

import { useEffect, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";

/**
 * Header dropdowns that behave like real menus: only one open at a time
 * (opening another closes the first), and the open one closes on a click
 * outside, on Escape, or when the page changes ("light dismiss").
 *
 * Pass a ref to the element that wraps every trigger and panel, so clicks on
 * them count as inside.
 */
export function useMenus<T extends string>(ref: RefObject<HTMLElement | null>) {
  const pathname = usePathname();
  // Remember the page a menu was opened on: navigating closes it without an effect.
  const [state, setState] = useState<{ menu: T; path: string } | null>(null);
  const open = state && state.path === pathname ? state.menu : null;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setState(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setState(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, ref]);

  return {
    /** Which menu is open, or null. */
    open,
    isOpen: (menu: T) => open === menu,
    /** Open this menu (closing any other), or close it if it is already open. */
    toggle: (menu: T) => setState(open === menu ? null : { menu, path: pathname }),
    close: () => setState(null),
  };
}

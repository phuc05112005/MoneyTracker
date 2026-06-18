"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import nProgress from "nprogress";

export function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    nProgress.configure({ showSpinner: false });
  }, []);

  useEffect(() => {
    nProgress.done();
    return () => {
      nProgress.start();
    };
  }, [pathname, searchParams]);

  return null;
}

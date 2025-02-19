"use client";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Tabs } from "nextra/components";
import React, { Children, useEffect, MouseEvent } from "react";

interface ChildrenProps {
  children: React.ReactNode;
}

const STORAGE_TAB_KEY = "codeTab.framework";

const libraries = {
  ExpressCode: "Express",
  HonoCode: "Hono",
};

/**
 * Replace all non-alphabetic characters with a hyphen
 *
 * @param url - URL to parse
 * @returns - A string parsed from the URL
 */
const parseParams = (url: string): string => {
  const parsedUrl = url.toLowerCase().replaceAll(/[^a-zA-z]+/g, "-");
  return parsedUrl.endsWith("-") ? parsedUrl.slice(0, -1) : parsedUrl;
};

export function Code({ children }: ChildrenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const childs = Children.toArray(children);

  const updateFrameworkStorage = (value: string): void => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("framework", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClickFramework = (event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLButtonElement)) return;
    const { textContent } = event.target as unknown as HTMLDivElement;
    updateFrameworkStorage(parseParams(textContent!));
  };

  useEffect(() => {
    const length = Object.keys(libraries).length;
    const getFrameworkStorage = window.localStorage.getItem(STORAGE_TAB_KEY);
    const indexFramework = parseInt(getFrameworkStorage ?? "0") % length;
    if (!getFrameworkStorage) {
      window.localStorage.setItem(STORAGE_TAB_KEY, "0");
    }
    updateFrameworkStorage(
      parseParams(Object.values(libraries)[indexFramework])
    );
  }, [pathname, libraries]);

  return (
    <div
      className="[&_div[role='tablist']]:!pb-0"
      onClick={handleClickFramework}
    >
      <Tabs storageKey={STORAGE_TAB_KEY} items={Object.values(libraries)}>
        {Object.keys(libraries).map((f) => {
          // @ts-expect-error: Hacky dynamic child wrangling
          const child = childs.find((c) => c?.props?.type === f);

          // @ts-expect-error: Hacky dynamic child wrangling
          return Object.keys(child?.props ?? {}).length ? (
            child
          ) : (
            <Tabs.Tab key={f}>
              <p className="rounded-lg bg-slate-100 p-6 font-semibold dark:bg-neutral-950">
                {libraries[f as keyof typeof libraries]} not documented yet.
                Help us by contributing{" "}
                <a
                  className="underline"
                  target="_blank"
                  href={`https://github.com/Eric-fgm/ether-auth/edit/main/docs/pages${pathname}.mdx`}
                  rel="noreferrer"
                >
                  here
                </a>
                .
              </p>
            </Tabs.Tab>
          );
        })}
      </Tabs>
    </div>
  );
}

export function ExpressCode({ children }: ChildrenProps) {
  return <Tabs.Tab>{children}</Tabs.Tab>;
}

export function HonoCode({ children }: ChildrenProps) {
  return <Tabs.Tab>{children}</Tabs.Tab>;
}

import React from "react";
import { BasePageController } from "./base-page-controller";
import { ScreenResponse } from "../shared/page";

type PageEntry = {
  controller: new () => BasePageController;
  view: React.ComponentType<{ screen: ScreenResponse }>;
};

const pages = new Map<string, PageEntry>();

export function registerPage(
  id: string,
  controller: PageEntry["controller"],
  view: PageEntry["view"]
): void {
  pages.set(id, { controller, view });
}

export function getPage(id: string): PageEntry | undefined {
  return pages.get(id);
}

export function getRegisteredPages(): string[] {
  return Array.from(pages.keys());
}

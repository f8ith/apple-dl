import { createContext } from "react";

export const LayoutContext = createContext<TLayoutContext>(
  {} as TLayoutContext
);

export type SecondarySidebarTabs = "lyrics" | "queue";

export interface TLayoutContext {
  secondarySidebarTab: SecondarySidebarTabs;
  secondarySidebarOpen: boolean,
  toggleTab: (to: SecondarySidebarTabs) => void;
}

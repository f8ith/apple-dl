import { LayoutContext } from "@/contexts/layout-context";
import { useContext } from "react";

export function useLayout() {
  const context = useContext(LayoutContext);

  if (context === undefined) {
    throw new Error("useLayout() must be used within a LayoutProvider");
  }

  return context;
}

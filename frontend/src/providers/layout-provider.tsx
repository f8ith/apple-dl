import { useMemo, useState } from "react";

import { LayoutContext, SecondarySidebarTabs, TLayoutContext } from "@/contexts/layout-context";

interface LayoutProviderProps {
  children: React.ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [secondarySidebarTab, setSecondarySidebarTab] = useState<SecondarySidebarTabs>("queue");
  const [secondarySidebarOpen, setSecondarySidebarOpen] = useState(false);

  const toggleTab = (to: SecondarySidebarTabs) => {
    if (secondarySidebarOpen) {
        if (secondarySidebarTab == to)
            setSecondarySidebarOpen(false);
    } else {
      setSecondarySidebarOpen(true);
    }
    setSecondarySidebarTab(to);
  }

  const contextValue: TLayoutContext = useMemo(
    () => ({
        secondarySidebarTab,
        secondarySidebarOpen,
        toggleTab
    }),
    [secondarySidebarTab, secondarySidebarOpen, toggleTab]
  );


  return (
    <LayoutContext.Provider value={contextValue}>{children}</LayoutContext.Provider>
  );
}

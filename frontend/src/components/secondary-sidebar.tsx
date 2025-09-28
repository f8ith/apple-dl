import { useQuery } from "@tanstack/react-query";

import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiscord } from "@/hooks/use-discord";
import { useLayout } from "@/hooks/use-layout";
import { TabsContent } from "@radix-ui/react-tabs";
import { DiscordQueue } from "./discord-queue";
import { SecondarySidebarTabs } from "@/contexts/layout-context";
import { ScrollArea } from "./ui/scroll-area";

export function SecondarySidebar() {
  const { playerStateOptions } = useDiscord();

  const { data: playerState } = useQuery(playerStateOptions());
  const { secondarySidebarTab, secondarySidebarOpen, toggleTab } = useLayout();

  return (
    <Collapsible className="dark:scheme-dark" open={secondarySidebarOpen}>
      <CollapsibleContent>
        <div>
          {playerState && playerState.current_song && (
            <>
              <div className="w-[20vw]"></div>
              <Tabs
                value={secondarySidebarTab}
                onValueChange={(value) =>
                  toggleTab(value as SecondarySidebarTabs)
                }
                className="fixed right-0 bg-background w-[20vw] h-full p-4 pt-[4vh] border-1"
              >
                <TabsList className="mb-4 w-fit">
                  <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
                  <TabsTrigger value="queue">Queue</TabsTrigger>
                </TabsList>
                <TabsContent value="lyrics">
                  <div className="max-h-[75vh] overflow-y-auto">
                    <p className="text-lg p-4 whitespace-pre-line">
                      {playerState.current_song.lyrics}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="queue">
                  <div className="max-h-[75vh] overflow-y-auto">
                    <DiscordQueue />
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

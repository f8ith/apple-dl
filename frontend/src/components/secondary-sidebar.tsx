import { useQuery } from "@tanstack/react-query";

import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiscord } from "@/hooks/use-discord";
import { useLayout } from "@/hooks/use-layout";
import { TabsContent } from "@radix-ui/react-tabs";
import { DiscordQueue } from "./discord-queue";
import { SecondarySidebarTabs } from "@/contexts/layout-context";

export function SecondarySidebar() {
  const { playerStateOptions } = useDiscord();

  const { data: playerState } = useQuery(playerStateOptions());
  const { secondarySidebarTab, secondarySidebarOpen, toggleTab } = useLayout();

  return (
    <Collapsible
      className="dark:scheme-dark"
      open={secondarySidebarOpen}
    >
      <CollapsibleContent>
        <div>
          {playerState && playerState.current_song && (
            <Tabs
              value={secondarySidebarTab}
              onValueChange={(value) =>
                toggleTab(value as SecondarySidebarTabs)
              }
              className="w-[20vw] p-4"
            >
              <TabsList className="mb-4 w-fit">
                <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
                <TabsTrigger value="queue">Queue</TabsTrigger>
              </TabsList>
              <TabsContent value="lyrics">
                <p className="text-lg truncated p-4 whitespace-pre-line overflow-y-auto max-h-[80vh] shrink-1">
                  {playerState.current_song.lyrics}
                </p>
              </TabsContent>
              <TabsContent value="queue">
                 <DiscordQueue />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

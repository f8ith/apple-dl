import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useDiscord } from "@/hooks/use-discord";

export default function SecondarySidebar() {
  const { playerState } = useDiscord();

  return (
    <Sidebar variant="floating" collapsible="icon" className="dark:scheme-dark sm:max-h-[80vh] py-auto my-auto" side="right">
     <SidebarContent className="group-data-[collapsible=icon]:w-0 duration-200 ease-linear">
       {(playerState && playerState.current_song) && <SidebarGroup>
          <SidebarGroupLabel className="p-0 overflow-hidden">
            <h3 className="px-2 text-xl font-semibold leading-none tracking-tight">
              Lyrics
            </h3>
          </SidebarGroupLabel>
          <SidebarGroupContent>
             <p className="text-sm truncated p-8 whitespace-pre-line overflow-hidden shrink-1">
                {playerState.current_song.lyrics}
            </p>
         </SidebarGroupContent>
        </SidebarGroup>}
     </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
import Navbar from "@/components/navbar";
import PlaybackBar from "@/components/playback-bar";
import SecondarySidebar from "@/components/secondary-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import JobsProvider from "@/providers/jobs-provider";
import SocketProvider from "@/providers/socket-provider";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <SocketProvider>
        <JobsProvider>
            {/*<div className="flex flex-col mx-auto min-h-100 w-full">*/}
            <SidebarProvider>
             <SidebarInset>
              <Navbar />
              <Outlet />
              </SidebarInset>
              <SecondarySidebar />
              <PlaybackBar />
            </SidebarProvider>
        </JobsProvider>
      </SocketProvider>
      <TanStackRouterDevtools />
      <hr />
    </>
  ),
});

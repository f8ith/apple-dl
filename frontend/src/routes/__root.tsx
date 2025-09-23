import { Navbar } from "@/components/navbar";
import {PlaybackBar} from "@/components/playback-bar";
import { SecondarySidebar } from "@/components/secondary-sidebar";
import { LayoutProvider } from "@/providers/layout-provider";
import { SocketProvider } from "@/providers/socket-provider";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <SocketProvider>
        <LayoutProvider>
          <div>
          <div className="flex flex-row min-h-[98vh]">
            <div className="flex flex-col w-screen">
              <Navbar />
              <div className="flex pt-[6vh] pb-[8vh]">
                <Outlet />
                <SecondarySidebar />
              </div>
            </div>
          </div>
          <PlaybackBar />
          </div>
        </LayoutProvider>
      </SocketProvider>
      <TanStackRouterDevtools />
      <hr />
    </>
  ),
});

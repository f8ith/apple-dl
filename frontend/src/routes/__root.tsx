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
                <div className="dark:scheme-dark scroll-mt-[16vh] scroll-pt-[16vh] max-h-[85vh] w-screen overflow-y-auto">
                  <Outlet />
                </div>
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

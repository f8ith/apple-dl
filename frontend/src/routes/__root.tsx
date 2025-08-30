import Navbar from "@/components/navbar";
import PlaybackBar from "@/components/playback-bar";
import DiscordProvider from "@/providers/discord-provider";
import JobsProvider from "@/providers/jobs-provider";
import SocketProvider from "@/providers/socket-provider";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <SocketProvider>
        <JobsProvider>
          <DiscordProvider>
            {/*<div className="flex flex-col mx-auto min-h-100 w-full">*/}
            <Navbar />
            <Outlet />
            <PlaybackBar />
          </DiscordProvider>
        </JobsProvider>
      </SocketProvider>
      <TanStackRouterDevtools />
      <hr />
    </>
  ),
});

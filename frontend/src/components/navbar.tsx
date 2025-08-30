import { Link, useRouterState } from "@tanstack/react-router";

const Navbar = () => {
  const location = useRouterState({ select: (s) => s.location });

  return (
    <div className="flex flex-row items-start justify-center max-h-[8vh] p-8 gap-8 w-full">
      <Link
        to="/search"
        className={
          "text-xl " +
          (location.href.startsWith("/search")
            ? "text-white-500"
            : "text-gray-500")
        }
      >
        search
      </Link>
      <Link
        to="/jobs"
        className={
          "text-xl " +
          (location.href.startsWith("/jobs")
            ? "text-white-500"
            : "text-gray-500")
        }
      >
        jobs
      </Link>
      <Link
        to="/discord-bot"
        className={
          "text-xl " +
          (location.href.startsWith("/discord-bot")
            ? "text-white-500"
            : "text-gray-500")
        }
        search={{
          guild_id: null,
          player_id: null,
        }}
      >
        discord
      </Link>
    </div>
  );
  //return (
  //  <NavigationMenu>
  //    <NavigationMenuList>
  //      <NavigationMenuItem>
  //        <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
  //          <Link href="/" className="item">
  //            search
  //          </Link>
  //        </NavigationMenuLink>
  //      </NavigationMenuItem>
  //      <NavigationMenuItem>
  //        <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
  //          <Link href="/jobs" className="item">
  //            jobs
  //          </Link>
  //        </NavigationMenuLink>
  //      </NavigationMenuItem>
  //    </NavigationMenuList>
  //  </NavigationMenu>
  //);
};

export default Navbar;

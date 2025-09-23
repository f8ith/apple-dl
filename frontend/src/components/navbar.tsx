import { Link } from "@tanstack/react-router";

import {SearchBar} from "@/components/search-bar";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const Navbar = () => {
  return (
  <div className="fixed top-0 p-4 h-[8vh] z-[100] bg-background flex flex-row w-full gap-8 items-start justify-between">
    <div>
    </div>
    <div className="flex flex-row justify-center">
      <SearchBar/>
    </div>
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "text-lg")}>
            <Link to="/jobs" className="item">
              jobs
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
    </div>
  //  </div>
  );
};

export {Navbar};

import Link from "./link";
import { useCurrentRoute } from "./route";

const Navbar = () => {
  const { currentPath } = useCurrentRoute();
  return (
    <div className="flex flex-row items-start justify-start max-h-sm p-8 gap-8">
      <Link
        href="/"
        className={
          "text-xl " +
          (currentPath === "/" ? "text-white-500" : "text-gray-500")
        }
      >
        search
      </Link>
      <Link
        href="/jobs"
        className={
          "text-xl " +
          (currentPath === "/jobs" ? "text-white-500" : "text-gray-500")
        }
      >
        jobs
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

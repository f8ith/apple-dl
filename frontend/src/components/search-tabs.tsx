import { Link, useMatch } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

interface SearchTabProps {}

export function SearchTabs({}: SearchTabProps) {
  const Tabs = [
    {
      name: "all",
      route: "/search/$term",
      match: useMatch({ from: "/search/$term", shouldThrow: false }),
    },
    {
      name: "songs",
      route: "/search/$term/songs",
      match: useMatch({ from: "/search_/$term/songs", shouldThrow: false }),
    },
    {
      name: "albums",
      route: "/search/$term/albums",
      match: useMatch({ from: "/search_/$term/albums", shouldThrow: false }),
    },
    {
      name: "artists",
      route: "/search/$term/artists",
      match: useMatch({ from: "/search_/$term/artists", shouldThrow: false }),
    },
    {
      name: "playlists",
      route: "/search/$term/playlists",
      match: useMatch({ from: "/search_/$term/playlists", shouldThrow: false }),

    }
  ];

  return (
    <div className="flex flex-row items-start gap-4">
      {Tabs.map((tab) => (
        <Button
          key={tab.name}
          asChild
          variant={tab.match ? "default" : "outline"}
        >
          <Link to={tab.route}>{tab.name}</Link>
        </Button>
      ))}
    </div>
  );
}

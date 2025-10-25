import { useEffect, useState } from "react";
import { useMatch, useNavigate } from "@tanstack/react-router";
import { useDebounceValue, useSessionStorage } from "usehooks-ts";

import { Input } from "./ui/input";

export function SearchBar() {
  const [searchText, setSearchText] = useSessionStorage<string>(
    "searchText",
    ""
  );
  const [debouncedTerm, setDebouncedTerm] = useDebounceValue(searchText, 500);
  const [didInteract, setDidInteract] = useState(false);

  const isSongs = useMatch({
    from: "/search_/$term/songs",
    shouldThrow: false,
  });

  const isAlbums = useMatch({
    from: "/search_/$term/albums",
    shouldThrow: false,
  });

  const isArtists = useMatch({
    from: "/search_/$term/artists",
    shouldThrow: false,
  });

  const isPlaylists = useMatch({
    from: "/search_/$term/playlists",
    shouldThrow: false,
  });

  const navigate = useNavigate();


  const searchTo = () => {
    if (isSongs) return "/search/$term/songs";
    else if (isAlbums) return "/search/$term/albums";
    else if (isArtists) return "/search/$term/artists";
    else if (isPlaylists) return "/search/$term/playlists";

    return "/search/$term";
  };


  const triggerNavigate = () => {
    if (debouncedTerm != "") {
      navigate({ to: searchTo(), params: { term: debouncedTerm } });
    }
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    triggerNavigate();
  };

  useEffect(() => {
    if (didInteract)
      triggerNavigate();
  }, [debouncedTerm]);

  return (
    <form onSubmit={onSubmit}>
      <Input
        className="min-w-lg"
        autoFocus={true}
        value={searchText}
        onChange={(e) => {
          setDidInteract(true);
          setSearchText(e.target.value);
          setDebouncedTerm(e.target.value);
        }}
        placeholder="url, albums, songs..."
        id="url"
      />
    </form>
  );
}

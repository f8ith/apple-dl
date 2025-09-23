import { useEffect, useState } from "react";
import { useMatch, useNavigate } from "@tanstack/react-router";
import { useDebounceValue, useSessionStorage } from "usehooks-ts";

import { Input } from "./ui/input";

export function SearchBar() {
  const [searchText, setSearchText] = useSessionStorage<string>(
    "searchText",
    ""
  );
  const [didInteract, setDidInteract] = useState(false);
  const [debouncedTerm, setDebouncedTerm] = useDebounceValue(searchText, 500);

  const isSongs = useMatch({ from: '/search_/$term/songs', shouldThrow: false })

  const navigate = useNavigate();

  const searchTo = () => {
    if (isSongs)
      return "/search/$term/songs"

    return "/search/$term"
  }

  const triggerNavigate = () => {
    if (debouncedTerm != "" && didInteract) {
      navigate({ to: searchTo(), params: { term: debouncedTerm } });
    }
    setDidInteract(false);
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    triggerNavigate();
  }

  useEffect(() => {
    triggerNavigate()
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
        onSubmit={() => {
          console.log("submitted");
        }}
        placeholder="url, albums, songs..."
        id="url"
      />
    </form>
  );
}

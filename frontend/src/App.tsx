import { Input } from "@/components/ui/input";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { Separator } from "./components/ui/separator";
import axios from "axios";
import React, {
  useState,
  KeyboardEventHandler,
  useCallback,
  useContext,
} from "react";
import { Badge } from "./components/ui/badge";
import Route from "./components/route";
import Navbar from "./components/navbar";
import { CardTitle, CardDescription } from "./components/ui/card";
import { CheckIcon, DownloadIcon, XIcon } from "lucide-react";
import JobsProvider, { JobsContext } from "./jobs";

function App() {
  return (
    <JobsProvider>
      <div className="container max-h-screen">
        <Navbar />
        <Route path="/">
          <Search />
        </Route>
        <Route path="/jobs">
          <Jobs />
        </Route>
      </div>
    </JobsProvider>
  );
}

enum DownloadState {
  ok = "ok",
  notDownloaded = "notDownloaded",
  failed = "failed",
}

interface AMCardData {
  name: string;
  description: string;
  image: string;
  url: string;
  downloadState: DownloadState;
}

function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const { submitJob } = useContext(JobsContext);
  const [items, setItems] = useState<AMCardData[]>([]);
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      handleSearch(searchTerm);
    }
  };

  const handleSearch = async (str: string) => {
    if (str.startsWith("https://music.apple.com")) {
      submitJob(str);
    } else {
      const data = await searchItems(str);
      const songs = data.songs.data;
      const albums = data.albums.data;
      const playlists = data.playlists.data;
      const artists = data.artists.data;
      let newItems = [];
      for (
        let i = 0;
        i <
        Math.max(songs.length, albums.length, playlists.length, artists.length);
        i++
      ) {
        if (songs[i]) {
          newItems.push({
            name: songs[i].attributes.name,
            description: `song • ${songs[i].attributes.artistName}`,
            image: songs[i].attributes.artwork.url
              .replace("{w}", 720)
              .replace("{h}", 480),
            url: songs[i].attributes.url,
            downloadState: DownloadState.notDownloaded,
          });
        }
        if (albums[i]) {
          newItems.push({
            name: albums[i].attributes.name,
            description: `album • ${albums[i].attributes.artistName}`,
            image: albums[i].attributes.artwork.url
              .replace("{w}", 720)
              .replace("{h}", 480),
            url: albums[i].attributes.url,
            downloadState: DownloadState.notDownloaded,
          });
        }
        if (playlists[i]) {
          newItems.push({
            name: playlists[i].attributes.name,
            description: `playlist • ${playlists[i].attributes.curatorName}`,
            image: playlists[i].attributes.artwork.url
              .replace("{w}", 720)
              .replace("{h}", 480),
            url: playlists[i].attributes.url,
            downloadState: DownloadState.notDownloaded,
          });
        }
        if (artists[i]) {
          newItems.push({
            name: artists[i].attributes.name,
            description: `artist`,
            image: artists[i].attributes.artwork.url
              .replace("{w}", 480)
              .replace("{h}", 320),
            url: artists[i].attributes.url,
            downloadState: DownloadState.notDownloaded,
          });
        }
      }
      setItems(newItems);
    }
  };

  const searchItems = useCallback(async (term: string) => {
    const result = await axios.get("/api/search", { params: { term: term } });
    return result.data;
  }, []);

  return (
    <main className="flex flex-col items-start justify-start p-8">
      <div className="flex flex-row w-full items-start gap-4">
        <Input
          autoFocus={true}
          onKeyDown={onKeyDown}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="url, albums, songs..."
          id="url"
        />
        <Button
          variant="outline"
          type="submit"
          onClick={(_) => handleSearch(searchTerm)}
        >
          Search
        </Button>
      </div>
      <ScrollArea className="w-full h-screen my-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 -top-128 -mb-128">
          {items.map((item, index) => {
            return (
              <div key={index} className="flex flex-col rounded-lg border">
                <div className="flex flex-row gap-4 items-center p-2">
                  <div className="w-32 h-32 flex-shrink-0 p-2">
                    <img
                      className="bsolute left-0 top-0 w-full h-full object-cover object-center transition duration-50 rounded-lg"
                      loading="lazy"
                      src={item.image}
                    ></img>
                  </div>
                  <div className="flex flex-col gap-2">
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute flex-row gap-2 bottom-2 right-2">
                    <Button
                      className="size-8"
                      variant="secondary"
                      size="icon"
                      onClick={async (_) => {
                        const result = await submitJob(item.url);

                        setItems((oldItems) => {
                          if (result["status"] === "ok") {
                            oldItems[index].downloadState = DownloadState.ok;
                          } else {
                            oldItems[index].downloadState =
                              DownloadState.failed;
                          }
                          return oldItems;
                        });
                      }}
                    >
                      {(() => {
                        if (item.downloadState == DownloadState.ok) {
                          return <CheckIcon />;
                        } else if (
                          item.downloadState == DownloadState.notDownloaded
                        ) {
                          return <DownloadIcon />;
                        } else if (item.downloadState == DownloadState.failed) {
                          return <XIcon />;
                        }
                      })()}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </main>
  );
}

function Jobs() {
  const [url, setUrl] = useState("");
  const { jobs, submitJob } = useContext(JobsContext);
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      submitJob(url);
    }
  };

  return (
    <main className="flex flex-col items-start justify-start p-8">
      <div className="flex flex-row w-full items-start gap-4">
        <Input
          autoFocus={true}
          onKeyDown={onKeyDown}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="url"
          id="url"
        />
        <Button type="submit" onClick={(_) => submitJob(url)}>
          Add to queue
        </Button>
      </div>
      <ScrollArea className="w-full h-full my-4">
        <div className="p-4">
          {jobs.map((job) => (
            <React.Fragment key={job["id"]}>
              <div className="flex flex-row w-full items-start gap-4">
                <div className="flex flex-col w-full justify-start">
                  <p className="text-sm">{job["name"]}</p>
                  <p className="text-sm text-muted-foreground">
                    {job["url_type"]} • {job["artist_name"]} • id: {job["id"]}
                  </p>
                </div>
                <div className="flex self-center">
                  {(() => {
                    if (job["status"] == "done") {
                      return <Badge className="bg-green-500">done</Badge>;
                    } else if (job["status"] == "pending") {
                      return <Badge className="bg-yellow-500">pending</Badge>;
                    } else if (job["status"] == "failed") {
                      console.log(job["stderr"]);
                      return <Badge className="bg-red-500">failed</Badge>;
                    }
                  })()}
                </div>
              </div>
              <Separator className="my-2" />
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </main>
  );
}

export default App;

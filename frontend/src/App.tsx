import { Input } from "@/components/ui/input"
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { Separator } from "./components/ui/separator";
import axios from 'axios';
import React, { useState, KeyboardEventHandler, useEffect, useCallback } from "react";
import { Badge } from "./components/ui/badge";
import { socket } from "./socket";

function App() {
  const [url, setUrl] = useState('');
  const [jobs, setJobs] = useState([]);
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      submitJob(url)
    }
  }

  const getJobs = useCallback(async () => {
    const result = await axios.get('/api/jobs');
    setJobs(result.data["jobs"]);
  }, [])
  const submitJob = useCallback(async (url: string) => {
    const result = await axios.post('/api/submit_job', { "url": url });
    await getJobs()
    return result.data
  }, [])

  useEffect(() => {
    getJobs()

    function onConnect() {
      console.log("connected")
    }

    function onStatusUpdate() {
      console.log("received status_update")
      getJobs();
    }

    socket.on("status_update", onStatusUpdate);
    socket.on('connect', onConnect);

    return () => {
      socket.off("status_update", onStatusUpdate)
      socket.off('connect', onConnect);
    };
  }, [])

  return (
    <main className="flex flex-col items-start justify-start h-screen p-8">
      <div className="flex flex-row w-full items-start gap-4">
        <Input autoFocus={true} onKeyDown={onKeyDown} value={url} onChange={e => setUrl(e.target.value)} placeholder="url" id="url" />
        <Button type="submit" onClick={_ => submitJob(url)}>
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
                  <p className="text-sm text-muted-foreground">{job["url_type"]} • {job["artist_name"]} • id: {job["id"]}</p>
                </div>
                <div className="flex self-center">
                  {job["done"] ? <Badge className="bg-green-500">done</Badge> : <Badge className="bg-yellow-500">pending</Badge>}
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

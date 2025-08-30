import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import React, { useState, KeyboardEventHandler } from "react";
import { Badge } from "@/components/ui/badge";
import { useJobs } from "@/hooks/use-jobs";
import JobsDetailDialog from "@/components/jobs-dialog";

export const Route = createFileRoute("/jobs")({
  component: Jobs,
});

function Jobs() {
  const [url, setUrl] = useState("");
  const { jobs, submitJob } = useJobs();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      submitJob(url);
    }
  };

  const openJobDialog = (job: any) => {
    setIsDialogOpen(true);
    setSelectedJob(job);
  };

  return (
    <main className="flex flex-col items-start justify-start grow-1 mb-auto p-8">
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
      {jobs && (
        <div className="max-h-[70vh] overflow-y-auto min-w-0 w-full my-4">
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
                        return (
                          <Badge
                            onClick={() => openJobDialog(job)}
                            className="cursor-pointer bg-green-500"
                          >
                            done
                          </Badge>
                        );
                      } else if (job["status"] == "pending") {
                        return (
                          <Badge
                            onClick={() => openJobDialog(job)}
                            className="cursor-pointer bg-yellow-500"
                          >
                            pending
                          </Badge>
                        );
                      } else if (job["status"] == "failed") {
                        console.log(job["stderr"]);
                        return (
                          <Badge
                            onClick={() => openJobDialog(job)}
                            className="cursor-pointer bg-red-500"
                          >
                            failed
                          </Badge>
                        );
                      }
                    })()}
                  </div>
                </div>
                <Separator className="my-2" />
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      <JobsDetailDialog
        isOpen={isDialogOpen}
        setOpen={setIsDialogOpen}
        job={selectedJob}
      ></JobsDetailDialog>
    </main>
  );
}

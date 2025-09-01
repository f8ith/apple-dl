import { JobsContext } from "@/contexts/jobs-context";
import { useSocket } from "@/hooks/use-socket";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";

interface JobsProviderProps {
  children: React.ReactNode;
}

let didInit = false;

export default function JobsProvider({ children }: JobsProviderProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const { registerHandler } = useSocket();

  const getJobs = useCallback(async () => {
    const result = await axios.get("/api/v1/jobs/all");
    setJobs(result.data);

    return jobs;
  }, []);

  const submitJob = useCallback(async (url: string) => {
    const result = await axios.post("/api/v1/jobs/submit", { url: url });
    return { data: result.data, status: result.status };
  }, []);

  const contextValue = useMemo(
    () => ({
      jobs,
      getJobs,
      submitJob,
    }),
    [jobs, getJobs, submitJob]
  );

  const onStatusUpdate = () => {
    console.log("received status_update");
    getJobs();
  };

  useEffect(() => {
    if (!didInit) {
      didInit = true;
      registerHandler("status_update", onStatusUpdate);
    }
  }, []);

  useEffect(() => {
    getJobs();
  }, [getJobs]);

  return (
    <JobsContext.Provider value={contextValue}>{children}</JobsContext.Provider>
  );
}

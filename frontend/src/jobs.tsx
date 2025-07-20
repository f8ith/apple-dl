import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { socket } from "./lib/socket";
import axios from "axios";

export const JobsContext = createContext<JobsContextType>(
  {} as JobsContextType
);

interface JobsContextType {
  jobs: any[];
  submitJob: (url: string) => Promise<any>;
}

interface JobsProviderProps {
  children: React.ReactNode;
}

export default function JobsProvider({ children }: JobsProviderProps) {
  const [jobs, setJobs] = useState([]);

  const getJobs = useCallback(async () => {
    const result = await axios.get("/api/jobs");
    setJobs(result.data["jobs"]);
  }, []);

  const submitJob = useCallback(async (url: string) => {
    const result = await axios.post("/api/submit_job", { url: url });
    return result.data;
  }, []);

  const value = useMemo(() => ({ jobs, submitJob }), [jobs, setJobs]);

  useEffect(() => {
    getJobs();

    function onConnect() {
      console.log("socket.io connected");
    }

    function onStatusUpdate() {
      console.log("received status_update");
      getJobs();
    }

    socket.on("status_update", onStatusUpdate);
    socket.on("connect", onConnect);

    return () => {
      socket.off("status_update", onStatusUpdate);
      socket.off("connect", onConnect);
    };
  }, []);

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

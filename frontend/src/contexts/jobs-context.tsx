import { createContext } from "react";

export const JobsContext = createContext<TJobsContext>({} as TJobsContext);

export interface TJobsContext {
  jobs: any[];
  getJobs: () => Promise<any[]>;
  submitJob: (url: string) => Promise<any>;
}

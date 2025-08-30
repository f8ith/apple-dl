import { JobsContext } from "@/contexts/jobs-context";
import { useContext } from "react";

export function useJobs() {
  const context = useContext(JobsContext);

  if (context === undefined) {
    throw new Error("useUser() must be used within a UserProvider");
  }
  return context;
}

import { $api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSocket } from "./use-socket";

export function useJobs() {
  const { registerHandler } = useSocket();

  const useJobQuery = $api.useQuery(
    "get",
    "/api/v1/jobs/all",
  )

  const useSubmitJob = $api.useMutation(
    "post",
    "/api/v1/jobs/submit", 
  )

  //useCallback(async (url: string) => {
  //  const result = await axios.post("/api/v1/jobs/submit", { url: url });
  //  return { data: result.data, status: result.status };
  //}, []);

  const useJobSubscription = () => {
    const queryClient = useQueryClient();
    useEffect(() => {
      registerHandler(
        "status_update",
        () => {
          queryClient.invalidateQueries(
            {
              queryKey: [
                "get",
                "/api/v1/jobs/all",
              ],
            },
          );
        }
      );
    }, []);
  };

  return {jobs: useJobQuery.data, useSubmitJob, useJobSubscription}
}

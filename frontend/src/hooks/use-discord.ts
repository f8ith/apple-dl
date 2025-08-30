import axios from "axios";
import { useContext, useEffect } from "react";

import { DiscordContext } from "@/contexts/discord-context";

export function useDiscord() {
  const context = useContext(DiscordContext);

  if (context === undefined) {
    throw new Error("useDiscord() must be used within a DiscordProvider");
  }
  useEffect(() => {
    // TODO: Improve this spaghetti checking whether or not session is valid
    const fun = async () => {
      const result = await axios.get("/api/v1/discord/queue", {
        headers: context.headers,
      });

      const ok = result.status === 200;

      if (ok) context.connect();
      else context.disconnect();
    };

    fun();
  }, []);

  return context;
}

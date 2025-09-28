import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { SiDiscord } from "@icons-pack/react-simple-icons";

import { Button } from "@/components/ui/button";
import { useDiscord } from "@/hooks/use-discord"
import { components } from "@/openapi-schema";
import { cn } from "@/lib/utils";

interface AddToDiscordProps {
  type: components["schemas"]["AMItemType"]
  url: string
  className?: string
}

export function AddToDiscord({ type, url, className }: AddToDiscordProps) {
  const [added, setAdded] = useState(false);
  const { discordEnabled, discordEnabledItemTypes, useQueueMutation, header } = useDiscord();
  return discordEnabled && discordEnabledItemTypes.includes(type) &&
    <Button className={cn("size-8", className)} variant="secondary"
      size="icon"
      onClick={async (event) =>{
        event.stopPropagation();
        await useQueueMutation.mutateAsync({
          body: { url: url },
          params: { header },
        });
        setAdded(true);
      }
      }>
      {added ? <CheckIcon></CheckIcon> : <SiDiscord></SiDiscord>}
    </Button>
}

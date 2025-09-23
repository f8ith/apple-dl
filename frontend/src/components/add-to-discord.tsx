import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { SiDiscord } from "@icons-pack/react-simple-icons";

import { Button } from "@/components/ui/button";
import { useDiscord } from "@/hooks/use-discord"
import { components } from "@/openapi-schema";

interface AddToDiscordProps {
  type: components["schemas"]["AMItemType"]
  url: string
}

export function AddToDiscord({ type, url }: AddToDiscordProps) {
  const [added, setAdded] = useState(false);
  const { discordEnabled, discordEnabledItemTypes, useQueueMutation, header } = useDiscord();
  return discordEnabled && discordEnabledItemTypes.includes(type) &&
    <Button className="size-8" variant="secondary"
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

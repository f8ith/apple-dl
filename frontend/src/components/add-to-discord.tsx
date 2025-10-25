import { useState } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { SiDiscord } from "@icons-pack/react-simple-icons";

import { Button } from "@/components/ui/button";
import { useDiscord } from "@/hooks/use-discord";
import { components } from "@/openapi-schema";
import { cn } from "@/lib/utils";

interface AddToDiscordProps {
  type: components["schemas"]["AMItemType"];
  url: string;
  className?: string;
}

export function AddToDiscord({ type, url, className }: AddToDiscordProps) {
  const [added, setAdded] = useState(false);
  const { discordEnabled, discordEnabledItemTypes, useQueueMutation, header } =
    useDiscord();
  const { isSuccess, isPending, isError, mutateAsync } = useQueueMutation;
  return (
    discordEnabled &&
    discordEnabledItemTypes.includes(type) && (
      <Button
        className={cn("size-8", className)}
        variant="secondary"
        size="icon"
        onClick={async (event) => {
          event.stopPropagation();
          await mutateAsync({
            body: { url: url },
            params: { header },
          });
          setAdded(true);
        }}
        disabled={isPending || isSuccess || isError}
      >
        {(() => {
          if (isSuccess && added) {
            return <CheckIcon />;
          } else if (isError) {
            return <XIcon />;
          } else {
            return <SiDiscord />;
          }
        })()}
      </Button>
    )
  );
}

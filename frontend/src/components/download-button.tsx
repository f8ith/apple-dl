import { Button } from "@/components/ui/button";
import { $api } from "@/lib/api";
import { CheckIcon, DownloadIcon, XIcon } from "lucide-react";

type DownloadButtonProps = {
  url: string
}

export function DownloadButton({ url }: DownloadButtonProps) {
  const { isSuccess, isPending, isError, mutateAsync } = $api.useMutation(
    "post",
    "/api/v1/jobs/submit",
  )


  return <Button
    className="size-8"
    variant="secondary"
    size="icon"
    onClick={async (event) => {
      event.stopPropagation();
      await mutateAsync({
        body: { url: url },
      });
    }}
    disabled={isPending || isSuccess || isError}
  >
    {(() => {
      if (isSuccess) {
        return <CheckIcon />;
      } else if (isError) {
        return <XIcon />;
      } else {
        return <DownloadIcon />;
      }
    })()}
  </Button>
}

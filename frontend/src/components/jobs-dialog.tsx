import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { components } from "@/openapi-schema";

interface JobsDetailDialogProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  job: components["schemas"]["GamdlJobSchema"] | null;
}

export default function JobsDetailDialog({
  isOpen,
  setOpen,
  job,
}: JobsDetailDialogProps) {
  return (
    job && (
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>{job.name}</DialogTitle>
          <DialogDescription>id: {job.id}</DialogDescription>
          <div className="grid gap-4">
            <div className="grid gap-3  sm:max-h-[300px]">
              {job.error && (
                <>
                  <Label htmlFor="username-1">error</Label>
                  <div className="overflow-auto dark:scheme-dark">
                    <p>{job.error}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  );
}

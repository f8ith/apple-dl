import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface JobsDetailDialogProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  job: any | null;
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
          <div className="grid gap-4">
            <div className="grid gap-3 sm:max-h-[300px]">
              <Label htmlFor="name-1">stdout</Label>
              <div className="overflow-auto dark:scheme-dark">
                <p>{job.stdout}</p>
              </div>
            </div>
            <div className="grid gap-3  sm:max-h-[300px]">
              <Label htmlFor="username-1">stderr</Label>
              <div className="overflow-auto dark:scheme-dark">
                <p>{job.stderr}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  );
}

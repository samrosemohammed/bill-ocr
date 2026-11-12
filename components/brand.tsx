import { cn } from "cn";
import { FileText } from "lucide-react";

interface BrandProps {
  className?: string;
  iconClassName?: string;
}
export const Brand = ({ className, iconClassName }: BrandProps) => {
  return (
    <div
      className={cn(
        "flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className,
      )}
    >
      <FileText className={cn("size-4", iconClassName)} />
    </div>
  );
};

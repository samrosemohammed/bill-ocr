"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone, type FileRejection } from "react-dropzone";
import { CircleAlert, LoaderCircle, ReceiptText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "cn";

const MAX_SIZE = 5 * 1024 * 1024;

const ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function rejectionMessage(rejections: FileRejection[]) {
  const code = rejections[0]?.errors[0]?.code;

  if (code === "file-too-large")
    return "That file is over 5 MB. Try a smaller photo.";

  if (code === "file-invalid-type")
    return "Only JPG, PNG or WEBP images are supported.";

  if (code === "too-many-files") return "Please add one bill at a time.";

  return "That file could not be used.";
}

const Divider = () => {
  return <div className="my-5 border-t border-dashed border-border" />;
};

export const UploadDialog = () => {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const controller = useRef<AbortController | null>(null);

  // Preview URL
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Dropzone
  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    if (rejected.length > 0) {
      setError(rejectionMessage(rejected));
      return;
    }

    if (accepted[0]) {
      setFile(accepted[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: ACCEPT,
      maxSize: MAX_SIZE,
      multiple: false,
      disabled: uploading,
    });

  // Upload
  const submit = async () => {
    if (!file || uploading) return;

    setUploading(true);
    setError(null);

    const ac = new AbortController();
    controller.current = ac;

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/bills", {
        method: "POST",
        body,
        signal: ac.signal,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Upload failed. Please try again.");
        setUploading(false);
        return;
      }

      setOpen(false);
      router.push(`/dashboard/bills/${data.id}/review`);
    } catch {
      if (!ac.signal.aborted) {
        setError("Network error. Please check your connection and try again.");
      }

      setUploading(false);
    } finally {
      controller.current = null;
    }
  };

  // Cancel upload
  const cancel = () => {
    controller.current?.abort();
    controller.current = null;
    setUploading(false);
  };

  // Dialog state
  const handleOpenChange = (nextOpen: boolean) => {
    if (uploading && !nextOpen) return;
    setOpen(nextOpen);
  };

  // Dropzone styling
  const dropzoneClass = cn(
    "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring",
    isDragReject
      ? "border-destructive bg-destructive/5"
      : isDragActive
        ? "border-primary bg-primary/5"
        : "border-border hover:border-primary/50 hover:bg-accent/50",
    uploading && "pointer-events-none opacity-60",
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Trigger */}
      <DialogTrigger
        render={
          <Button>
            <Upload className="size-4" />
            Upload Bill
          </Button>
        }
      />

      {/* Dialog */}
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-xl">
        <div className="drop-shadow-md">
          <div className="rounded-t-xl bg-card px-6 pb-6 pt-8 text-card-foreground">
            {/* Header */}
            <DialogHeader className="">
              <DialogTitle className="mt-1 text-xl font-semibold">
                Add a bill
              </DialogTitle>

              <DialogDescription>
                Drop a photo of a paper bill. We read it, you check it.
              </DialogDescription>
            </DialogHeader>

            <Divider />

            {/* Dropzone */}
            <div {...getRootProps({ className: dropzoneClass })}>
              <input {...getInputProps()} />

              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Selected bill"
                  className="mx-auto max-h-64 w-auto rounded-md object-contain"
                />
              ) : (
                <div className="space-y-2">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
                    <ReceiptText className="size-6 text-muted-foreground" />
                  </div>

                  <p className="font-medium">
                    {isDragReject
                      ? "This file type isn't supported"
                      : isDragActive
                        ? "Drop it here"
                        : "Drag & drop your bill here"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    or click to choose a file
                  </p>

                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or WEBP · up to 5 MB
                  </p>
                </div>
              )}
            </div>

            {/* Selected file */}
            {file && !uploading && (
              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">
                  {file.name}
                  <span className="text-muted-foreground">
                    {" "}
                    · {formatSize(file.size)}
                  </span>
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setError(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <CircleAlert />
                <AlertTitle>Upload problem</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="mt-5 space-y-2" aria-live="polite">
              <Button
                className="w-full"
                size="lg"
                disabled={!file || uploading}
                onClick={submit}
              >
                {uploading ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Reading your bill…
                  </>
                ) : (
                  <>
                    <Upload />
                    Read this bill
                  </>
                )}
              </Button>

              {uploading && (
                <>
                  <p className="text-center text-xs text-muted-foreground">
                    This can take a little while. Please keep this page open.
                  </p>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={cancel}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

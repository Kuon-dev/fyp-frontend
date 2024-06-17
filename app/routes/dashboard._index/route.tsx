import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ActionFunction } from "@remix-run/node";
import { sendVerifyEmailCodeFromUser } from "@/lib/fetcher/user";
import { ClientOnly } from "remix-utils/client-only";

export const action: ActionFunction = async ({ request }) => {
  // set cookie consent
  console.log("send");
  const cookieHeader = request.headers.get("Cookie") ?? "";
  await sendVerifyEmailCodeFromUser(cookieHeader);
};

export default function Component() {
  // State for storing the selected images
  const [images, setImages] = useState<(File | null)[]>([]);
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([
    "http://localhost:9000/fyp/1715411350738-Screenshot 2023-12-12 041141.png",
  ]);

  const handleBrowse = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    // Trigger file input click
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    // detect file drag and drop
    if (event.dataTransfer.items) {
      const fileArray: (File | null)[] = Array.from(event.dataTransfer.items)
        .filter((item) => item.kind === "file")
        .filter((item) => item.type.startsWith("image/"))
        .map((item) => item.getAsFile());
      setImages(fileArray);

      // Create preview URLs
      const fileUrls = fileArray
        .filter((file) => file !== null)
        .map((file) => URL.createObjectURL(file!));
      setPreviewUrls(fileUrls);
    }
  };

  // Handle file input changes
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      // filter to images only, otherwise alert user
      const invalidFiles = Array.from(event.target.files).filter(
        (file) => !file.type.startsWith("image/"),
      );
      if (invalidFiles.length) {
        console.log(images);
        toast.error("Only image files are allowed");
        return;
      }

      const fileArray = Array.from(event.target.files).filter((file) =>
        file.type.startsWith("image/"),
      );
      setImages(fileArray);

      // Create preview URLs
      const fileUrls = fileArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(fileUrls);
    }
  };

  // Function to handle image upload (mocked function, replace with actual API call)

  const uploadImages = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.info("No images selected");
      return;
    }

    // Prepare FormData to send the files
    const formData = new FormData();
    images.forEach((image) => {
      if (image) {
        formData.append("images", image);
      }
    });

    try {
      const response = await fetch("http://localhost:8000/api/v1/test/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to upload images");
      }

      console.log("Upload successful:", result);
      setImages([]);
      setPreviewUrls([]);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  return (
    <ClientOnly>
      {() => (
        <section className="w-full max-w-3xl mx-auto py-12 md:py-16">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Upload Images
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Select multiple images to upload. They will be displayed in a grid
              preview below.
            </p>
          </div>
          <div className="mt-10 space-y-6">
            <div
              className="border-2 border-gray-200 border-dashed rounded-lg p-6 flex flex-col items-center justify-center space-y-4 dark:border-gray-800"
              onDragOver={handleDragOver}
            >
              <UploadIcon className="h-10 w-10 text-gray-500 dark:text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">
                Drag and drop files here or&nbsp;
                <span className="text-primary font-medium">
                  <button onClick={(e) => handleBrowse(e)}>browse</button>
                </span>
              </p>
              <input
                className="hidden"
                multiple
                type="file"
                ref={inputFileRef}
                onChange={handleFileChange}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative group overflow-hidden rounded-lg"
                >
                  <img
                    alt={`Uploaded ${index + 1}`}
                    className="object-cover w-full h-60"
                    src={url}
                    style={{ aspectRatio: "400/300", objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      className="text-white hover:bg-red-500 hover:text-white"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setImages(images.filter((_, i) => i !== index));
                        setPreviewUrls(
                          previewUrls.filter((_, i) => i !== index),
                        );
                      }}
                    >
                      <XIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <Button
              className="w-full max-w-[200px]"
              onClick={uploadImages}
              type="button"
            >
              Upload Images
            </Button>
          </div>
        </section>
      )}
    </ClientOnly>
  );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

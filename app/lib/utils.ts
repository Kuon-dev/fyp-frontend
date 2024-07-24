import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertTimestamp = (timestamp: string): string =>
  new Date(timestamp).toISOString().split("T")[0];

type ProgressData = {
  progress: number;
};
/**
 * Reads a stream and processes progress data
 * @param reader The ReadableStreamDefaultReader to read from
 * @param onProgress Callback function to handle progress updates
 */
export const readStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onProgress: (progress: number) => void,
): Promise<void> => {
  const textDecoder = new TextDecoder();
  let buffer = "";

  const processBuffer = () => {
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

    lines.forEach((line) => {
      if (line.startsWith("data:")) {
        try {
          const data: ProgressData = JSON.parse(line.slice(5));
          onProgress(data.progress);
        } catch (error) {
          console.error("Error parsing progress data:", error);
        }
      }
    });
  };

  try {
    let result: ReadableStreamReadResult<Uint8Array>;
    do {
      result = await reader.read();
      if (!result.done) {
        buffer += textDecoder.decode(result.value, { stream: true });
        processBuffer();
      }
    } while (!result.done);

    // Process any remaining data in the buffer
    processBuffer();
  } catch (error) {
    console.error("Error reading stream:", error);
  } finally {
    reader.releaseLock();
  }
};

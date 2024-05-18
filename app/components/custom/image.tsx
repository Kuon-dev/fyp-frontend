import { useState, useEffect } from "react";
import { Image, ImageProps as UnpicImageProps } from "@unpic/react";

interface CustomImageProps
  extends Omit<UnpicImageProps, "layout" | "width" | "height"> {
  layout?: "constrained";
  width?: string | number;
  height?: string | number;
}

// Helper function to convert string to number if needed

const toNumber = (value: string | number | undefined): number | undefined => {
  if (typeof value === "string") {
    return parseInt(value, 10);
  }
  return value;
};

export const LazyImage: React.FC<CustomImageProps> = ({
  src,
  width = 800,
  height = 600,
  layout = "constrained",
  loading = "lazy",
  alt = "alt",
}) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const numericWidth = toNumber(width) ?? 800;
  const numericHeight = toNumber(height) ?? 600;

  return loaded ? (
    <Image
      src={src}
      layout={layout}
      width={numericWidth}
      height={numericHeight}
      loading={loading}
      alt={alt}
    />
  ) : (
    <div>Loading...</div>
  );
};

export const EagerImage: React.FC<CustomImageProps> = ({
  src,
  width = 800,
  height = 600,
  layout = "constrained",
  loading = "eager",
  alt = "alt",
}) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const numericWidth = toNumber(width) ?? 800;
  const numericHeight = toNumber(height) ?? 600;

  return loaded ? (
    <Image
      src={src}
      layout={layout}
      width={numericWidth}
      height={numericHeight}
      loading={loading}
      alt={alt}
    />
  ) : (
    <div>Loading...</div>
  );
};

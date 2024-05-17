import { useState, useEffect } from "react";
import { Image, ImageProps as UnpicImageProps } from "@unpic/react";

interface CustomImageProps extends Omit<UnpicImageProps, "layout"> {
  layout?: "constrained";
}

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

  return loaded ? (
    <Image
      src={src}
      layout={layout}
      width={width}
      height={height}
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
  alt = "Shopify product",
  className,
}) => (
  <Image
    src={src}
    layout={layout}
    width={width}
    height={height}
    loading={loading}
    alt={alt}
    className={className}
  />
);

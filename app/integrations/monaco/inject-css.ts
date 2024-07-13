export const injectCSS = (css: string) => {
  const style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
};

export const injectTailwind = () => {
  const link = document.createElement("link");
  link.href =
    "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";
  link.rel = "stylesheet";
  document.head.appendChild(link);
};

export const DEFAULT_REACT_MONACO = `
import * as React from 'react'
import { render } from 'react-live'

type Props = {
  label: string;
}
const Counter = (props: Props) => {
  const [count, setCount] =
    React.useState<number>(0)
  return (
    <div>
      <h3 style={{
        background: 'darkslateblue',
        padding: 8,
        borderRadius: 4
      }}
      className="text-red-500"
      >
        {props.label}: {count} 🧮
      </h3>
      <button
        onClick={() =>
          setCount(c => c + 1)
        }>
        Increment
      </button>
    </div>
  )
}
render(<Counter label="Counter" />)`;

export const ENABLED_LANGUAGES: string[] = [
  "html",
  "markdown",
  "javascript",
  "typescript",
];

export const SELF_CLOSING_TAGS: string[] = [
  "area",
  "base",
  "br",
  "col",
  "command",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
  "circle",
  "ellipse",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "stop",
  "use",
];

export const DEFAULT_CSS_MONACO = `
.custom-class {
  color: red;
}
`;

export const DEFAULT_REACT_MONACO = `
import * as React from 'react'
import { render } from 'react-dom'
import './index.css'

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

export const TYPESCRIPT_VARIANT_1 = `
import * as React from 'react';
import { render } from 'react-live';

type Props = {
  name: string;
};

const Greeting = (props: Props) => {
  const [greeting, setGreeting] = React.useState<string>('');

  React.useEffect(() => {
    setGreeting(\`Hello, \${props.name}!\`);
  }, [props.name]);

  return (
    <div>
      <h1>{greeting}</h1>
    </div>
  );
};

render(<Greeting name="World" />);
`;

export const TYPESCRIPT_VARIANT_2 = `
import * as React from 'react';
import { render } from 'react-live';

type Props = {
  items: string[];
};

const ItemList = (props: Props) => {
  const [items, setItems] = React.useState<string[]>(props.items);

  React.useEffect(() => {
    setItems(props.items);
  }, [props.items]);

  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
};

render(<ItemList items={['Apple', 'Banana', 'Cherry']} />);
`;

export const TYPESCRIPT_VARIANT_3 = `
import * as React from 'react';
import { render } from 'react-live';

type Props = {
  initialCount: number;
};

const Counter = (props: Props) => {
  const [count, setCount] = React.useState<number>(props.initialCount);

  React.useEffect(() => {
    setCount(props.initialCount);
  }, [props.initialCount]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

render(<Counter initialCount={0} />);
`;

export const TYPESCRIPT_VARIANT_4 = `
import * as React from 'react';
import { render } from 'react-live';

type Props = {
  text: string;
};

const ToggleText = (props: Props) => {
  const [visible, setVisible] = React.useState<boolean>(true);

  return (
    <div>
      <button onClick={() => setVisible(!visible)}>
        Toggle Text
      </button>
      {visible && <p>{props.text}</p>}
    </div>
  );
};

render(<ToggleText text="Hello, toggle me!" />);
`;

export const TYPESCRIPT_VARIANT_5 = `
import * as React from 'react';
import { render } from 'react-live';

type Props = {
  message: string;
};

const AlertButton = (props: Props) => {
  const showAlert = React.useRef(() => {
    alert(props.message);
  });

  return (
    <button onClick={() => showAlert.current()}>
      Show Alert
    </button>
  );
};

render(<AlertButton message="This is an alert message!" />);
`;

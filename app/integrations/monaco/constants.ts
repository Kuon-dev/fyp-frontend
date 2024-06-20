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
import { render } from 'react-dom';
import './index.css';

type Props = {
  name: string;
};

const Greeting = (props: Props) => {
  const [greeting, setGreeting] = React.useState<string>('');

  React.useEffect(() => {
    setGreeting(\`Hello, \${props.name}!\`);
  }, [props.name]);

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-100 rounded shadow">
      <h1 className="text-white font-bold text-xl bg-darkslateblue p-2 rounded">
        {greeting}
      </h1>
    </div>
  );
};

render(<Greeting name="World" />);
`;

export const TYPESCRIPT_VARIANT_2 = `
import * as React from 'react';
import { render } from 'react-dom';
import './index.css';

type Props = {
  items: string[];
};

const ItemList = (props: Props) => {
  const [items, setItems] = React.useState<string[]>(props.items);

  React.useEffect(() => {
    setItems(props.items);
  }, [props.items]);

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-100 rounded shadow">
      <ul className="list-disc">
        {items.map((item, index) => (
          <li key={index} className="text-white font-bold text-xl bg-darkslateblue p-2 rounded m-1">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

render(<ItemList items={['Apple', 'Banana', 'Cherry']} />);
`;

export const TYPESCRIPT_VARIANT_3 = `
import * as React from 'react';
import { render } from 'react-dom';
import './index.css';

type Props = {
  initialCount: number;
};

const Counter = (props: Props) => {
  const [count, setCount] = React.useState<number>(props.initialCount);

  React.useEffect(() => {
    setCount(props.initialCount);
  }, [props.initialCount]);

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-100 rounded shadow">
      <p className="text-white font-bold text-xl bg-darkslateblue p-2 rounded">
        Count: {count}
      </p>
      <button 
        onClick={() => setCount(count + 1)} 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
        Increment
      </button>
    </div>
  );
};

render(<Counter initialCount={0} />);
`;

export const TYPESCRIPT_VARIANT_4 = `
import * as React from 'react';
import { render } from 'react-dom';
import './index.css';

type Props = {
  text: string;
};

const ToggleText = (props: Props) => {
  const [visible, setVisible] = React.useState<boolean>(true);

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-100 rounded shadow">
      <button 
        onClick={() => setVisible(!visible)} 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
        Toggle Text
      </button>
      {visible && (
        <p className="text-white font-bold text-xl bg-darkslateblue p-2 rounded">
          {props.text}
        </p>
      )}
    </div>
  );
};

render(<ToggleText text="Hello, toggle me!" />);
`;

export const TYPESCRIPT_VARIANT_5 = `
import * as React from 'react';
import { render } from 'react-dom';
import './index.css';

type Props = {
  message: string;
};

const AlertButton = (props: Props) => {
  const showAlert = React.useRef(() => {
    alert(props.message);
  });

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-100 rounded shadow">
      <button 
        onClick={() => showAlert.current()} 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
        Show Alert
      </button>
    </div>
  );
};

render(<AlertButton message="This is an alert message!" />);
`;

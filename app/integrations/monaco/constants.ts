export const DEFAULT_CSS_MONACO = `
.quiz-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #1a1a1a;
  color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

h1 {
  text-align: center;
  color: #bb86fc;
}

h2 {
  color: #03dac6;
}

.question {
  font-size: 1.2em;
  margin-bottom: 20px;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.option-btn {
  background-color: #3700b3;
  color: #ffffff;
  border: none;
  padding: 10px;
  font-size: 1em;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.option-btn:hover {
  background-color: #6200ee;
}

.option-btn.selected {
  background-color: #018786;
}

.next-btn, .restart-btn {
  background-color: #bb86fc;
  color: #000000;
  border: none;
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 20px;
  transition: background-color 0.3s;
}

.next-btn:hover, .restart-btn:hover {
  background-color: #3700b3;
  color: #ffffff;
}

.next-btn:disabled {
  background-color: #4f4f4f;
  cursor: not-allowed;
}

.score-section {
  text-align: center;
}

.score-section p {
  font-size: 1.2em;
  margin-bottom: 20px;
}
`;

export const DEFAULT_REACT_MONACO = `

import React from "react"
import { render } from "react-dom"

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

const QuizApp = () => {
  const [questions, setQuestions] = React.useState<Question[]>([
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: "Paris"
    },
    {
      id: 2,
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: "Mars"
    },
    {
      id: 3,
      question: "Who painted the Mona Lisa?",
      options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
      correctAnswer: "Leonardo da Vinci"
    }
  ]);
  const [currentQuestion, setCurrentQuestion] = React.useState<number>(0);
  const [score, setScore] = React.useState<number>(0);
  const [showScore, setShowScore] = React.useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string>("");

  const handleAnswerClick = (answer: string): void => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = (): void => {
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedAnswer("");
    } else {
      setShowScore(true);
    }
  };

  const restartQuiz = (): void => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer("");
  };

  return (
    <div className="quiz-container">
      <h1>Quiz App</h1>
      {showScore ? (
        <div className="score-section">
          <h2>Quiz Completed!</h2>
          <p>Your score: {score} out of {questions.length}</p>
          <button onClick={restartQuiz} className="restart-btn">Restart Quiz</button>
        </div>
      ) : (
        <div className="question-section">
          <h2>Question {currentQuestion + 1}/{questions.length}</h2>
          <p className="question">{questions[currentQuestion].question}</p>
          <div className="options">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerClick(option)}
                className={\`option-btn \${selectedAnswer === option ? 'selected' : ''}\`}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer}
            className="next-btn"
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
};

render(<QuizApp />);
`;

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

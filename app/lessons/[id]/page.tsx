'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';

interface LessonContent {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  category: string;
  icon: string;
  sections: Section[];
  quiz: QuizQuestion[];
}

interface Section {
  id: number;
  title: string;
  content: string;
  exercises: Exercise[];
}

interface Exercise {
  id: number;
  title: string;
  description: string;
  starter_code: string;
  solution: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const lessonContent: { [key: number]: LessonContent } = {
  1: {
    id: 1,
    title: 'Introduction to Programming',
    description: 'Learn the fundamentals of programming with hands-on exercises and real-world examples.',
    duration: '2h 30m',
    level: 'Beginner',
    category: 'tech',
    icon: '🖥️',
    sections: [
      {
        id: 1,
        title: 'What is Programming?',
        content: `
Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer programming languages, such as JavaScript, Python, and C++.

Key concepts:
- Programming is about solving problems with code
- Every program has a purpose and solves a specific problem
- Good programming requires logical thinking and planning

Why Learn Programming?
- High demand in the job market
- Develop problem-solving skills
- Automate repetitive tasks
- Create innovative solutions
- Build web applications, mobile apps, and more
        `,
        exercises: [
          {
            id: 1,
            title: 'Your First Console Message',
            description: 'Write code to display "Hello, World!" in the console.',
            starter_code: `// Write your code here
console.log(/* Your message here */);`,
            solution: `console.log("Hello, World!");`
          }
        ]
      },
      {
        id: 2,
        title: 'Variables and Data Types',
        content: `
Variables are containers for storing data values. In JavaScript, we can declare variables using const, let, or var.

Common Data Types:
- String: Text data enclosed in quotes ("hello" or 'hello')
- Number: Integers or decimals (42, 3.14)
- Boolean: True or false values
- Array: A list of values [1, 2, 3]
- Object: A collection of key-value pairs {name: "John"}

Variable Declaration:
\`\`\`javascript
const age = 25; // constant - cannot be changed
let name = "Alice"; // can be reassigned
var email = "alice@example.com"; // older way (avoid using)
\`\`\`

Best Practices:
- Use const by default
- Use let when you need to reassign a variable
- Use meaningful variable names (userName, not u or n)
- Avoid var in modern JavaScript
        `,
        exercises: [
          {
            id: 2,
            title: 'Create Variables',
            description: 'Create variables for a person\'s name, age, and email. Display them in the console.',
            starter_code: `// Create variables for name, age, and email
// Your code here

console.log(name);
console.log(age);
console.log(email);`,
            solution: `const name = "Alice";
const age = 25;
const email = "alice@example.com";

console.log(name);
console.log(age);
console.log(email);`
          }
        ]
      },
      {
        id: 3,
        title: 'Functions and Logic',
        content: `
Functions are reusable blocks of code that perform a specific task. They help make your code organized and avoid repetition.

Function Syntax:
\`\`\`javascript
function functionName(parameter1, parameter2) {
  // Code to execute
  return result;
}
\`\`\`

Arrow Functions (Modern JavaScript):
\`\`\`javascript
const add = (a, b) => {
  return a + b;
};

// Shorter syntax for simple functions
const multiply = (a, b) => a * b;
\`\`\`

Control Flow - If Statements:
\`\`\`javascript
if (age >= 18) {
  console.log("You are an adult");
} else if (age >= 13) {
  console.log("You are a teenager");
} else {
  console.log("You are a child");
}
\`\`\`

Loops - For Loop:
\`\`\`javascript
for (let i = 0; i < 5; i++) {
  console.log(i); // prints 0, 1, 2, 3, 4
}
\`\`\`

Loops - While Loop:
\`\`\`javascript
let counter = 0;
while (counter < 5) {
  console.log(counter);
  counter++;
}
\`\`\`
        `,
        exercises: [
          {
            id: 3,
            title: 'Grade Calculator Function',
            description: 'Create a function that takes a score and returns the grade (A: 90+, B: 80-89, C: 70-79, F: <70).',
            starter_code: `function getGrade(score) {
  // Your code here
}

console.log(getGrade(95)); // Should print "A"
console.log(getGrade(85)); // Should print "B"
console.log(getGrade(72)); // Should print "C"
console.log(getGrade(65)); // Should print "F"`,
            solution: `function getGrade(score) {
  if (score >= 90) {
    return "A";
  } else if (score >= 80) {
    return "B";
  } else if (score >= 70) {
    return "C";
  } else {
    return "F";
  }
}

console.log(getGrade(95)); // Prints "A"
console.log(getGrade(85)); // Prints "B"
console.log(getGrade(72)); // Prints "C"
console.log(getGrade(65)); // Prints "F"`
          }
        ]
      },
      {
        id: 4,
        title: 'Working with Arrays',
        content: `
Arrays are used to store multiple values in a single variable. They are one of the most important data structures in programming.

Creating Arrays:
\`\`\`javascript
const fruits = ["apple", "banana", "orange"];
const numbers = [1, 2, 3, 4, 5];
const mixed = [1, "hello", true, {name: "John"}];
\`\`\`

Accessing Array Elements:
\`\`\`javascript
const fruits = ["apple", "banana", "orange"];
console.log(fruits[0]); // "apple"
console.log(fruits[1]); // "banana"
console.log(fruits.length); // 3
\`\`\`

Common Array Methods:
- push(): Add element to end
- pop(): Remove element from end
- map(): Transform each element
- filter(): Keep elements that match a condition
- find(): Find the first matching element
- forEach(): Loop through each element

Examples:
\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];

// Using map to double each number
const doubled = numbers.map(n => n * 2); // [2, 4, 6, 8, 10]

// Using filter to get only even numbers
const evens = numbers.filter(n => n % 2 === 0); // [2, 4]

// Using forEach to print each number
numbers.forEach(n => console.log(n));
\`\`\`
        `,
        exercises: [
          {
            id: 4,
            title: 'Sum of Array Elements',
            description: 'Write a function that takes an array of numbers and returns the sum.',
            starter_code: `function sumArray(arr) {
  // Your code here
}

console.log(sumArray([1, 2, 3, 4, 5])); // Should print 15
console.log(sumArray([10, 20, 30])); // Should print 60`,
            solution: `function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

// Alternative using reduce:
// const sumArray = (arr) => arr.reduce((sum, num) => sum + num, 0);

console.log(sumArray([1, 2, 3, 4, 5])); // Prints 15
console.log(sumArray([10, 20, 30])); // Prints 60`
          }
        ]
      }
    ],
    quiz: [
      {
        id: 1,
        question: 'What is a variable?',
        options: [
          'A name for a value stored in the computer\'s memory',
          'A type of function',
          'A programming language',
          'A way to organize code'
        ],
        correctAnswer: 0,
        explanation: 'A variable is a container that holds a value in the computer\'s memory. It has a name so we can reference it later.'
      },
      {
        id: 2,
        question: 'Which keyword should you use by default in modern JavaScript?',
        options: ['var', 'let', 'const', 'all are equal'],
        correctAnswer: 2,
        explanation: 'const should be used by default in modern JavaScript. Use let when you need to reassign a variable. Avoid var.'
      },
      {
        id: 3,
        question: 'What will this code output? let x = 5; console.log(x + 3);',
        options: ['8', '53', 'undefined', 'Error'],
        correctAnswer: 0,
        explanation: 'JavaScript will add the number 5 and 3 together to get 8.'
      },
      {
        id: 4,
        question: 'What is a function?',
        options: [
          'A reusable block of code that performs a specific task',
          'A type of variable',
          'A way to style HTML',
          'An error in code'
        ],
        correctAnswer: 0,
        explanation: 'A function is a reusable block of code designed to perform a specific task. You can call it multiple times.'
      },
      {
        id: 5,
        question: 'Which method adds an element to the end of an array?',
        options: ['pop()', 'shift()', 'push()', 'unshift()'],
        correctAnswer: 2,
        explanation: 'push() adds an element to the end of an array. pop() removes from the end.'
      }
    ]
  }
};


export default function LessonPage({ params }: { params: { id: string } }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [code, setCode] = useState<{ [key: string]: string }>({});
  const [showSolution, setShowSolution] = useState<{ [key: string]: boolean }>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const lessonId = parseInt(params.id);
  const lesson = lessonContent[lessonId];

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    setIsDarkMode(theme === 'dark');
  }, []);

  if (!lesson) {
    return (
      <div className={`${isDarkMode ? 'dark' : ''}`}>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 md:ml-64 max-w-5xl mx-auto">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Lesson not found
              </h1>
              <Link
                href="/lessons"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Return to Lessons
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const currentLessonSection = lesson.sections[currentSection];
  const totalProgress = Math.round(
    (((currentSection + 1) / lesson.sections.length) * 50 +
      (quizAnswers.length / lesson.quiz.length) * 50) || 0
  );

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar and toggle button */}
        {isSidebarOpen && (
          <div className="relative">
            <Sidebar />
            <button
              aria-label="Close sidebar"
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 -right-4 z-20 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              style={{ border: '1px solid #ccc' }}
            >
              {'<'}
            </button>
          </div>
        )}
        {!isSidebarOpen && (
          <button
            aria-label="Open sidebar"
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 left-2 z-30 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            style={{ border: '1px solid #ccc' }}
          >
            {'>'}
          </button>
        )}
        <main className={`flex-1 p-4 md:p-8 ${isSidebarOpen ? 'md:ml-64' : ''} max-w-5xl mx-auto`}>
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/lessons"
              className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
            >
              ← Back to Lessons
            </Link>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {lesson.icon} {lesson.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {lesson.description}
                </p>
              </div>
              <div className="text-left md:text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Progress: {totalProgress}%
                </div>
                <div className="w-full md:w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Sections
                </h3>
                <div className="space-y-2">
                  {lesson.sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => setCurrentSection(index)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        currentSection === index
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="text-sm font-medium">{section.title}</div>
                    </button>
                  ))}
                  <button
                    onClick={() => setShowQuiz(true)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors mt-4 ${
                      showQuiz
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-sm font-medium">📝 Quiz</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {showQuiz ? (
                // Quiz Section
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Lesson Quiz
                  </h2>
                  <div className="space-y-6">
                    {lesson.quiz.map((question, index) => (
                      <div key={question.id} className="pb-6 border-b dark:border-gray-700 last:border-b-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                          {index + 1}. {question.question}
                        </h3>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <label
                              key={optionIndex}
                              className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={optionIndex}
                                checked={quizAnswers[index] === optionIndex}
                                onChange={(e) => {
                                  const newAnswers = [...quizAnswers];
                                  newAnswers[index] = parseInt(e.target.value);
                                  setQuizAnswers(newAnswers);
                                }}
                                className="mr-3"
                              />
                              <span className="text-gray-900 dark:text-white">{option}</span>
                            </label>
                          ))}
                        </div>
                        {quizAnswers[index] !== undefined && (
                          <div className={`mt-3 p-3 rounded-lg ${
                            quizAnswers[index] === question.correctAnswer
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                          }`}>
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-8">
                    <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-4">
                      <p className="text-gray-900 dark:text-white">
                        <strong>Quiz Score:</strong> {quizAnswers.filter((answer, i) => answer === lesson.quiz[i].correctAnswer).length} / {lesson.quiz.length}
                      </p>
                    </div>
                    {quizAnswers.length === lesson.quiz.length && quizAnswers.filter((answer, i) => answer === lesson.quiz[i].correctAnswer).length >= lesson.quiz.length * 0.8 && (
                      <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-4 rounded-lg">
                        🎉 Congratulations! You passed the quiz!
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Lesson Section
                <div className="space-y-8">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {currentLessonSection.title}
                    </h2>
                    <div className="prose dark:prose-invert max-w-none">
                      {currentLessonSection.content.split('\n').map((line, index) => (
                        <p
                          key={index}
                          className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Exercises */}
                  {currentLessonSection.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-8"
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        ✏️ {exercise.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {exercise.description}
                      </p>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Your Code:
                        </label>
                        <textarea
                          value={code[`${currentSection}-${exercise.id}`] || ''}
                          onChange={(e) =>
                            setCode({
                              ...code,
                              [`${currentSection}-${exercise.id}`]: e.target.value
                            })
                          }
                          className="w-full h-32 p-3 font-mono text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg"
                          placeholder="Write your solution here..."
                        />
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() =>
                            setShowSolution({
                              ...showSolution,
                              [`${currentSection}-${exercise.id}`]: !showSolution[
                                `${currentSection}-${exercise.id}`
                              ]
                            })
                          }
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          {showSolution[`${currentSection}-${exercise.id}`]
                            ? 'Hide'
                            : 'Show'}{' '}
                          Solution
                        </button>
                        <button
                          onClick={() => {
                            if (!completedExercises.includes(exercise.id)) {
                              setCompletedExercises([...completedExercises, exercise.id]);
                            }
                          }}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            completedExercises.includes(exercise.id)
                              ? 'bg-green-600 text-white'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {completedExercises.includes(exercise.id)
                            ? '✓ Completed'
                            : 'Mark as Complete'}
                        </button>
                      </div>

                      {showSolution[`${currentSection}-${exercise.id}`] && (
                        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Solution:
                          </p>
                          <pre className="text-sm overflow-x-auto text-gray-900 dark:text-white">
                            <code>{exercise.solution}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Navigation */}
                  <div className="flex justify-between gap-4">
                    <button
                      onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                      disabled={currentSection === 0}
                      className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentSection(
                          Math.min(lesson.sections.length - 1, currentSection + 1)
                        )
                      }
                      disabled={currentSection === lesson.sections.length - 1}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

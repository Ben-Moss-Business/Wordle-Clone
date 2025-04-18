import { useState, useEffect } from "react";
import words from "./words";
import "./App.css";

function App() {
  const Line = ({ guess, color }) => {
    return (
      <div className="line">
        {guess.map((letter, i) => (
          <div key={i} className={`tile ${color?.[i] || ""}`}>
            {letter}
          </div>
        ))}
      </div>
    );
  };

  const Keyboard = ({ onKeyPress, keyColors, disabled }) => {
    const keys = [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"],
    ];

    return (
      <div className="keyboard">
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((key) => (
              <button
                key={key}
                className={`key ${keyColors[key] || ""}`}
                onClick={() => onKeyPress(key)}
                disabled={disabled}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const [solution, setSolution] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [colors, setColors] = useState([]);
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [keyColors, setKeyColors] = useState({});
  const [gameStatus, setGameStatus] = useState("playing");

  const initGame = () => {
    const word = words[Math.floor(Math.random() * words.length)].toUpperCase();
    console.log(word);
    setSolution(word);
    setGuesses(
      Array(6)
        .fill()
        .map(() => Array(5).fill(""))
    );
    setColors(
      Array(6)
        .fill()
        .map(() => Array(5).fill(""))
    );
    setCurrentGuessIndex(0);
    setCurrentLetterIndex(0);
    setKeyColors({});
    setGameStatus("playing");
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleKeyDown = (event) => {
    if (gameStatus !== "playing") return;

    const key = event.key || event;

    if (/^[a-zA-Z]$/.test(key)) {
      if (currentLetterIndex < 5) {
        const newGuesses = [...guesses];
        newGuesses[currentGuessIndex][currentLetterIndex] = key.toUpperCase();
        setGuesses(newGuesses);
        setCurrentLetterIndex(currentLetterIndex + 1);
      }
    }

    if (key === "Backspace") {
      if (currentLetterIndex > 0) {
        const newGuesses = [...guesses];
        newGuesses[currentGuessIndex][currentLetterIndex - 1] = "";
        setGuesses(newGuesses);
        setCurrentLetterIndex(currentLetterIndex - 1);
      }
    }

    if (key === "Enter") {
      if (currentLetterIndex === 5) {
        const currentGuess = guesses[currentGuessIndex].join("");
        const newColors = Array(5).fill("");
        const solutionArray = solution.split("");
        const newKeyColors = { ...keyColors };

        // Green pass
        for (let i = 0; i < 5; i++) {
          if (currentGuess[i] === solution[i]) {
            newColors[i] = "green";
            solutionArray[i] = null;
            newKeyColors[currentGuess[i]] = "green";
          }
        }

        // Yellow + Gray pass
        for (let i = 0; i < 5; i++) {
          if (!newColors[i]) {
            const index = solutionArray.indexOf(currentGuess[i]);
            if (index !== -1) {
              newColors[i] = "yellow";
              solutionArray[index] = null;
              if (newKeyColors[currentGuess[i]] !== "green") {
                newKeyColors[currentGuess[i]] = "yellow";
              }
            } else {
              if (!newKeyColors[currentGuess[i]]) {
                newKeyColors[currentGuess[i]] = "gray";
              }
            }
          }
        }

        const newColorsState = [...colors];
        newColorsState[currentGuessIndex] = newColors;
        setColors(newColorsState);
        setKeyColors(newKeyColors);

        if (currentGuess === solution) {
          setGameStatus("won");
        } else if (currentGuessIndex === 5) {
          setGameStatus("lost");
        } else {
          setCurrentGuessIndex(currentGuessIndex + 1);
          setCurrentLetterIndex(0);
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleVirtualKeyPress = (key) => {
    handleKeyDown({ key });
  };

  return (
    <div className="App">
      {guesses.map((guess, i) => (
        <Line key={i} guess={guess} color={colors[i]} />
      ))}
      <Keyboard
        onKeyPress={handleVirtualKeyPress}
        keyColors={keyColors}
        disabled={gameStatus !== "playing"}
      />

      {/* Overlay */}
      {gameStatus !== "playing" && (
        <div className="overlay">
          <div className="popup">
            {gameStatus === "won" ? (
              <h2>🎉 Smarty Pants! 🎉</h2>
            ) : (
              <>
                <h2>Game Over</h2>
                <p>
                  The word was: <strong>{solution}</strong>
                </p>
              </>
            )}
            <button onClick={initGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

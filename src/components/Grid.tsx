import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface BoardData {
  date: string;
  board: string[][];
}

interface WordsData {
  date: string;
  theme: string;
  spangram: string;
  words: string;
}

interface HintsData {
  date: string;
  words: string[];
}

interface DefinitionsData {
  [key: string]: string;
}

interface SelectedLetter {
  rowIndex: number;
  colIndex: number;
  letter: string;
}

interface FoundWord {
  word: string;
  letters: SelectedLetter[];
  isAnswer: boolean;
  usedForHint: boolean;
  isSpangram: boolean;
}

// Import JSON data
import boardData from "../../data/BOARD.json";
import wordsData from "../../data/WORDS.json";
import hintsData from "../../data/HINTS.json";
import definitionsData from "../../data/DEFINE.json";

export default function Grid() {
  const [, setShowHint] = useState<boolean>(false);
  const [selectedLetters, setSelectedLetters] = useState<SelectedLetter[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [previousHints, setPreviousHints] = useState<string[]>([]);
  const [hintProgress, setHintProgress] = useState<number>(0);
  const [availableHints, setAvailableHints] = useState<number>(0);
  const [usedHints, setUsedHints] = useState<number>(0);
  const [hasWon, setHasWon] = useState<boolean>(false);

  const hintProgressRef = useRef<number>(0);
  const availableHintsRef = useRef<number>(0);
  const usedHintsRef = useRef<number>(0);

  const [usedHintIndices, setUsedHintIndices] = useState<number[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const grid = useMemo(() => (boardData as BoardData).board, []);
  const validWords = useMemo(
    () => (wordsData as WordsData).words.split(", "),
    []
  );
  const spangram = useMemo(() => (wordsData as WordsData).spangram, []);
  const theme = useMemo(() => (wordsData as WordsData).theme, []);
  const hintWords = useMemo(() => (hintsData as HintsData).words, []);
  const definitions = useMemo(() => definitionsData as DefinitionsData, []);

  const remainingAnswerWords = useMemo(() => {
    const foundAnswerWords = new Set(
      foundWords.filter((fw) => fw.isAnswer).map((fw) => fw.word)
    );
    return validWords.filter((word) => !foundAnswerWords.has(word));
  }, [validWords, foundWords]);

  const isAdjacent = (
    prev: SelectedLetter,
    current: SelectedLetter
  ): boolean => {
    const rowDiff = Math.abs(prev.rowIndex - current.rowIndex);
    const colDiff = Math.abs(prev.colIndex - current.colIndex);
    return rowDiff <= 1 && colDiff <= 1 && rowDiff + colDiff > 0;
  };

  useEffect(() => {
    if (remainingAnswerWords.length === 0) {
      setHasWon(true);
    }
  }, [remainingAnswerWords]);

  const handleDragStart = useCallback(
    (rowIndex: number, colIndex: number) => {
      setIsDragging(true);
      setSelectedLetters([
        { rowIndex, colIndex, letter: grid[rowIndex][colIndex] },
      ]);
    },
    [grid]
  );

  const handleDrag = useCallback(
    (rowIndex: number, colIndex: number) => {
      if (isDragging) {
        setSelectedLetters((prev) => {
          const lastSelected = prev[prev.length - 1];
          const newLetter = {
            rowIndex,
            colIndex,
            letter: grid[rowIndex][colIndex],
          };

          if (
            prev
              .slice(0, -1)
              .some(
                (letter) =>
                  letter.rowIndex === rowIndex && letter.colIndex === colIndex
              )
          ) {
            return prev;
          }

          if (!isAdjacent(lastSelected, newLetter)) {
            return prev;
          }

          return [...prev, newLetter];
        });
      }
    },
    [isDragging, grid]
  );

  const canEarnMoreHints = useCallback(() => {
    return availableHintsRef.current + usedHintsRef.current < 3;
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    const word = selectedLetters.map((item) => item.letter).join("");

    if (word === spangram && !foundWords.some((fw) => fw.word === word)) {
      // Handle Spangram
      setFoundWords((prev) => [
        ...prev,
        {
          word,
          letters: selectedLetters,
          isAnswer: true,
          usedForHint: false,
          isSpangram: true,
        },
      ]);
      console.log(`Spangram found: ${word}`);
    } else if (
      validWords.includes(word) &&
      !foundWords.some((fw) => fw.word === word)
    ) {
      // Handle regular answer words
      setFoundWords((prev) => [
        ...prev,
        {
          word,
          letters: selectedLetters,
          isAnswer: true,
          usedForHint: false,
          isSpangram: false,
        },
      ]);
      console.log(`Answer word found: ${word}`);
    } else if (
      hintWords.includes(word) &&
      !foundWords.some((fw) => fw.word === word)
    ) {
      // Handle hint words
      setFoundWords((prev) => [
        ...prev,
        {
          word,
          letters: selectedLetters,
          isAnswer: false,
          usedForHint: false,
          isSpangram: false,
        },
      ]);
      if (canEarnMoreHints()) {
        hintProgressRef.current += 1;
        console.log(`Hint progress: ${hintProgressRef.current}/3`);

        if (hintProgressRef.current === 3) {
          availableHintsRef.current = Math.min(
            availableHintsRef.current + 1,
            3 - usedHintsRef.current
          );
          console.log(
            `New hint available. Total available: ${availableHintsRef.current}`
          );
          hintProgressRef.current = 0;
        }

        setHintProgress(hintProgressRef.current);
        setAvailableHints(availableHintsRef.current);
      } else {
        console.log("Cannot earn more hints. Limit reached.");
      }
      console.log(`Hint word found: ${word}`);
    }
    setSelectedLetters([]);
  }, [
    selectedLetters,
    validWords,
    hintWords,
    foundWords,
    spangram,
    canEarnMoreHints,
  ]);

  const isLetterSelected = useCallback(
    (rowIndex: number, colIndex: number): boolean => {
      return selectedLetters.some(
        (item) => item.rowIndex === rowIndex && item.colIndex === colIndex
      );
    },
    [selectedLetters]
  );

  const isLetterInFoundWord = useCallback(
    (rowIndex: number, colIndex: number): string | false => {
      const foundWord = foundWords.find(
        (fw) =>
          fw.isAnswer &&
          fw.letters.some(
            (letter) =>
              letter.rowIndex === rowIndex && letter.colIndex === colIndex
          )
      );
      if (foundWord) {
        return foundWord.isSpangram ? "spangram" : "answer";
      }
      return false;
    },
    [foundWords]
  );

  const getRandomHint = useCallback(() => {
    if (remainingAnswerWords.length === 0) {
      return spangram
        ? "Only the Spangram remains!"
        : "Congratulations! You've found all the words!";
    }
    if (
      remainingAnswerWords.length === 1 &&
      remainingAnswerWords[0] === spangram
    ) {
      return "Only the Spangram remains!";
    }

    const unusedWords = remainingAnswerWords.filter(
      (_, index) => !usedHintIndices.includes(index)
    );
    if (unusedWords.length === 0) {
      return "All available hints have been used!";
    }

    const randomIndex = Math.floor(Math.random() * unusedWords.length);
    const randomWord = unusedWords[randomIndex];
    const originalIndex = remainingAnswerWords.indexOf(randomWord);
    setUsedHintIndices((prev) => [...prev, originalIndex]);

    return `${definitions[randomWord]}`;
  }, [remainingAnswerWords, spangram, definitions, usedHintIndices]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, handleDragEnd]);

  const getButtonPosition = (rowIndex: number, colIndex: number) => {
    if (!gridRef.current) return { x: 0, y: 0, width: 0, height: 0 };
    const button = gridRef.current.querySelector(
      `#button-${rowIndex}-${colIndex}`
    );
    if (!button) return { x: 0, y: 0, width: 0, height: 0 };
    const rect = button.getBoundingClientRect();
    const gridRect = gridRef.current.getBoundingClientRect();
    return {
      x: rect.left - gridRect.left,
      y: rect.top - gridRect.top,
      width: rect.width,
      height: rect.height,
    };
  };

  const clearSVG = useCallback(() => {
    const svg = svgRef.current;
    if (svg) {
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
    }
  }, []);

  const drawLine = useCallback(
    (
      letters: SelectedLetter[],
      color: string,
      isFound: boolean = false,
      isSpangram: boolean = false
    ) => {
      const svg = svgRef.current;
      if (!svg) return;

      letters.forEach((letter, index) => {
        if (index === 0) return;
        const prev = letters[index - 1];
        const {
          x: x1,
          y: y1,
          width,
          height,
        } = getButtonPosition(prev.rowIndex, prev.colIndex);
        const { x: x2, y: y2 } = getButtonPosition(
          letter.rowIndex,
          letter.colIndex
        );

        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        line.setAttribute("x1", String(x1 + width / 2));
        line.setAttribute("y1", String(y1 + height / 2));
        line.setAttribute("x2", String(x2 + width / 2));
        line.setAttribute("y2", String(y2 + height / 2));
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", "10");
        line.setAttribute("stroke-linecap", "round");
        line.setAttribute("stroke-linejoin", "round");
        line.setAttribute(
          "class",
          isFound
            ? isSpangram
              ? "found-spangram-line"
              : "found-word-line"
            : "current-word-line"
        );

        svg.appendChild(line);
      });
    },
    [getButtonPosition]
  );

  useEffect(() => {
    clearSVG();
    foundWords.forEach((fw) => {
      if (fw.isAnswer) {
        drawLine(
          fw.letters,
          fw.isSpangram ? "var(--game_red)" : "var(--game_blue)",
          true,
          fw.isSpangram
        );
      }
    });
    if (selectedLetters.length >= 2) {
      drawLine(selectedLetters, "var(--game_green)", false);
    }
  }, [selectedLetters, foundWords, clearSVG, drawLine]);

  const handleUseHint = useCallback(() => {
    if (availableHintsRef.current > 0) {
      const hint = getRandomHint();
      setPreviousHints((prev) => [...prev, hint]);
      usedHintsRef.current += 1;
      availableHintsRef.current -= 1;
      setUsedHints(usedHintsRef.current);
      setAvailableHints(availableHintsRef.current);
      setShowHint(true);
    }
  }, [getRandomHint]);

  const handleTouchStart = useCallback(
    (rowIndex: number, colIndex: number) => {
      setIsDragging(true);
      setSelectedLetters([
        { rowIndex, colIndex, letter: grid[rowIndex][colIndex] },
      ]);
    },
    [grid]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (isDragging && gridRef.current) {
        const touch = event.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.id.startsWith('button-')) {
          const [, rowIndex, colIndex] = element.id.split('-').map(Number);
          handleDrag(rowIndex, colIndex);
        }
      }
    },
    [isDragging, handleDrag]
  );

  useEffect(() => {
    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    window.addEventListener('touchend', handleGlobalTouchEnd);
    return () => {
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, handleDragEnd]);

  return (
    <div className="container mx-auto p-2 sm:p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4 text-center"></h1>

      <Card className="mb-4 sm:mb-6 w-full mx-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-primary text-center">
            Today's Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl md:text-3xl text-center font-bold text-gameGreen">
            {theme}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center prevent-select">
        <div className="mb-2 sm:mb-4 h-8 sm:h-12 flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold">
          {hasWon ? (
            <span className="text-gameRed">You win!</span>
          ) : (
            <span className="text-gameBlue">
              {selectedLetters.map((letter) => letter.letter).join("")}
            </span>
          )}
        </div>

        <div
          className="grid grid-cols-6 gap-1 sm:gap-2 mb-4 sm:mb-6 justify-center relative touch-none"
          ref={gridRef}
          onTouchMove={handleTouchMove}
        >
          <svg
            ref={svgRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
          {grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="flex items-center justify-center"
              >
                <Button
                  id={`button-${rowIndex}-${colIndex}`}
                  variant="ghost"
                  className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full text-base sm:text-lg md:text-2xl p-0 flex items-center justify-center border-0 hover:bg-parent hover:text-primary-background z-10
                    transition-colors duration-100 ease-in-out
                    ${(() => {
                      const foundStatus = isLetterInFoundWord(
                        rowIndex,
                        colIndex
                      );
                      if (foundStatus === "spangram") return "gameRed";
                      if (foundStatus === "answer") return "gameBlue";
                      return isLetterSelected(rowIndex, colIndex)
                        ? "gameGreen"
                        : "bg-secondary";
                    })()}`}
                  onMouseDown={() => handleDragStart(rowIndex, colIndex)}
                  onMouseEnter={() => handleDrag(rowIndex, colIndex)}
                  onTouchStart={() => handleTouchStart(rowIndex, colIndex)}
                  style={{ outline: "none" }}
                  aria-label={`${letter} at row ${rowIndex + 1}, column ${
                    colIndex + 1
                  }`}
                >
                  {letter}
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="w-full flex flex-col sm:flex-row items-center justify-between mb-4 space-y-4 sm:space-y-0">
          <div className="w-full sm:w-1/3">
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-center sm:text-left">
              Hint Progress
            </h3>
            <Progress value={(hintProgress / 3) * 100} className="w-full" />
          </div>
          <div className="flex flex-col items-center">
            <Button
              style={{ outline: "none" }}
              className="prevent-select mb-1 sm:mb-2 hover:bg-parent hover:text-primary-background"
              onClick={handleUseHint}
              disabled={availableHints === 0 || hasWon}
            >
              Claim Hint
            </Button>
            <small className="font-bold text-center">
              {3-usedHints} Hints Left!
            </small>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-around mt-4 sm:mt-6 space-y-2 sm:space-y-0 sm:space-x-4">
          {[1, 2, 3].map((hintNumber) => (
            <HoverCard key={hintNumber}>
              <HoverCardTrigger className="w-full sm:w-auto" asChild>
                <Button variant="outline" className="w-full sm:w-auto">Hint {hintNumber}</Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 sm:w-80">
                {previousHints[hintNumber - 1] ? (
                  <p>{previousHints[hintNumber - 1]}</p>
                ) : (
                  <p>Use the "Claim Hint" button to reveal this hint.</p>
                )}
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
    </div>
  );
}
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

interface HintCardProps {
  hintNumber: number;
}

// Import JSON data
import boardData from "../../data/BOARD.json";
import wordsData from "../../data/WORDS.json";
import hintsData from "../../data/HINTS.json";
import definitionsData from "../../data/DEFINE.json";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";

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
  const [allWordsFoundExceptSpangram, setAllWordsFoundExceptSpangram] = useState<boolean>(false);
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
      foundWords.filter((fw) => fw.isAnswer && !fw.isSpangram).map((fw) => fw.word)
    );
    return validWords.filter((word) => word !== spangram && !foundAnswerWords.has(word));
  }, [validWords, foundWords, spangram]);

  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const HintCard: React.FC<HintCardProps> = ({ hintNumber }) => {
    const content = (
      <div className="w-64 sm:w-72 md:w-80 p-4 bg-white dark:bg-gray-800 rounded-md shadow-md">
        {previousHints[hintNumber - 1] ? (
          <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
            {previousHints[hintNumber - 1]}
          </p>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Use the "Claim Hint" button to reveal this hint.
          </p>
        )}
      </div>
    );

    if (isMobile) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full">Hint {hintNumber}</Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 bg-transparent border-none shadow-none">
            {content}
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">Hint {hintNumber}</Button>
        </HoverCardTrigger>
        <HoverCardContent className="p-0 bg-transparent border-none shadow-none">
          {content}
        </HoverCardContent>
      </HoverCard>
    );
  };

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

  const isSpangramFound = useMemo(() => 
    foundWords.some(fw => fw.isSpangram),
    [foundWords]
  );

  useEffect(() => {
    if (remainingAnswerWords.length === 0 && !isSpangramFound) {
      setAllWordsFoundExceptSpangram(true);
    } else {
      setAllWordsFoundExceptSpangram(false);
    }

    if (remainingAnswerWords.length === 0 && isSpangramFound) {
      setHasWon(true);
    } else {
      setHasWon(false);
    }
  }, [remainingAnswerWords, isSpangramFound]);
  
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
    if (allWordsFoundExceptSpangram) {
      return "Only the Spangram remains! It uses all 7 letters.";
    }
    if (hasWon) {
      return "Congratulations! You've found all the words and the Spangram!";
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
  }, [remainingAnswerWords, allWordsFoundExceptSpangram, hasWon, definitions, usedHintIndices]);

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

  const getButtonPosition = useCallback((rowIndex: number, colIndex: number) => {
    if (!gridRef.current) return { x: 0, y: 0, width: 0, height: 0 };
    const button = gridRef.current.querySelector(
      `#button-${rowIndex}-${colIndex}`
    ) as HTMLElement;
    if (!button) return { x: 0, y: 0, width: 0, height: 0 };
    const rect = button.getBoundingClientRect();
    const gridRect = gridRef.current.getBoundingClientRect();
    return {
      x: rect.left - gridRect.left,
      y: rect.top - gridRect.top,
      width: rect.width,
      height: rect.height,
    };
  }, []);

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
      if (!svg || !gridRef.current) return;

      const gridRect = gridRef.current.getBoundingClientRect();
      svg.setAttribute('width', gridRect.width.toString());
      svg.setAttribute('height', gridRect.height.toString());

      letters.forEach((letter, index) => {
        if (index === 0) return;
        const prev = letters[index - 1];
        const { x: x1, y: y1, width: w1, height: h1 } = getButtonPosition(prev.rowIndex, prev.colIndex);
        const { x: x2, y: y2, width: w2, height: h2 } = getButtonPosition(letter.rowIndex, letter.colIndex);

        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        line.setAttribute("x1", String(x1 + w1 / 2));
        line.setAttribute("y1", String(y1 + h1 / 2));
        line.setAttribute("x2", String(x2 + w2 / 2));
        line.setAttribute("y2", String(y2 + h2 / 2));
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", "9");
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

  const currentDate = useMemo(() => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  return (
    <div className="container mx-1/ p-2 sm:p-4 max-w-4xl">
      <Card className="mb-4 sm:mb-6 w-full mx-auto overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r bg-[#2e346d] text-white">
          <div className="relative">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-2">
              Today's Theme
            </CardTitle>
            <p className="text-center text-sm sm:text-base  text-indigo-100 font-medium ">
              {currentDate}
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-4 px-4 bg-gradient-to-b bg-indigo-10 white ">
          <p className="text-xl sm:text-2xl md:text-3xl text-center font-bold text-transparent bg-clip-text bg-gradient-to-r text-gameGreen">
            {theme}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center select-none">
        <div className="mb-2 sm:mb-4 h-8 sm:h-12 flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold">
          {hasWon ? (
            <span className="text-gameRed">You win!</span>
          ) : allWordsFoundExceptSpangram ? (
            <span className="text-gameGreen">Find the Spangram!</span>
          ) : (
            <span className="text-gameBlue">
              {selectedLetters.map((letter) => letter.letter).join("")}
            </span>
          )}
        </div>

        <div className="relative">
        <svg
          ref={svgRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
        />
        <div
          className="grid grid-cols-6 gap-1 sm:gap-2 mb-4 sm:mb-6 w-full max-w-[360px] sm:max-w-[480px] mx-auto touch-none"
          ref={gridRef}
          onTouchMove={handleTouchMove}
        >
          {grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => (
              <Button
                key={`${rowIndex}-${colIndex}`}
                id={`button-${rowIndex}-${colIndex}`}
                variant="ghost"
                className={`rounded-full flex items-center justify-center border-0 hover:bg-parent hover:text-primary-background transition-colors duration-100 ease-in-out aspect-square text-sm sm:text-base md:text-lg font-bold p-0 z-20 relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12

                  ${(() => {
                    const foundStatus = isLetterInFoundWord(rowIndex, colIndex);
                    if (foundStatus === "spangram") return "gameRed";
                    if (foundStatus === "answer") return "gameBlue";
                    return isLetterSelected(rowIndex, colIndex) ? "gameGreen" : "bg-secondary";
                  })()}`}
                onMouseDown={() => handleDragStart(rowIndex, colIndex)}
                onMouseEnter={() => handleDrag(rowIndex, colIndex)}
                onTouchStart={() => handleTouchStart(rowIndex, colIndex)}
                aria-label={`${letter} at row ${rowIndex + 1}, column ${colIndex + 1}`}
              >
                {letter}
              </Button>
            ))
          )}
        </div>
      </div>

        <div className="w-4/5 flex flex-col sm:flex-row items-center justify-between mb-4 space-y-4 sm:space-y-0 sm:space-x-4 z-20">
          <div className="w-full sm:w-1/3">
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-center sm:text-left">
              Hint Progress
            </h3>
            <Progress value={(hintProgress / 3) * 100} className="w-full" />
          </div>
          <div className="flex flex-col items-center">
            <Button
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

        <div className="flex flex-col sm:flex-row justify-center mt-4 sm:mt-6 space-y-2 sm:space-y-0 sm:space-x-4 w-full z-20">
        {[1, 2, 3].map((hintNumber) => (
          <HintCard key={hintNumber} hintNumber={hintNumber} />
        ))}
      </div>
      </div>
    </div>
  ); 
}
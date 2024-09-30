import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

interface SelectedLetter {
  rowIndex: number;
  colIndex: number;
  letter: string;
}

interface FoundWord {
  word: string;
  letters: SelectedLetter[];
}

export default function Grid() {
  const [showHint, setShowHint] = useState<boolean>(false);
  const [selectedLetters, setSelectedLetters] = useState<SelectedLetter[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Example grid of letters (8x6)
  const grid = useMemo(() => [
    ["E", "O", "L", "A", "T", "I"],
    ["V", "G", "R", "S", "T", "U"],
    ["I", "N", "E", "I", "S", "D"],
    ["P", "P", "H", "T", "O", "E"],
    ["E", "A", "O", "E", "N", "S"],
    ["I", "M", "X", "P", "L", "A"],
    ["T", "C", "N", "T", "E", "S"],
    ["E", "M", "E", "E", "R", "U"],
  ], []);

  const validWords = useMemo(() => ["EMOTIONS","EXCITEMENT", "GRATITUDE", "HAPPINESS", "LOVE","PLEASURE"], []);

  const isAdjacent = (prev: SelectedLetter, current: SelectedLetter): boolean => {
    const rowDiff = Math.abs(prev.rowIndex - current.rowIndex);
    const colDiff = Math.abs(prev.colIndex - current.colIndex);
    return (rowDiff <= 1 && colDiff <= 1) && (rowDiff + colDiff > 0);
  };

  const handleDragStart = useCallback((rowIndex: number, colIndex: number) => {
    if (!isLetterInFoundWord(rowIndex, colIndex)) {
      setIsDragging(true);
      setSelectedLetters([{ rowIndex, colIndex, letter: grid[rowIndex][colIndex] }]);
    }
  }, [grid]);

  const handleDrag = useCallback((rowIndex: number, colIndex: number) => {
    if (isDragging && !isLetterInFoundWord(rowIndex, colIndex)) {
      setSelectedLetters(prev => {
        const lastSelected = prev[prev.length - 1];
        const newLetter = { rowIndex, colIndex, letter: grid[rowIndex][colIndex] };

        if (prev.slice(0, -1).some(letter => letter.rowIndex === rowIndex && letter.colIndex === colIndex)) {
          return prev;
        }

        if (!isAdjacent(lastSelected, newLetter)) {
          return prev;
        }

        return [...prev, newLetter];
      });
    }
  }, [isDragging, grid]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    const word = selectedLetters.map((item) => item.letter).join("");
    if (validWords.includes(word) && !foundWords.some(fw => fw.word === word)) {
      setFoundWords(prev => [...prev, { word, letters: selectedLetters }]);
      console.log(`Valid word found: ${word}`);
    } 
    // Force a re-render to update the button colors immediately
    setSelectedLetters([]);
  }, [selectedLetters, validWords, foundWords]);

  const isLetterSelected = useCallback((rowIndex: number, colIndex: number): boolean => {
    return selectedLetters.some(item => item.rowIndex === rowIndex && item.colIndex === colIndex);
  }, [selectedLetters]);

  const isLetterInFoundWord = useCallback((rowIndex: number, colIndex: number): boolean => {
    return foundWords.some(fw => 
      fw.letters.some(letter => letter.rowIndex === rowIndex && letter.colIndex === colIndex)
    );
  }, [foundWords]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, handleDragEnd]);

  const getButtonPosition = (rowIndex: number, colIndex: number) => {
    if (!gridRef.current) return { x: 0, y: 0, width: 0, height: 0 };
    const button = gridRef.current.querySelector(`#button-${rowIndex}-${colIndex}`);
    if (!button) return { x: 0, y: 0, width: 0, height: 0 };
    const rect = button.getBoundingClientRect();
    const gridRect = gridRef.current.getBoundingClientRect();
    return {
      x: rect.left - gridRect.left,
      y: rect.top - gridRect.top,
      width: rect.width,
      height: rect.height
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

  const drawLine = useCallback((letters: SelectedLetter[], color: string, isFound: boolean = false) => {
    const svg = svgRef.current;
    if (!svg) return;

    letters.forEach((letter, index) => {
      if (index === 0) return;
      const prev = letters[index - 1];
      const { x: x1, y: y1, width, height } = getButtonPosition(prev.rowIndex, prev.colIndex);
      const { x: x2, y: y2 } = getButtonPosition(letter.rowIndex, letter.colIndex);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x1 + width / 2));
      line.setAttribute('y1', String(y1 + height / 2));
      line.setAttribute('x2', String(x2 + width / 2));
      line.setAttribute('y2', String(y2 + height / 2));
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', '10');
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('stroke-linejoin', 'round');
      if (isFound) {
        line.setAttribute('class', 'found-word-line');
      }

      svg.appendChild(line);
    });
  }, [getButtonPosition]);

  useEffect(() => {
    clearSVG();

    // Draw lines for found words
    foundWords.forEach(fw => drawLine(fw.letters, 'var(--game_blue)', true));

    // Draw line for current selection
    if (selectedLetters.length >= 2) {
      drawLine(selectedLetters, 'var(--game_green)');
    }
  }, [selectedLetters, foundWords, clearSVG, drawLine]);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4 text-center">Strands Clone</h1>

      <Card className="mb-6 w-full mx-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-4xl font-extrabold text-primary text-center">
            Today's Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl text-center">Positive Emotions</p>
        </CardContent>
      </Card>

      <div className="flex justify-between prevent-select">
        <div className="grid grid-cols-6 gap-3 mb-6 justify-center relative" ref={gridRef}>
          <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
          {grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="flex items-center justify-center"
              >
                <Button
                  id={`button-${rowIndex}-${colIndex}`}
                  variant="ghost"
                  className={`w-12 h-12 rounded-full text-2xl p-0 flex items-center justify-center border-0 hover:bg-parent hover:text-primary-background z-10 disabled:opacity-100 disabled:cursor-not-allowed
                    transition-colors duration-100 ease-in-out disabled:0
                    ${isLetterInFoundWord(rowIndex, colIndex) ? 'gameBlue' :
                      isLetterSelected(rowIndex, colIndex) ? 'gameGreen' : 'bg-secondary'}`}
                  onMouseDown={() => handleDragStart(rowIndex, colIndex)}
                  onMouseEnter={() => {handleDrag(rowIndex, colIndex);}}
                  style={{ outline: 'none' }}
                  aria-label={`${letter} at row ${rowIndex + 1}, column ${colIndex + 1}`}
                  disabled={isLetterInFoundWord(rowIndex, colIndex)}
                >
                  {letter}
                </Button>
              </div>
            ))
          )}
        </div>

        <Card className="ml-6 w-48">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Found Words</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {foundWords.map((fw, index) => (
                <li key={index} className="text-lg">{fw.word}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-6">
        <Button style={{ outline: 'none' }} className ="prevent-select" onClick={() => setShowHint(!showHint) }>
          {showHint ? "Hide Hint" : "Show Hint"}
        </Button>
      </div>

      {showHint && (
        <Card className="mt-4 w-fit mx-auto">
          <CardContent>
            <p>Here's a hint: Look for words related to positive emotions in the grid!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
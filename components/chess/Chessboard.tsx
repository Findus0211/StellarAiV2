import React, { useState, useMemo } from 'react';
import { Chess } from 'chess.js';
import type { Square, Piece } from 'chess.js';
import ChessPiece from './Piece.tsx';

interface ChessboardProps {
  fen: string;
  onMove: (from: string, to: string) => void;
  playerColor: 'w' | 'b';
  isAiThinking: boolean;
}

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

const Chessboard: React.FC<ChessboardProps> = ({ fen, onMove, playerColor, isAiThinking }) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  const game = useMemo(() => new Chess(fen), [fen]);
  const board = useMemo(() => game.board(), [game]);

  const validMoves = useMemo(() => {
    if (!selectedSquare) return [];
    return game.moves({ square: selectedSquare, verbose: true }).map(move => move.to);
  }, [selectedSquare, game]);

  const handleSquareClick = (square: Square) => {
    if (isAiThinking) return;

    if (selectedSquare) {
      if (square === selectedSquare) {
        setSelectedSquare(null); // Deselect
        return;
      }

      const isMoveValid = validMoves.includes(square);
      if (isMoveValid) {
        onMove(selectedSquare, square);
        setSelectedSquare(null);
      } else {
        const piece = game.get(square);
        if (piece && piece.color === playerColor) {
          setSelectedSquare(square); // Select another piece
        } else {
          setSelectedSquare(null); // Deselect
        }
      }
    } else {
      const piece = game.get(square);
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
      }
    }
  };

  const displayRanks = playerColor === 'w' ? [...ranks].reverse() : ranks;
  const displayFiles = playerColor === 'w' ? files : [...files].reverse();

  const getPieceAt = (rank: string, file: string): Piece | null => {
      const square = `${file}${rank}` as Square;
      return game.get(square);
  }

  return (
    <div className="aspect-square w-full max-w-[calc(100vh-6rem)] shadow-2xl relative">
      {isAiThinking && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        </div>
      )}
      {displayRanks.map((rank, i) => (
        <div key={rank} className="flex">
          {displayFiles.map((file, j) => {
            const square = `${file}${rank}` as Square;
            const isLight = (i + j) % 2 !== 0;
            const isSelected = selectedSquare === square;
            const isPossibleMove = validMoves.includes(square);
            const piece = getPieceAt(rank, file);

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                className={`w-[12.5%] aspect-square flex items-center justify-center relative ${isLight ? 'bg-gray-400' : 'bg-gray-700'}`}
              >
                {isSelected && <div className="absolute inset-0 bg-yellow-500/50"></div>}
                
                <div className="w-full h-full cursor-pointer">
                    {piece && <ChessPiece piece={piece.type} color={piece.color} />}
                </div>

                {isPossibleMove && (
                    <div className="absolute w-1/3 h-1/3 bg-black/30 rounded-full"></div>
                )}

              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Chessboard;
import React from 'react';
import type { PieceSymbol, Color } from 'chess.js';
import { PIECE_SVGS } from './pieces';

interface PieceProps {
  piece: PieceSymbol;
  color: Color;
}

const ChessPiece: React.FC<PieceProps> = ({ piece, color }) => {
  const pieceKey = `${color}${piece.toUpperCase()}`;
  const SvgComponent = PIECE_SVGS[pieceKey as keyof typeof PIECE_SVGS];

  if (!SvgComponent) {
    return null;
  }
  
  return (
    <div
      className="w-full h-full"
      dangerouslySetInnerHTML={{ __html: SvgComponent }}
      style={{
        filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3))'
      }}
    />
  );
};

export default ChessPiece;
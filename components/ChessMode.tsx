import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chess } from 'chess.js';
import { GoogleGenAI } from '@google/genai';
import Chessboard from './chess/Chessboard.tsx';

type PlayerColor = 'w' | 'b';

const ChessMode: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [elo, setElo] = useState(800);
  const [history, setHistory] = useState<{ san: string }[]>([]);
  const [playerColor, setPlayerColor] = useState<PlayerColor>('w');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [status, setStatus] = useState("White's turn to move.");
  const [showNewGameDialog, setShowNewGameDialog] = useState(true);

  const updateStatus = useCallback((currentGame: Chess) => {
    let newStatus = '';
    const turn = currentGame.turn() === 'w' ? 'White' : 'Black';

    if (currentGame.isCheckmate()) {
      newStatus = `Checkmate! ${turn === 'White' ? 'Black' : 'White'} wins.`;
    } else if (currentGame.isDraw()) {
      newStatus = 'Draw!';
    } else if (currentGame.isStalemate()) {
      newStatus = 'Stalemate!';
    } else if (currentGame.isThreefoldRepetition()) {
        newStatus = 'Draw by threefold repetition!';
    } else {
      newStatus = `${turn}'s turn to move.`;
      if (currentGame.isCheck()) {
        newStatus += ' (in check)';
      }
    }
    setStatus(newStatus);
  }, []);

  const getAiMove = useCallback(async () => {
    setIsAiThinking(true);
    
    // Use the `game` from state, but create a copy for mutation
    const gameCopy = new Chess(game.fen());
    const pgn = gameCopy.pgn();
    const currentFen = gameCopy.fen();
    
    const prompt = `You are a chess engine. Your ELO rating is ${elo}.
The current board state in FEN is: ${currentFen}
The game history in PGN is: ${pgn}
It is your turn to move. Your color is ${gameCopy.turn() === 'w' ? 'white' : 'black'}.
Analyze the position and provide your best move in Standard Algebraic Notation (SAN).
Respond with ONLY the move in SAN format (e.g., "e4", "Nf3", "O-O"). Do not add any explanation or commentary.`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      let validMoveFound = false;
      for (let i = 0; i < 3; i++) { // Retry up to 3 times for a valid move
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.3 }
        });
        const move = response.text.trim();

        try {
            const result = gameCopy.move(move); // Mutate the copy
            if (result) {
                validMoveFound = true;
                break;
            }
        } catch (e) {
            console.warn(`AI suggested invalid move: ${move}. Retrying...`);
        }
      }

      if (validMoveFound) {
        setGame(gameCopy); // Update state with the mutated copy
        setFen(gameCopy.fen());
        setHistory(gameCopy.history({ verbose: true }));
        updateStatus(gameCopy);
      } else {
        setStatus("AI failed to provide a valid move. You can continue playing.");
      }

    } catch (error) {
      console.error("Error getting AI move:", error);
      setStatus("Error fetching AI move. Please try again.");
    } finally {
      setIsAiThinking(false);
    }
  }, [elo, game, updateStatus]);
  
  useEffect(() => {
    const isAiTurn = !showNewGameDialog && game.turn() !== playerColor && !game.isGameOver();
    if (isAiTurn) {
      const timer = setTimeout(() => getAiMove(), 500);
      return () => clearTimeout(timer);
    }
  }, [game, playerColor, showNewGameDialog, getAiMove]);


  const handleMove = (from: string, to: string) => {
    if (game.turn() !== playerColor || isAiThinking) return;

    const newGame = new Chess(game.fen());
    try {
      const move = newGame.move({ from, to, promotion: 'q' });
      if (move) {
        setGame(newGame);
        setFen(newGame.fen());
        setHistory(newGame.history({ verbose: true }));
        updateStatus(newGame);
      }
    } catch (e) {
        // Invalid move, do nothing
    }
  };
  
  const startNewGame = (color: PlayerColor) => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setHistory([]);
    setPlayerColor(color);
    updateStatus(newGame);
    setShowNewGameDialog(false);
  };
  
  const NewGameDialog = () => (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-4">Start a New Game</h2>
            <p className="text-gray-400 mb-6">Choose your side to begin.</p>
            <div className="flex justify-center gap-4">
                <button onClick={() => startNewGame('w')} className="px-8 py-3 bg-gray-200 text-gray-900 font-bold rounded hover:bg-white transition-colors">Play as White</button>
                <button onClick={() => startNewGame('b')} className="px-8 py-3 bg-gray-900 text-white font-bold rounded border border-gray-600 hover:bg-black transition-colors">Play as Black</button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-800 text-white p-4 gap-4">
       {showNewGameDialog && <NewGameDialog />}
       
      {/* Chessboard */}
      <div className="flex-1 flex items-center justify-center relative">
        <Chessboard 
            fen={fen} 
            onMove={handleMove}
            playerColor={playerColor}
            isAiThinking={isAiThinking}
        />
      </div>

      {/* Controls and Info */}
      <div className="w-full md:w-80 bg-gray-900 p-4 rounded-lg flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-center border-b border-gray-700 pb-3"><span className="text-blue-400">Stellar</span>Chess</h2>
        
        <div className="mb-4">
            <label htmlFor="elo-slider" className="block mb-2 font-semibold text-gray-300">AI Strength (ELO: {elo})</label>
            <input 
                id="elo-slider"
                type="range" 
                min="100" 
                max="1500" 
                step="100"
                value={elo}
                onChange={(e) => setElo(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
        </div>

        <div className="bg-gray-800 p-3 rounded-md mb-4 text-center">
            <p className="font-semibold text-lg">{status}</p>
        </div>

        <div className="flex-1 bg-gray-800 rounded-md p-2 overflow-y-auto">
            <ol className="list-decimal list-inside text-gray-300">
                {history.map((move, i) => (
                    i % 2 === 0 && (
                        <li key={i} className="px-2 py-1 flex">
                            <span className="w-6 mr-2 font-bold">{i / 2 + 1}.</span>
                            <span className="w-16">{history[i]?.san}</span>
                            {history[i+1] && <span className="w-16">{history[i+1]?.san}</span>}
                        </li>
                    )
                ))}
            </ol>
        </div>
        
        <button 
            onClick={() => setShowNewGameDialog(true)}
            className="mt-4 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
        >
            New Game
        </button>
      </div>
    </div>
  );
};

export default ChessMode;
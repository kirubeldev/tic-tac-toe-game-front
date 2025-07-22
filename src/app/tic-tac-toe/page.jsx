'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import TicTacToeBoard from '../../components/TicTacToeBoard';

const socket = io('http://localhost:4000');

export default function TicTacToe() {
  const [roomId, setRoomId] = useState('');
  const [gameState, setGameState] = useState(null);
  const [player, setPlayer] = useState(null);
  const [message, setMessage] = useState('Enter a room ID to join.');

  useEffect(() => {
    socket.on('playerAssignment', (symbol) => {
      setPlayer(symbol);
    });

    socket.on('gameState', (state) => {
      setGameState(state);
      if (state.status === 'playing' && state.players.length === 2) {
        setMessage('Game is in progress!');
      } else if (state.players.length < 2) {
        setMessage('Waiting for another player...');
      }
    });

    socket.on('roomFull', () => {
      setMessage('Room is full. Try another room.');
    });

    return () => {
      socket.off('playerAssignment');
      socket.off('gameState');
      socket.off('roomFull');
    };
  }, []);

  const joinRoom = () => {
    if (roomId) {
      socket.emit('joinTicTacToe', roomId);
      setMessage('Waiting for another player...');
    }
  };

  const makeMove = (index) => {
    if (gameState?.status === 'playing' && player === gameState.currentPlayer) {
      socket.emit('makeMove', { roomId, index });
    }
  };

  const restartGame = () => {
    socket.emit('restartTicTacToe', roomId);
    setMessage('Game restarted!');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Tic-Tac-Toe</h1>
      {!gameState || gameState.status === 'waiting' ? (
        <div className="flex flex-col items-center">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            className="p-2 border rounded mb-2"
          />
          <button
            onClick={joinRoom}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Join Room
          </button>
          <p className="mt-2 text-gray-600">{message}</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-2">You are: {player}</p>
          <p className="mb-4 text-lg font-semibold">
            Score - Player X: {gameState.scores.X} / Player O: {gameState.scores.O}
          </p>
          <TicTacToeBoard board={gameState.board} onMove={makeMove} />
          {gameState.status === 'finished' && (
            <>
              <p className="mt-4 text-xl">
                {gameState.winner === 'draw' ? 'Game is a draw!' : `Winner: ${gameState.winner}`}
              </p>
              <button
                onClick={restartGame}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Restart Game
              </button>
            </>
          )}
          <p className="mt-2 text-gray-600">{message}</p>
        </div>
      )}
    </div>
  );
}
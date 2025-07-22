'use client'; // Mark as client component

import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import DrawGuessCanvas from '../../components/DrawGuessCanvas';

const socket = io('http://localhost:4000');

export default function DrawGuess() {
  const [roomId, setRoomId] = useState('');
  const [gameState, setGameState] = useState(null);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('Enter a room ID to join.');

  useEffect(() => {
    socket.on('gameState', (state) => {
      setGameState(state);
    });

    socket.on('draw', (data) => {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(data.prevX, data.prevY);
      ctx.lineTo(data.x, data.y);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
    });

    socket.on('correctGuess', (playerId) => {
      setMessage(`Player ${playerId} guessed correctly!`);
    });

    socket.on('roomFull', () => {
      setMessage('Room is full. Try another room.');
    });

    return () => {
      socket.off('gameState');
      socket.off('draw');
      socket.off('correctGuess');
      socket.off('roomFull');
    };
  }, []);

  const joinRoom = () => {
    if (roomId) {
      socket.emit('joinDrawGuess', roomId);
      setMessage('Waiting for enough players...');
    }
  };

  const submitGuess = () => {
    if (guess && gameState?.status === 'playing' && socket.id !== gameState.currentDrawer) {
      socket.emit('guess', { roomId, guess });
      setGuess('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Drawing & Guessing</h1>
      {!gameState ? (
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
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <DrawGuessCanvas
              isDrawer={socket.id === gameState.currentDrawer}
              socket={socket}
              roomId={roomId}
            />
            {socket.id === gameState.currentDrawer && (
              <p className="mt-2 text-xl">Draw: {gameState.word}</p>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">Guesses</h3>
            <ul className="mb-4">
              {gameState.guesses.map((g, i) => (
                <li key={i}>
                  Player {g.player.slice(0, 4)}: {g.guess}
                </li>
              ))}
            </ul>
            {socket.id !== gameState.currentDrawer && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Your guess"
                  className="p-2 border rounded"
                />
                <button
                  onClick={submitGuess}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Guess
                </button>
              </div>
            )}
            <p className="mt-2 text-gray-600">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
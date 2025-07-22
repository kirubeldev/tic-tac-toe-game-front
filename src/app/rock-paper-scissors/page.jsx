'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

export default function RockPaperScissors() {
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');
  const [gameState, setGameState] = useState(null);
  const [choice, setChoice] = useState(null);
  const [message, setMessage] = useState('Enter your name and room ID to join.');

  useEffect(() => {
    socket.on('gameState', (state) => {
      setGameState(state);
      if (state.status === 'playing' && state.players.length === 2) {
        setMessage('Make your choice!');
      } else if (state.players.length < 2) {
        setMessage('Waiting for another player...');
      }
    });

    socket.on('roomFull', () => {
      setMessage('Room is full. Try another room.');
    });

    if (roomId && name) {
      socket.emit('joinRockPaperScissors', { roomId, name });
    }

    return () => {
      socket.off('gameState');
      socket.off('roomFull');
    };
  }, [roomId, name]);

  const joinRoom = () => {
    if (roomId && name) {
      socket.emit('joinRockPaperScissors', { roomId, name });
      setMessage('Waiting for another player...');
    } else {
      setMessage('Please enter both a name and room ID.');
    }
  };

  const makeChoice = (c) => {
    if (gameState?.status === 'playing') {
      setChoice(c);
      socket.emit('makeChoice', { roomId, choice: c });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Rock-Paper-Scissors</h1>
      {!gameState || gameState.status === 'waiting' ? (
        <div className="flex flex-col items-center">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="p-2 border rounded mb-2"
          />
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
          <p className="mb-4">You: {name}</p>
          <p className="mb-4 text-lg font-semibold">
            Score - {gameState.players[0]?.name}: {gameState.scores[gameState.players[0]?.name] || 0} / {gameState.players[1]?.name}: {gameState.scores[gameState.players[1]?.name] || 0}
          </p>
          <div className="flex gap-4 mb-4">
            <button onClick={() => makeChoice('rock')} className="text-5xl">🪨</button>
            <button onClick={() => makeChoice('paper')} className="text-5xl">📄</button>
            <button onClick={() => makeChoice('scissors')} className="text-5xl">✂️</button>
          </div>
          {gameState.choices && (
            <div>
              <p>{gameState.players[0]?.name}: {gameState.choices[gameState.players[0]?.id] || 'N/A'}</p>
              <p>{gameState.players[1]?.name}: {gameState.choices[gameState.players[1]?.id] || 'N/A'}</p>
              {gameState.winner && <p className="mt-2 text-xl">Winner: {gameState.winner}</p>}
            </div>
          )}
          <p className="mt-2 text-gray-600">{message}</p>
        </div>
      )}
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

export default function Snake() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId') || '';
  const name = searchParams.get('name') || 'Player';
  const [gameState, setGameState] = useState(null);
  const [direction, setDirection] = useState(null);
  const [message, setMessage] = useState('Enter a room ID to join.');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState?.status === 'playing' && gameState.positions[socket.id]) {
        if (e.key === 'ArrowUp') setDirection('up');
        if (e.key === 'ArrowDown') setDirection('down');
        if (e.key === 'ArrowLeft') setDirection('left');
        if (e.key === 'ArrowRight') setDirection('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    socket.on('gameState', (state) => setGameState(state));
    socket.on('playerLost', ({ loser }) => alert(`${loser} was caught!`));
    socket.on('roomFull', () => setMessage('Room is full. Try another room.'));

    if (roomId) {
      socket.emit('joinSnake', { roomId, name });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      socket.off('gameState');
      socket.off('playerLost');
      socket.off('roomFull');
    };
  }, [roomId, name]);

  useEffect(() => {
    if (direction && gameState?.status === 'playing') {
      socket.emit('move', { roomId, direction });
      setDirection(null);
    }
  }, [direction, gameState, roomId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Multiplayer Snake</h1>
      {!gameState || gameState.status === 'waiting' ? (
        <p className="text-gray-600">{message}</p>
      ) : (
        <div className="text-center">
          <p className="mb-4">You: {name} {gameState.chaser === socket.id ? '(Chaser)' : '(Runner)'}</p>
          <p className="mb-4 text-lg font-semibold">
            Score - {gameState.players[0]?.name}: {gameState.scores[gameState.players[0]?.id] || 0}
          </p>
          <div className="grid grid-cols-20 gap-1" style={{ width: '400px', height: '400px' }}>
            {Array(400).fill().map((_, i) => {
              const x = i % 20;
              const y = Math.floor(i / 20);
              const player = Object.entries(gameState.positions).find(([_, pos]) => pos.x === x && pos.y === y);
              return (
                <div
                  key={i}
                  className={`w-20 h-20 ${player ? (player[0] === gameState.chaser ? 'bg-red-500' : 'bg-green-500') : 'bg-white'} border`}
                />
              );
            })}
          </div>
          {gameState.winner && <p className="mt-4 text-xl">Winner: {gameState.winner}</p>}
          <p className="mt-2 text-gray-600">{message}</p>
        </div>
      )}
    </div>
  );
}
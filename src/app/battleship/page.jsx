'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

export default function Battleship() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId') || '';
  const name = searchParams.get('name') || 'Player';
  const [gameState, setGameState] = useState(null);
  const [message, setMessage] = useState('Enter a room ID to join.');
  const [myBoard, setMyBoard] = useState(Array(100).fill(null));

  useEffect(() => {
    socket.on('gameState', (state) => {
      setGameState(state);
      if (state.status === 'playing' && state.players.length === 2) {
        setMessage('Place your ships or attack!');
      } else if (state.players.length < 2) {
        setMessage('Waiting for another player...');
      }
    });

    socket.on('roomFull', () => {
      setMessage('Room is full. Try another room.');
    });

    if (roomId) {
      socket.emit('joinBattleship', { roomId, name });
    }

    return () => {
      socket.off('gameState');
      socket.off('roomFull');
    };
  }, [roomId, name]);

  const placeShip = () => {
    const positions = myBoard.map((cell, i) => (i % 10 === 0 || i % 10 === 9 ? 'ship' : null));
    socket.emit('placeShip', { roomId, positions });
    setMyBoard(positions);
  };

  const attack = (index) => {
    if (gameState?.currentPlayer === socket.id) {
      socket.emit('attack', { roomId, index });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Battleship</h1>
      {!gameState || gameState.status === 'waiting' ? (
        <p className="text-gray-600">{message}</p>
      ) : (
        <div className="text-center">
          <p className="mb-4">You: {name}</p>
          <p className="mb-4 text-lg font-semibold">
            Score - {gameState.players[0]?.name}: {gameState.scores[gameState.players[0]?.id] || 0} / {gameState.players[1]?.name}: {gameState.scores[gameState.players[1]?.id] || 0}
          </p>
          <div className="grid grid-cols-10 gap-1 mb-4">
            {myBoard.map((cell, i) => (
              <button
                key={i}
                className={`w-8 h-8 ${cell === 'ship' ? 'bg-blue-500' : cell === 'hit' ? 'bg-red-500' : cell === 'miss' ? 'bg-gray-500' : 'bg-white'} border rounded`}
                onClick={() => attack(i)}
              />
            ))}
          </div>
          {!myBoard.some(c => c === 'ship') && (
            <button onClick={placeShip} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Place Ships
            </button>
          )}
          {gameState.winner && <p className="mt-4 text-xl">Winner: {gameState.winner}</p>}
          <p className="mt-2 text-gray-600">{message}</p>
        </div>
      )}
    </div>
  );
}
'use client';

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import TicTacToeBoard from '../../components/TicTacToeBoard';
import moment from 'moment';

const socket = io('http://localhost:4000');

export default function TicTacToe() {
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');
  const [gameState, setGameState] = useState(null);
  const [player, setPlayer] = useState(null);
  const [message, setMessage] = useState('Enter your name and room ID to join.');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatBoxRef = useRef(null);

  useEffect(() => {
    socket.on('playerAssignment', (data) => {
      setPlayer({ symbol: data.symbol, name: data.name });
    });

    socket.on('gameState', (state) => {
      setGameState(state);
      if (state.players.length < 2) {
        setMessage('Waiting for another player...');
      }
    });

    socket.on('roomFull', () => {
      setMessage('Room is full. Try another room.');
    });

    socket.on('chatMessage', (data) => {
      setChatMessages((prev) => [...prev, { name: data.name, text: data.text, time: moment().format('h:mm A') }]);
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    });

    return () => {
      socket.off('playerAssignment');
      socket.off('gameState');
      socket.off('roomFull');
      socket.off('chatMessage');
    };
  }, []);

  const joinRoom = () => {
    if (roomId && name) {
      socket.emit('joinTicTacToe', { roomId, name });
      setMessage('Waiting for another player...');
    } else {
      setMessage('Please enter both a name and room ID.');
    }
  };

  const makeMove = (index) => {
    if (gameState?.status === 'playing' && player?.symbol === gameState.currentPlayer) {
      socket.emit('makeMove', { roomId, index });
    }
  };

  const continueGame = () => {
    socket.emit('restartTicTacToe', roomId);
    setMessage('Waiting for another player...');
  };

  const sendChatMessage = () => {
    if (chatInput.trim() && name && roomId) {
      socket.emit('chatMessage', { roomId, name, text: chatInput.trim() });
      setChatInput('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Tic-Tac-Toe</h1>
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
        <div className="text-center w-full max-w-md">
          <p className="mb-2">You are: {player?.name} ({player?.symbol})</p>
          <p className="mb-4 text-lg font-semibold">
            Score - {gameState.players[0]?.name}: {gameState.scores[gameState.players[0]?.name] || 0} / {gameState.players[1]?.name}: {gameState.scores[gameState.players[1]?.name] || 0}
          </p>
          <TicTacToeBoard board={gameState.board} onMove={makeMove} />
          {gameState.status === 'finished' && (
            <>
              <p className="mt-4 text-xl">
                {gameState.winner === 'draw' ? 'Game is a draw!' : `Winner: ${gameState.winner}`}
              </p>
              {gameState.winner === 'draw' && (
                <button
                  onClick={continueGame}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Continue
                </button>
              )}
              {gameState.winner !== 'draw' && (
                <button
                  onClick={continueGame}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Restart Game
                </button>
              )}
            </>
          )}
          <div className="mt-4 w-full">
            {chatMessages.length > 0 && (
              <div
                ref={chatBoxRef}
                className="bg-gray-100 border rounded-lg p-3 max-h-[300px] overflow-y-auto mb-2"
              >
                {chatMessages.map((msg, index) => {
                  const isMe = msg.name === name;
                  return (
                    <div
                      key={index}
                      className={`mb-2 flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-2"
                        >
                          {msg.name.charAt(0)}
                        </div>
                        <div
                          className={`p-2 rounded-lg ${isMe ? 'bg-blue-200' : 'bg-gray-200'} flex gap-1`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <span className="text-xs text-gray-500 ml-2 mt-2 inline-block">{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex mt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="p-2 border outline-0 rounded flex-grow"
              />
              <button
                onClick={sendChatMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded ml-2 hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
          <p className="mt-2 text-gray-600">{message}</p>
        </div>
      )}
    </div>
  );
}
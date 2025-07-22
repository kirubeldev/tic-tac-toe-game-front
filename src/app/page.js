'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Multiplayer Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/tic-tac-toe">
          <div className="card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer">
            <h2 className="text-2xl font-semibold">Tic-Tac-Toe</h2>
            <p className="text-gray-600">Play a classic 2-player game.</p>
          </div>
        </Link>
        <Link href="/rock-paper-scissors">
          <div className="card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer">
            <h2 className="text-2xl font-semibold">Rock-Paper-Scissors</h2>
            <p className="text-gray-600">2-player emoji battle.</p>
          </div>
        </Link>
        <Link href="/battleship">
          <div className="card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer">
            <h2 className="text-2xl font-semibold">Battleship</h2>
            <p className="text-gray-600">Sink your opponents ships.</p>
          </div>
        </Link>
        <Link href="/snake">
          <div className="card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer">
            <h2 className="text-2xl font-semibold">Multiplayer Snake</h2>
            <p className="text-gray-600">Run from the chaser!</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
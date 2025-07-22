import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Multiplayer Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/tic-tac-toe">
          <div className="card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer">
            <h2 className="text-2xl font-semibold">Tic-Tac-Toe</h2>
            <p className="text-gray-600">Play a classic 2-player Tic-Tac-Toe game in real-time.</p>
          </div>
        </Link>
        <Link href="/draw-guess">
          <div className="card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer">
            <h2 className="text-2xl font-semibold">Drawing & Guessing</h2>
            <p className="text-gray-600">Draw and guess words with multiple players in real-time.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
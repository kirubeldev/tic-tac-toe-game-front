export default function TicTacToeBoard({ board, onMove }) {
  return (
    <div className="grid grid-cols-3 gap-2 w-64 mx-auto">
      {board.map((cell, index) => (
        <button
          key={index}
          onClick={() => onMove(index)}
          className="w-20 h-20 bg-white border rounded text-2xl font-bold flex items-center justify-center"
          disabled={cell !== null}
        >
          {cell}
        </button>
      ))}
    </div>
  );
}
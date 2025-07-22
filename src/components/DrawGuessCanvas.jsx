'use client'; // Mark as client component

import { useEffect, useRef } from 'react';

export default function DrawGuessCanvas({ isDrawer, socket, roomId }) {
  const canvasRef = useRef(null);
  let isDrawing = false;
  let prevX = 0;
  let prevY = 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    const startDrawing = (e) => {
      if (!isDrawer) return;
      isDrawing = true;
      prevX = e.offsetX;
      prevY = e.offsetY;
    };

    const draw = (e) => {
      if (!isDrawing || !isDrawer) return;
      const x = e.offsetX;
      const y = e.offsetY;
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.closePath();
      socket.emit('draw', { roomId, prevX, prevY, x, y });
      prevX = x;
      prevY = y;
    };

    const stopDrawing = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [isDrawer, socket, roomId]);

  return (
    <canvas
      id="canvas"
      ref={canvasRef}
      width={400}
      height={300}
      className="border rounded"
    />
  );
}
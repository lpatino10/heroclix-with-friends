import React from 'react';

import './Board.css';

export const Board = () => {
  const BOARD_HEIGHT = 24;
  const BOARD_WIDTH = 16;

  const rows = [];
  for (let i = 0; i < BOARD_HEIGHT; i += 1) {
    const cols = [];
    for (let j = 0; j < BOARD_WIDTH; j += 1) {
      cols[j] = <div className="cell" />;
    }
    rows.push(cols);
  }

  return (
    <div className="board">
      {rows.map((row, index) => (
        /* eslint-disable react/no-array-index-key */
        <div className="row" key={`row${index}`}>
          {row.map((cell) => cell)}
        </div>
      ))}
    </div>
  );
};

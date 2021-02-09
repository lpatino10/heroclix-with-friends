import React from 'react';
import { useParams } from 'react-router-dom';
import { Board } from '../Board/Board';

export const Play = () => {
  const { gameId } = useParams();
  return (
    <>
      <h2>Play</h2>
      <p>Game {gameId} is on!</p>
      <Board />
    </>
  );
};

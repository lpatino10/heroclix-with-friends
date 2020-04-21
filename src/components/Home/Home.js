import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import firebase from '../../firebase';
import {
  GAMES_COLLECTION,
  JOIN_ID_TO_GAME_ID_COLLECTION,
  PLAYERS_COLLECTION,
} from '../../db-constants';

const createGameId = () => {
  return Math.random().toString(36).substring(2, 15)
    + Math.random().toString(36).substring(2, 15);
};

const createJoinId = () => {
  return Math.floor(Math.random() * (9999 - 1000 + 1) + 1000).toString();
};

export const Home = ({ onSubmitUsername }) => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const initializeGame = async () => {
    const gameId = createGameId();
    const joinId = createJoinId();

    // Add new player.
    const playerRef = await firebase.firestore()
      .collection(PLAYERS_COLLECTION)
      .add({
        username: name,
      });

    // Create game.
    firebase.firestore()
      .collection(GAMES_COLLECTION)
      .doc(gameId)
      .set({
        joinId,
        players: [playerRef.id],
      });

    // Map join ID for friends.
    firebase.firestore()
      .collection(JOIN_ID_TO_GAME_ID_COLLECTION)
      .doc(joinId)
      .set({ gameId });

    history.push(`${gameId}/lobby`);
  };

  return (
    <>
      <h2>Home</h2>
      <label for="name">Username:</label>
      <input
        type="text"
        id="name"
        onInput={(e) => setName(e.target.value)}
      />
      <button 
        type="button"
        disabled={name.length === 0}
        onClick={() => {
          onSubmitUsername(name);
          initializeGame();
        }}
      >
        Create game
      </button>
      <p>or</p>
      <label for="join">Enter code to join a game:</label>
      <input
        type="text"
        id="join"
        onInput={(e) => setJoinCode(e.target.value)}
      />
      <button 
        type="button"
        disabled={name.length === 0 || joinCode.length === 0}
        onClick={() => {
          onSubmitUsername(name);
          // validate join code, add player, and then redirect
        }}
      >
        Join game
      </button>
    </>
  );
}

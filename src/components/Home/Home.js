import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import {
  createPlayer,
  createGame,
  getGameIdFromJoinId,
  addPlayerToGame,
} from '../../firebase/operations';

export const Home = ({ onSubmitUsername }) => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [joinId, setJoinId] = useState('');

  const initializeGame = async () => {
    const playerRef = await createPlayer(name);
    const gameId = createGame(playerRef.id);
    return gameId;
  };

  return (
    <>
      <h2>Home</h2>
      <label htmlFor="name">
        Username:
        <input type="text" id="name" onInput={(e) => setName(e.target.value)} />
      </label>
      <button
        type="button"
        disabled={name.length === 0}
        onClick={async () => {
          onSubmitUsername(name);
          const gameId = await initializeGame();
          history.push(`${gameId}/lobby`);
        }}
      >
        Create game
      </button>
      <p>or</p>
      <label htmlFor="join">
        Enter code to join a game:
        <input type="text" id="join" onInput={(e) => setJoinId(e.target.value)} />
      </label>
      <button
        type="button"
        disabled={name.length === 0 || joinId.length === 0}
        onClick={async () => {
          onSubmitUsername(name);
          const gameId = await getGameIdFromJoinId(joinId);
          if (gameId) {
            addPlayerToGame(name, gameId);
            history.push(`${gameId}/lobby`);
          } else {
            console.log('nahhhhhh');
          }
        }}
      >
        Join game
      </button>
    </>
  );
};

Home.propTypes = {
  onSubmitUsername: PropTypes.func,
};

Home.defaultProps = {
  onSubmitUsername: () => {},
};

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import firebase from '../../firebase/firebase';
import {
  GAMES_COLLECTION,
  PLAYERS_COLLECTION,
} from '../../firebase/constants';

const getUsername = async (userId) => {
  const player = await firebase.firestore()
    .collection(PLAYERS_COLLECTION)
    .doc(userId)
    .get();
  return player.get('username');
};

export const Lobby = ({ currentUserId }) => {
  let { gameId } = useParams();

  const [joinId, setJoinId] = useState('');
  const [players, setPlayers] = useState([]);
  const [usernames, setUsernames] = useState([]);

  useEffect(() => {
    const getGameInfo = async () => {
      const gameInfo = await firebase.firestore()
      .collection(GAMES_COLLECTION)
      .doc(gameId)
      .get();
      setJoinId(gameInfo.get('joinId'));
      setPlayers(gameInfo.get('players'));
    };

    getGameInfo();
  }, [gameId]);

  useEffect(() => {
    // Capture addition of new players.
    firebase.firestore()
      .collection(GAMES_COLLECTION)
      .doc(gameId)
      .onSnapshot(snapshot => {
        if (snapshot.exists && snapshot.get('players').length !== players.length) {
          setPlayers(snapshot.get('players'));
        }
      });
  });

  useEffect(() => {
    const usernamesPromise = Promise.all(players.map(async (player) => {
      const username = await getUsername(player);
      return username;
    }));

    usernamesPromise.then((usernames) => {
      setUsernames(usernames)
    });
  }, [players]);

  return (
    <>
      <h2>Lobby</h2>
      <p>{`Share the code ${joinId} with your friends to have them join the game!`}</p>
      <p>Players:</p>
      <ul>
      {usernames.map((username, i) => <li key={players[i]}>{username}</li>)}
      </ul>
    </>
  );
}

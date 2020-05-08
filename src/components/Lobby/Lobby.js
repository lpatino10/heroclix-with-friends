import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import firebase from '../../firebase/firebase';
import { GAMES_COLLECTION, PLAYERS_COLLECTION, MAX_BUILD_VALUES } from '../../firebase/constants';
import {
  getPieces,
  setTeamForPlayer,
  updateMaxBuildValue,
  deleteJoinIdConnection,
} from '../../firebase/operations';
import { mapAsync } from '../../utils';

export const Lobby = () => {
  const history = useHistory();
  const { gameId } = useParams();

  const [currentPlayerUsername, setCurrentPlayerUsername] = useState();
  const [currentPlayerId, setCurrentPlayerId] = useState();
  const [joinId, setJoinId] = useState('');
  const [players, setPlayers] = useState([]);
  const [maxBuildValue, setMaxBuildValue] = useState(300);
  const [pieces, setPieces] = useState([]);
  const [team, setTeam] = useState([]);
  const [totalTeamValue, setTotalTeamValue] = useState(0);

  // Get all game pieces.
  useEffect(() => {
    const getAllPieces = async () => {
      const allPieces = await getPieces();
      setPieces(allPieces);
    };

    getAllPieces();
  }, []);

  // Get current username from local storage.
  useEffect(() => {
    setCurrentPlayerUsername(window.localStorage.getItem('username'));
  }, []);

  // Get game join ID.
  useEffect(() => {
    const getGameInfo = async () => {
      const gameInfo = await firebase.firestore().collection(GAMES_COLLECTION).doc(gameId).get();
      setJoinId(gameInfo.get('joinId'));
    };

    getGameInfo();
  }, [gameId]);

  // Capture addition of new players.
  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection(GAMES_COLLECTION)
      .doc(gameId)
      .onSnapshot(async (snapshot) => {
        if (!snapshot.exists) {
          return;
        }

        const getPlayerInfo = async (playerId) => {
          const playerInfo = await firebase
            .firestore()
            .collection(PLAYERS_COLLECTION)
            .doc(playerId)
            .get();
          return {
            id: playerId,
            ...playerInfo.data(),
          };
        };
        const playerIds = snapshot.get('players');
        const allPlayerInfo = await mapAsync(playerIds, getPlayerInfo);
        setPlayers(allPlayerInfo);
      });

    return () => {
      unsubscribe();
    };
  }, [gameId, players]);

  // Get ID for current player.
  useEffect(() => {
    const currentPlayer = players.find((player) => {
      return player.username === currentPlayerUsername;
    });

    if (currentPlayer) {
      setCurrentPlayerId(currentPlayer.id);
    }
  }, [currentPlayerUsername, players]);

  // Capture changing of max build value.
  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection(GAMES_COLLECTION)
      .doc(gameId)
      .onSnapshot((snapshot) => {
        if (snapshot.exists && snapshot.get('maxBuildValue') !== maxBuildValue) {
          setMaxBuildValue(snapshot.get('maxBuildValue'));
        }
      });

    return () => {
      unsubscribe();
    };
  }, [gameId, maxBuildValue]);

  // Capture completion of all teams.
  useEffect(() => {
    if (players.length < 2) {
      return;
    }

    const teamsComplete = players.every((player) => {
      return player.team && player.team.length > 0;
    });

    if (teamsComplete) {
      // Remove join ID to lock the game.
      deleteJoinIdConnection(joinId);
      history.push(`/${gameId}/play`);
    }
  }, [gameId, history, joinId, players]);

  const updateMaxTeamBuildValue = (evt) => {
    updateMaxBuildValue(gameId, parseInt(evt.target.value, 10));
  };

  const updateTeam = (evt) => {
    const clickedPieceInfo = pieces[evt.target.value];

    if (evt.target.checked) {
      setTeam([...team, clickedPieceInfo.id]);
      setTotalTeamValue(totalTeamValue + clickedPieceInfo.get('pointValue'));
    } else {
      setTeam(team.filter((pieceId) => pieceId !== clickedPieceInfo.id));
      setTotalTeamValue(totalTeamValue - clickedPieceInfo.get('pointValue'));
    }
  };

  const lockInTeam = () => {
    setTeamForPlayer(currentPlayerId, team);
  };

  return (
    <>
      <h2>Lobby</h2>
      <p>{`Share the code ${joinId} with your friends to have them join the game!`}</p>
      <p>Players:</p>
      <ul>
        {players.map((player) => (
          <li key={`${player.id}`}>{player.username}</li>
        ))}
      </ul>
      <p>Set the maximum team build value:</p>
      {MAX_BUILD_VALUES.map((buildValue) => {
        return (
          <div key={buildValue}>
            <label htmlFor={`points-${buildValue}`}>
              <input
                type="radio"
                id={`points-${buildValue}`}
                name="build-value"
                value={buildValue}
                checked={buildValue === maxBuildValue}
                onChange={updateMaxTeamBuildValue}
              />
              {buildValue}
            </label>
          </div>
        );
      })}
      <p>Build your team:</p>
      <p>{`Points remaining: ${maxBuildValue - totalTeamValue}`}</p>
      {pieces.map((piece, i) => {
        const name = piece.get('name');
        return (
          <div key={piece.id}>
            <label htmlFor={piece.id}>
              <input type="checkbox" id={piece.id} name={name} value={i} onClick={updateTeam} />
              {name}
            </label>
          </div>
        );
      })}
      <button type="button" disabled={team.length < 1} onClick={lockInTeam}>
        Lock in team
      </button>
    </>
  );
};

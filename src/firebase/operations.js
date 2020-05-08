import firebase from './firebase';
import {
  PLAYERS_COLLECTION,
  GAMES_COLLECTION,
  JOIN_ID_TO_GAME_ID_COLLECTION,
  PIECES_COLLECTION,
} from './constants';

const createGameId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const createJoinId = () => {
  return Math.floor(Math.random() * (9999 - 1000 + 1) + 1000).toString();
};

export const createPlayer = async (username) => {
  const playerRef = await firebase.firestore().collection(PLAYERS_COLLECTION).add({ username });

  return playerRef;
};

export const createGame = (creatorId) => {
  const gameId = createGameId();
  const joinId = createJoinId();

  firebase
    .firestore()
    .collection(GAMES_COLLECTION)
    .doc(gameId)
    .set({
      joinId,
      players: [creatorId],
      maxBuildValue: 300,
    });

  firebase.firestore().collection(JOIN_ID_TO_GAME_ID_COLLECTION).doc(joinId).set({ gameId });

  return gameId;
};

export const getGameIdFromJoinId = async (joinId) => {
  const gameIdDoc = await firebase
    .firestore()
    .collection(JOIN_ID_TO_GAME_ID_COLLECTION)
    .doc(joinId)
    .get();

  return gameIdDoc.get('gameId');
};

export const addPlayerToGame = async (username, gameId) => {
  const playerRef = await createPlayer(username);

  firebase
    .firestore()
    .collection(GAMES_COLLECTION)
    .doc(gameId)
    .update({
      players: firebase.firestore.FieldValue.arrayUnion(playerRef.id),
    });
};

export const getPieces = async () => {
  const pieces = await firebase.firestore().collection(PIECES_COLLECTION).get();
  return pieces.docs;
};

export const updateMaxBuildValue = (gameId, maxBuildValue) => {
  firebase.firestore().collection(GAMES_COLLECTION).doc(gameId).update({
    maxBuildValue,
  });
};

export const setTeamForPlayer = (playerId, teamIds) => {
  firebase.firestore().collection(PLAYERS_COLLECTION).doc(playerId).update({
    team: teamIds,
  });
};

export const deleteJoinIdConnection = (joinId) => {
  firebase.firestore().collection(JOIN_ID_TO_GAME_ID_COLLECTION).doc(joinId).delete();
};

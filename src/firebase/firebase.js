import * as firebase from 'firebase/app';
import 'firebase/firestore';
import credentials from './.credentials.json';

firebase.initializeApp(credentials);

export default firebase;

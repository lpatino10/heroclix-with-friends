import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Home } from '../Home/Home';
import { Lobby } from '../Lobby/Lobby';
import { Play } from '../Play/Play';

const storeUsername = (username) => {
  window.localStorage.setItem('username', username);
};

export default function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/:gameId/lobby">
            <Lobby />
          </Route>
          <Route path="/:gameId/play">
            <Play />
          </Route>
          <Route path="/">
            <Home onSubmitUsername={storeUsername} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import { Home } from './Home/Home';
import { Lobby } from './Lobby/Lobby';
import { Play } from './Play/Play';

export default function App() {
  const [currentUserId, setCurrentUserId] = useState();

  return (
    <Router>
      <div>
        <Switch>
          <Route path="/:gameId/lobby">
            <Lobby currentUserId={currentUserId} />
          </Route>
          <Route path="/play">
            <Play />
          </Route>
          <Route path="/">
            <Home onSubmitUsername={setCurrentUserId}/>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

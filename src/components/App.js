import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

export default function App() {

  return (
    <Router>
      <div>
        <Switch>
          <Route path="/">
            <div><p>Hello world!</p></div>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

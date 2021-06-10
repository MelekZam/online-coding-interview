import './styles/App.css';
import React from 'react'
import Home from './components/Home'
import Room from './components/Room'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path='/'><Home /></Route>
          <Route exact path='/:id'><Room /></Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;

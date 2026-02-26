import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import App from 'app/App';

const AppRoutes = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path} component={App} />
    </Switch>
  );
};

export default AppRoutes;

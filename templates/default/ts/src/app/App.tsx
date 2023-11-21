import React from 'react';
import { PageHeader, useCurrentClientManager } from '@cko/dashboard-shared';
import { TextHeadingOne, TextHeadingTwo } from '@cko/primitives';
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom';
import settings from '../app-settings';

function App() {
  const { path, url } = useRouteMatch();
  const { client } = useCurrentClientManager();
  return (
    <div>
      <PageHeader>
        <TextHeadingOne>Micro Frontend Boilerplate - {client.name}</TextHeadingOne>
      </PageHeader>

      <Link to={url} style={{ marginRight: '8px' }}>
        Home
      </Link>

      <Link to={`${url}/route`}>Route</Link>

      <TextHeadingTwo>{settings.api}</TextHeadingTwo>
    </div>
  );
}

export default App;

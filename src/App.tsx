import './App.css'
import { createBrowserRouter, RouterProvider, useLocation } from 'react-router'
import { PlayerPage } from './pages/PlayerPage';
import { Layout } from './pages/Layout';
import { SearchPage } from './pages/SearchPage';

// Remount PlayerPage whenever the route or search params change so that the
// URL-driven selection (type + id, e.g. from the search page) is applied on mount.
function PlayerPageRoute() {
    const location = useLocation();
    return <PlayerPage key={`${location.pathname}${location.search}`} />;
}

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: PlayerPageRoute
      },
      {
        path: 'search',
        Component: SearchPage
      },
      {
        path: 'player',
        Component: PlayerPageRoute
      }
    ]
  },
]);

function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
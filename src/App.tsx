import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { PlayerPage } from './pages/PlayerPage';
import { Layout } from './pages/Layout';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: PlayerPage
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

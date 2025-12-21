import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Profile from './pages/Profile';
import IdeaValidator from './pages/IdeaValidator';
import TeamBuilder from './pages/TeamBuilder';
import MentorConnect from './pages/MentorConnect';
import InnovationRoadmap from './pages/InnovationRoadmap';
import LeanCanvas from './pages/LeanCanvas';
import PitchDeck from './pages/PitchDeck';
import GrantTracker from './pages/GrantTracker';
import ProjectWorkspace from './pages/ProjectWorkspace';
import OpenRoles from './pages/OpenRoles';
import { AuthProvider } from './context/AuthContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'project/:id',
        element: <ProjectDetails />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'validator',
        element: <IdeaValidator />,
      },
      {
        path: 'team',
        element: <TeamBuilder />,
      },
      {
        path: 'mentors',
        element: <MentorConnect />,
      },
      {
        path: 'roadmap',
        element: <InnovationRoadmap />,
      },
      {
        path: 'lean-canvas',
        element: <LeanCanvas />,
      },
      {
        path: 'pitch-deck',
        element: <PitchDeck />,
      },
      {
        path: 'grants',
        element: <GrantTracker />,
      },
      {
        path: 'project/:id/workspace',
        element: <ProjectWorkspace />,
      },
      {
        path: 'open-roles',
        element: <OpenRoles />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;

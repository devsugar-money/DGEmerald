import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { IconProvider } from './components/IconProvider';

// Loading Fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

// Prefetch critical components
const prefetchComponent = (importFn: () => Promise<any>) => {
  const promise = importFn();
  return lazy(() => promise);
};

// Lazy load pages with prefetch for critical routes
const Home = prefetchComponent(() => import('./pages/Home.tsx'));
const Login = prefetchComponent(() => import('./pages/Login.tsx'));
const Register = prefetchComponent(() => import('./pages/Register.tsx'));
const TakeSurvey = lazy(() => import('./pages/TakeSurvey.tsx'));
const ActionPlan = lazy(() => import('./pages/ActionPlan.tsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.tsx'));
const SurveyBuilder = lazy(() => import('./pages/SurveyBuilder.tsx'));
const SurveyEditor = lazy(() => import('./pages/SurveyEditor.tsx'));
const ResourceManager = lazy(() => import('./pages/ResourceManager.tsx'));

// Define routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: '/login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: '/register',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Register />
          </Suspense>
        ),
      },
      {
        path: '/survey/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TakeSurvey />
          </Suspense>
        ),
      },
      {
        path: '/action-plan',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ActionPlan />
          </Suspense>
        ),
      },
      {
        path: '/dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: '/survey-builder',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SurveyBuilder />
          </Suspense>
        ),
      },
      {
        path: '/survey-editor/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SurveyEditor />
          </Suspense>
        ),
      },
      {
        path: '/resources',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ResourceManager />
          </Suspense>
        ),
      },
    ],
  },
]);

// Start preloading the Home component as soon as possible
Home.preload?.();

// Add preloading for critical paths
if (window.requestIdleCallback) {
  window.requestIdleCallback(() => {
    Login.preload?.();
    Register.preload?.();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IconProvider>
      <RouterProvider router={router} />
    </IconProvider>
  </StrictMode>
);
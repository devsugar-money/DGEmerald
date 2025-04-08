import React, { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { IconProvider } from './components/IconProvider';
import AdminRoute from './components/AdminRoute';

// Loading Fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

// Prefetch critical components
type ComponentModule = { default: React.ComponentType<any> };

const prefetchComponent = (importFn: () => Promise<ComponentModule>) => {
  const promise = importFn();
  // Preload the component
  promise.catch(() => {});
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
const AdminResourceManager = lazy(() => import('./pages/AdminResourceManager.tsx'));

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
      {
        path: '/admin/resources',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminRoute>
              <AdminResourceManager />
            </AdminRoute>
          </Suspense>
        ),
      },
    ],
  },
], {
  future: {
    // Enable v7 behavior to silence warnings
    // For React Router 6.22.1, we need to use the supported flags
    v7_normalizeFormMethod: true
  }
});

// Preload critical components
// The preloading happens in the prefetchComponent function
// No need to call preload methods

// Add preloading for other components when idle
if (window.requestIdleCallback) {
  window.requestIdleCallback(() => {
    // Preload other components when browser is idle
    import('./pages/Dashboard.tsx').catch(() => {});
    import('./pages/SurveyBuilder.tsx').catch(() => {});
    import('./pages/AdminResourceManager.tsx').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IconProvider>
      <RouterProvider router={router} />
    </IconProvider>
  </StrictMode>
);
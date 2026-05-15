import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import MainLayout from '@/components/layouts/MainLayout';

import { routes } from './routes';

const App: React.FC = () => {
  return (
    <Router>
      <IntersectObserver />
      <div className="flex flex-col min-h-screen">
        <Toaster />
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={
                (route.path === '/login' || route.path === '/report') ? (
                  route.element
                ) : (
                  <MainLayout showFooter={route.path === '/'}>
                    {route.element}
                  </MainLayout>
                )
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

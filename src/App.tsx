import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import ScrollToTop from '@/components/common/ScrollToTop';
import AuthGuard from '@/components/common/AuthGuard';
import {Toaster} from '@/components/ui/sonner';
import MainLayout from '@/components/layouts/MainLayout';

import {routes} from './routes';
import RequireAuth from "@/components/common/RequireAuth.tsx";
import UserDashboard from "@/pages/UserDashboard.tsx";
import UserLayout from "@/components/layouts/UserLayout.tsx";
import AdminLawsPage from "@/pages/admin/AdminLawsPage.tsx";
import AdminNewsPage from "@/pages/admin/AdminNewsPage.tsx";
import AdminAgenciesPage from "@/pages/admin/AdminAgenciesPage.tsx";
import AdminUsersPage from "@/pages/admin/AdminUsersPage.tsx";
import AdminReferencePage from "@/pages/admin/AdminReferencePage.tsx";
import AdminReportsPage from "@/pages/admin/AdminReportsPage.tsx";
import AdminReportDetailPage from "@/pages/admin/AdminReportDetailPage.tsx";
import NewsDetailPage from "@/pages/NewsDetailPage.tsx";
import LawDetailPage from "@/pages/LawDetailPage.tsx";
import UserReportsPage from "@/pages/user/UserReportsPage.tsx";
import UserReportDetailPage from "@/pages/user/UserReportDetailPage.tsx";
import {referenceConfigs} from '@/lib/reference-config';
import NotFound from "@/pages/NotFound.tsx";

const App: React.FC = () => {
    return (
        <Router>
            <AuthGuard>
                <ScrollToTop/>
                <IntersectObserver/>
                <div className="flex flex-col min-h-screen">
                    <Toaster/>
                    <Routes>
                        {routes.map((route, index) => {
                            let element = (route.path === '/login' || route.path === '/report')
                                ? route.element
                                : <MainLayout>{route.element}</MainLayout>;
                            if (!route.public) {
                                element = <RequireAuth>{element}</RequireAuth>;
                            }
                            return <Route key={index} path={route.path} element={element}/>;
                        })}
                        <Route path="/laws/:id" element={
                            <MainLayout>
                                <LawDetailPage/>
                            </MainLayout>
                        }/>
                        <Route path="/news/:id" element={
                            <MainLayout>
                                <NewsDetailPage/>
                            </MainLayout>
                        }/>
                        <Route path="/user" element={<RequireAuth><UserLayout/></RequireAuth>}>
                            <Route index element={<UserDashboard/>}/>
                            <Route path="reports" element={<UserReportsPage/>}/>
                            <Route path="reports/:id" element={<UserReportDetailPage/>}/>
                        </Route>
                        <Route path="/admin" element={<RequireAuth><UserLayout/></RequireAuth>}>
                            <Route path="laws" element={<AdminLawsPage/>}/>
                            <Route path="news" element={<AdminNewsPage/>}/>
                            <Route path="agencies" element={<AdminAgenciesPage/>}/>
                            <Route path="users" element={<AdminUsersPage/>}/>
                            <Route path="reports" element={<AdminReportsPage/>}/>
                            <Route path="reports/:id" element={<AdminReportDetailPage/>}/>
                            {referenceConfigs.map((c) => (
                                <Route
                                    key={c.resourceKey}
                                    path={`reference/${c.resourceKey}`}
                                    element={<AdminReferencePage config={c}/>}
                                />
                            ))}
                        </Route>
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </div>
            </AuthGuard>
        </Router>
    );
};

export default App;

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ReportPage from './pages/ReportPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import LawsPage from './pages/LawsPage';
import NewsPage from './pages/NewsPage';
import AgenciesPage from './pages/AgenciesPage';
import ComplianceDiagnosisPage from './pages/ComplianceDiagnosisPage';
import type {ReactNode} from 'react';

export interface RouteConfig {
    name: string;
    path: string;
    element: ReactNode;
    visible?: boolean;
    /** Accessible without login. Routes without this flag require authentication. Has no effect when RouteGuard is not in use. */
    public?: boolean;
}

export const routes: RouteConfig[] = [
    {
        name: 'home page',
        path: '/',
        element: <HomePage/>,
        public: true,
    },
    {
        name: 'login',
        path: '/login',
        element: <LoginPage/>,
        public: true,
    },
    {
        name: '合规报告',
        path: '/report',
        element: <ReportPage/>,
        public: true,
    },
    {
        name: '合规初诊',
        path: '/diagnosis',
        element: <ComplianceDiagnosisPage/>,
        public: true,
    },
    {
        name: 'verify email',
        path: '/verify-email/:token',
        element: <VerifyEmailPage/>,
        public: true,
    },
    {
        name: '法规库',
        path: '/laws',
        element: <LawsPage/>,
        public: true,
    },
    {
        name: '资讯库',
        path: '/news',
        element: <NewsPage/>,
        public: true,
    },
    {
        name: '机构推荐',
        path: '/agencies',
        element: <AgenciesPage/>,
        public: true,
    }
];

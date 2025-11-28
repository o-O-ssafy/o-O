import {
  createBrowserRouter,
  type RouteObject,
  RouterProvider,
} from "react-router-dom";
import { PATHS } from "@/constants/paths";
import MindmapPage from "@/features/mindmap/pages/MindmapPage";
import { HomePage } from "@/features/home/pages/HomePage";
import { MyPage } from "@/features/mypage/pages/MyPage";
import { ProjectDetailPage } from "@/features/mypage/pages/ProjectDetailPage";
import { TrendPage } from "@/features/trend/pages/TrendPage";
import { TrendMindmapPage } from "@/features/trend/pages/TrendMindmapPage";
import { CallbackPage } from "@/features/auth/pages/CallbackPage";
import { WorkspaceJoinPage } from "@/features/workspace/pages/WorkspaceJoinPage";


const routeConfig = [
  {
    path: PATHS.HOME,
    element: <HomePage />,
  },
  {
    path: PATHS.TREND,
    element: <TrendPage />,
  },
  {
    path: PATHS.TREND_MINDMAP,
    element: <TrendMindmapPage />,
  },
  {
    path: PATHS.MINDMAP,
    element: <MindmapPage />,
  },
  {
    path: PATHS.WORKSPACE_JOIN,
    element: <WorkspaceJoinPage />,
  },
  {
    path: PATHS.MYPAGE,
    element: <MyPage />,
  },
  {
    path: PATHS.PROJECT_DETAIL,
    element: <ProjectDetailPage />,
  },
  {
    path: PATHS.CALLBACK,
    element: <CallbackPage />,
  },
] as RouteObject[];

// 라우터 설정
const router = createBrowserRouter(routeConfig);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import TaskListPage from '@/pages/TaskListPage'
import TaskCreatePage from '@/pages/TaskCreatePage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/tasks" replace /> },
      { path: 'tasks', element: <TaskListPage /> },
      { path: 'tasks/new', element: <TaskCreatePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

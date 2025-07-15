import { createBrowserRouter } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import PostCreate from '../components/posts/PostCreate';
import PostList from '../components/posts/PostList';
import Feed from '../components/feed/Feed';
import JobList from '../components/job-board/JobList';
import MessageList from '../components/messaging/MessageList';
import ProfilePage from '../pages/ProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/posts/create',
    element: <PostCreate />,
  },
  {
    path: '/posts',
    element: <PostList />,
  },
  {
    path: '/feed',
    element: <Feed />,
  },
  {
    path: '/jobs',
    element: <JobList />,
  },
  {
    path: '/messages',
    element: <MessageList />,
  },
]);
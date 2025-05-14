import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { defaultTheme } from './theme';
import './i18n';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Forums from './pages/Forums';
import KnowledgeBase from './pages/KnowledgeBase';
import Events from './pages/Events';
import Profile from './pages/Profile';
import ResourceDetail from './pages/ResourceDetail';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider theme={defaultTheme}>
          <CssBaseline />
          <Routes>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forums" element={<Forums />} />
              <Route path="knowledge-base" element={<KnowledgeBase />} />
              <Route path="knowledge-base/:id" element={<ResourceDetail />} />
              <Route path="events" element={<Events />} />
              <Route path="profile" element={<Profile />} />
              <Route path="map" element={<MapPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App; 
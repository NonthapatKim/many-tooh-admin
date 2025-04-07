import { useState, useEffect } from 'react';
import './App.css'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import ProtectedRoute from './privateroute';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';

import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from './redux/authSlice';
import apiClient from './api/apiClient';
import ProductsPage from './pages/products';
import BrandsPage from './pages/brands';
import ProductCategoriesPage from './pages/product-categories';
import ProductTypePage from './pages/product-type';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [urlparth, setUrlparth] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subpath = location.pathname.substring(1);
    setUrlparth(subpath);    

    if (location.pathname !== "/login") {
      const checkAuth = async () => {
        try {
          const response = await apiClient.get("/users/authenticate");
          if (response.status === 200) {
            dispatch(
              loginSuccess({
                role: response.data.role,
                userId: response.data.user_id,
                username: response.data.username,
              })
            );
          }
        } catch (error) {
          console.error("Authentication check failed:", error);
          await apiClient.post("/users/logout");
          dispatch(logout());
          navigate("/login");
        } finally {
          setLoading(false);
        }
      };

      const sessionCheckInterval = setInterval(checkAuth, 30000);

      checkAuth();

      return () => clearInterval(sessionCheckInterval);
    } else {
      setLoading(false);
    }
  }, [dispatch, location.pathname, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router basename="/">
      <ToastContainer />
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/dashboard" element={<DashboardPage urlParth={urlparth} />} />
          <Route path="/products" element={<ProductsPage urlParth={urlparth} />} />
          <Route path="/brands" element={<BrandsPage urlParth={urlparth} />} />
          <Route path="/product-categories" element={<ProductCategoriesPage urlParth={urlparth} />} />
          <Route path="/product-type" element={<ProductTypePage urlParth={urlparth} />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

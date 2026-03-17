import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ComingSoonPage from './pages/ComingSoonPage';
import OrderPage from './pages/OrderPage';
import ProductList from './components/molecules/ProductList';
import ProductFormModal from './components/AddProducts/ProductFormModal';
import MarketingPage from './pages/MarketingPage';
import PaymentDashboard from './components/molecules/PaymentDashboard';
import TopSellersList from './pages/TopSellers';
import CategoryPage from './pages/Categorypage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from 'react-hot-toast';
import ProfilePage from './pages/profilepage';
import EditProduct from './components/AddProducts/EditProduct';
import ChatBot from './components/ChatBot';
import ForgotPassword from './components/ForgotPassword';
import OrderDetailsPage from './components/molecules/OrderDetailsPage';
import PushNotificationForm from './components/molecules/PushNotificationForm';
import PushNotificationManager from './pages/PushNotificationManager';
import './App.css'
import { useEffect, useState } from 'react';
import BlogData from './pages/BlogPage/BlogData';
import Blog from './pages/BlogPage/Blog';
import BlogView from './pages/BlogPage/BlogView';
import BlogEditor from './pages/BlogPage/BlogEditor';
export default function App() {
 const [deferredPrompt, setDeferredPrompt] = useState(null);
const [blogs, setBlogs] = useState([]);
  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPWA = e; // store globally for other components
    });

    window.addEventListener("appinstalled", () => {
      window.deferredPWA = null;
    });
  }, []);
  
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>  
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/orders" element={<OrderPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailsPage/>} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/Addproducts" element={<ProductFormModal />} />
            <Route path="/editproduct/:productId" element={<EditProduct />} />
            <Route path="/topsellers" element={<TopSellersList />} />
            <Route path="/marketing" element={ <PushNotificationManager />} /> 
            <Route path="/payments" element={<PaymentDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/Blogs" element={<Blog />} />
            <Route path="/Blogs/blog-view/:id" element={<BlogView />} />
<Route
  path="/Blogs/update"
  element={<BlogEditor setBlogs={setBlogs} />}
/>

<Route
  path="/Blogs/update/:id"
  element={<BlogEditor setBlogs={setBlogs} />}
/>
            <Route path="*" element={<ComingSoonPage />} />
          </Route>
        </Route>
      </Routes>
      <Toaster position="bottom-center" />
      {/* <ChatBot/> */}
    </Router>
  );
}

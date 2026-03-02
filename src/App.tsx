import { HashRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts';
import { Hero, AboutSection, ProductGallery, BlogSection, LoadingSpinner, NotFound, ChatBox } from './components';
import { ContactPage, FAQPage, BlogPage, AboutBuchaohPage, ProductListPage, ProductDetailPage, AuthPage } from './pages';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminPage } from './pages/Admin/AdminPage';

// Import images from assets
import logoImage from './assets/logos/Logo.png';
import heroImage from './assets/images/hero/hero-image.png';
import aboutImage1 from './assets/images/about/about-1.png';
import aboutImage2 from './assets/images/about/about-2.png';

// Homepage Component
const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll đến products section nếu được yêu cầu
    if (location.state?.scrollToProducts) {
      const timer = setTimeout(() => {
        const productsElement = document.getElementById('products');
        if (productsElement) {
          productsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="homePageFont">
      <Hero imageSrc={heroImage} />
      <AboutSection leftImageSrc={aboutImage1} bottomImageSrc={aboutImage2} />
      <ProductGallery />
      <BlogSection />
    </div>
  );
};

// Layout wrapper component that uses Outlet
const LayoutWrapper = ({ logoSrc }: { logoSrc: string }) => {
  return (
    <MainLayout logoSrc={logoSrc}>
      <Outlet />
    </MainLayout>
  );
};

const AdminRoute = () => {
  const { isAuthenticated, isLoading, isAdmin } = useAuthContext();

  if (isLoading) {
    return <LoadingSpinner overlay={true} size="large" text="Đang tải ORCHA..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <AdminPage />;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds demo loading

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <LoadingSpinner
        overlay={true}
        size="large"
        text="Đang tải ORCHA..."
      />
    );
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth page - standalone, no MainLayout */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin" element={<AdminRoute />} />

            {/* Main app routes with layout */}
            <Route element={<LayoutWrapper logoSrc={logoImage} />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products/:category" element={<ProductListPage />} />
              <Route path="/products/:category/:productId" element={<ProductDetailPage />} />
              <Route path="/about" element={<AboutBuchaohPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <ChatBox />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

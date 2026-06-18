import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/home/HomePage';
import CataloguePage from '@/pages/catalogue/CataloguePage';
import AboutPage from '@/pages/about/AboutPage';
import ContactPage from '@/pages/contact/ContactPage';
import NotFoundPage from '@/pages/NotFoundPage';

/**
 * Route table for the whole site. All pages share the <Layout> shell
 * (top panel + footer); each route renders into the layout's <Outlet />.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="sortiment" element={<CataloguePage />} />
        <Route path="om-os" element={<AboutPage />} />
        <Route path="kontakt" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;

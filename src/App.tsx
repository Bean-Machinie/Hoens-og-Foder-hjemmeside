import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/home/HomePage';
import CataloguePage from '@/pages/catalogue/CataloguePage';
import AboutPage from '@/pages/about/AboutPage';
import ContactPage from '@/pages/contact/ContactPage';
import InformationPage from '@/pages/information/InformationPage';
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
        <Route
          path="information/nye-honseejere"
          element={
            <InformationPage
              title="Nye hønseejere"
              lead="En rolig startguide til dig, der skal have høns for første gang."
            />
          }
        />
        <Route
          path="information/pasning-og-trivsel"
          element={
            <InformationPage
              title="Pasning og trivsel"
              lead="Gode råd om daglig pasning, trygge rammer og sunde høns."
            />
          }
        />
        <Route
          path="information/fodervejledning"
          element={
            <InformationPage
              title="Fodervejledning"
              lead="Hjælp til at vælge det rigtige foder gennem hønsenes forskellige behov."
            />
          }
        />
        <Route
          path="information/ofte-stillede-sporgsmal"
          element={
            <InformationPage
              title="Ofte stillede spørgsmål"
              lead="Svar på de spørgsmål, nye og erfarne hønseejere oftest stiller."
            />
          }
        />
        <Route path="om-os" element={<AboutPage />} />
        <Route path="kontakt" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;

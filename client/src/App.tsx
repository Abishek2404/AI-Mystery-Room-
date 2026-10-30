import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CreateMysteryPage from './pages/CreateMysteryPage';
import InvestigationRoomPage from './pages/InvestigationRoomPage';
import ResultsPage from './pages/ResultsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateMysteryPage />} />
          <Route path="/investigate/:id" element={<InvestigationRoomPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '1.5rem',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '0.8rem',
      }}>
        AI Mystery Room · Powered by Gemini AI
      </footer>
    </BrowserRouter>
  );
}

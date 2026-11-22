import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from './components/layout/AppLayout.jsx';
import LeadsPage from './pages/LeadsPage/LeadsPage.jsx';
import ScoringSettingsPage from './pages/ScoringSettingsPage/ScoringSettingsPage.jsx';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path='/' element={<LeadsPage />} />
        <Route path='/scoring-settings' element={<ScoringSettingsPage />} />
      </Route>

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

export default App;

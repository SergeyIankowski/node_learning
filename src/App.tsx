import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import styles from './App.module.css';
import { Header } from './components/Header';
import { NotFound } from './pages/NotFound';
import { RoadmapPage } from './pages/RoadmapPage';
import { TaskPage } from './pages/TaskPage';
import { WeekPage } from './pages/WeekPage';

export function App() {
  const { pathname } = useLocation();
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger (scroll to top on navigation), not a value used inside.
  useEffect(() => {
    // Block body on purpose: scrollTo() returns a Promise in recent Chrome, and an effect must not return one.
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<RoadmapPage />} />
          <Route path="/week/:weekId" element={<WeekPage />} />
          <Route path="/week/:weekId/task/:taskId" element={<TaskPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

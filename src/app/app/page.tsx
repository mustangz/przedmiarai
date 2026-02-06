'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Inline SVG icons (same pattern as panel/page.tsx) ─────────
const Icons = {
  Calculator: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" />
      <path d="M12 14h.01" /><path d="M8 14h.01" />
      <path d="M12 18h.01" /><path d="M8 18h.01" />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  ),
  FileText: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  ),
  Calendar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
};

// Mock projects for MVP
const mockProjects = [
  { id: '1', name: 'Mieszkanie Warszawa ul. Mokotowska', status: 'completed', date: '2026-02-03', rooms: 6 },
  { id: '2', name: 'Dom jednorodzinny Piaseczno', status: 'in_progress', date: '2026-02-05', rooms: 12 },
  { id: '3', name: 'Biuro Wola', status: 'draft', date: '2026-02-05', rooms: 0 },
];

export default function Dashboard() {
  const [projects] = useState(mockProjects);

  const statusLabels: Record<string, string> = {
    completed: 'Zakończony',
    in_progress: 'W trakcie',
    draft: 'Szkic',
  };

  return (
    <>
      {/* Navbar — identical to LP */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" className="logo">
            <div className="logo-icon"><Icons.Calculator /></div>
            <span className="logo-text">PrzedmiarAI</span>
          </a>
        </div>
      </nav>

      <div className="app-dashboard">
        <div className="app-dashboard-inner">
          <div className="app-dashboard-header">
            <div>
              <h1 className="app-dashboard-title">Moje projekty</h1>
              <p className="app-dashboard-subtitle">Zarządzaj swoimi przedmiarami</p>
            </div>
            <Link href="/app/projekt/new" className="app-new-btn">
              <span className="app-new-btn-glow" />
              <span className="app-new-btn-inner">
                <Icons.Plus />
                Nowy projekt
              </span>
            </Link>
          </div>

          {/* Projects grid */}
          {projects.length > 0 ? (
            <div className="app-projects-grid">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/app/projekt/${project.id}`}
                  className="app-project-card"
                >
                  <div className="app-project-icon">
                    <Icons.FileText />
                  </div>

                  <div className="app-project-info">
                    <div className="app-project-name">{project.name}</div>
                    <div className="app-project-meta">
                      <span className="app-project-meta-item">
                        <Icons.Calendar />
                        {project.date}
                      </span>
                      {project.rooms > 0 && (
                        <span>{project.rooms} pomieszczeń</span>
                      )}
                    </div>
                  </div>

                  <span className={`app-status-badge ${project.status}`}>
                    {statusLabels[project.status]}
                  </span>

                  <span className="app-project-chevron">
                    <Icons.ChevronRight />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="app-empty">
              <div className="app-empty-icon">
                <Icons.FileText />
              </div>
              <div className="app-empty-title">Brak projektów</div>
              <p className="app-empty-desc">Utwórz swój pierwszy przedmiar</p>
              <Link href="/app/projekt/new" className="app-new-btn">
                <span className="app-new-btn-glow" />
                <span className="app-new-btn-inner">
                  <Icons.Plus />
                  Nowy projekt
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

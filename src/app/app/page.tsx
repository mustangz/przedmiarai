'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  FileText, 
  Calendar, 
  ChevronRight,
  Calculator,
  LayoutDashboard,
  Settings,
  LogOut
} from 'lucide-react';

// Mock projects for MVP
const mockProjects = [
  { id: '1', name: 'Mieszkanie Warszawa ul. Mokotowska', status: 'completed', date: '2026-02-03', rooms: 6 },
  { id: '2', name: 'Dom jednorodzinny Piaseczno', status: 'in_progress', date: '2026-02-05', rooms: 12 },
  { id: '3', name: 'Biuro Wola', status: 'draft', date: '2026-02-05', rooms: 0 },
];

export default function Dashboard() {
  const [projects] = useState(mockProjects);

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-emerald-500/20 text-emerald-400',
      in_progress: 'bg-blue-500/20 text-blue-400',
      draft: 'bg-gray-500/20 text-gray-400',
    };
    const labels = {
      completed: 'Zakończony',
      in_progress: 'W trakcie',
      draft: 'Szkic',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--card-border)] p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">PrzedmiarAI</span>
        </div>

        <nav className="flex-1 space-y-2">
          <Link 
            href="/app" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-500/10 text-violet-400"
          >
            <LayoutDashboard className="w-5 h-5" />
            Projekty
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-[var(--card-bg)] transition">
            <Settings className="w-5 h-5" />
            Ustawienia
          </button>
        </nav>

        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-[var(--card-bg)] transition">
          <LogOut className="w-5 h-5" />
          Wyloguj
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Moje projekty</h1>
              <p className="text-gray-400">Zarządzaj swoimi przedmiarami</p>
            </div>
            <Link 
              href="/app/projekt/new" 
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nowy projekt
            </Link>
          </div>

          {/* Projects grid */}
          <div className="grid gap-4">
            {projects.map((project) => (
              <Link 
                key={project.id}
                href={`/app/projekt/${project.id}`}
                className="card flex items-center gap-6 hover:border-violet-500/50"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-violet-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {project.date}
                    </span>
                    {project.rooms > 0 && (
                      <span>{project.rooms} pomieszczeń</span>
                    )}
                  </div>
                </div>

                {getStatusBadge(project.status)}

                <ChevronRight className="w-5 h-5 text-gray-500" />
              </Link>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="card text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Brak projektów</h3>
              <p className="text-gray-400 mb-6">Utwórz swój pierwszy przedmiar</p>
              <Link href="/app/projekt/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nowy projekt
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

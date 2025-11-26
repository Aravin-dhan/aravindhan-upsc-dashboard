"use client";
// src/app/page.tsx
import Navbar from '@/components/Navbar';
import { MissionControl } from '@/components/Dashboard/MissionControl';
import { SyllabusAtlas } from '@/components/Dashboard/SyllabusAtlas';
import HabitForge from '@/components/Dashboard/HabitForge';
import ProgressView from '@/components/Dashboard/ProgressView';

export default function DashboardPage() {
  return (
    <main className="flex flex-col gap-8 p-4">
      <Navbar />
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MissionControl />
        <SyllabusAtlas />
        <HabitForge />
        <ProgressView />
      </section>
    </main>
  );
}

"use client";
// src/app/page.tsx
import Navbar from '@/components/Navbar';
import { MissionControl } from '@/components/Dashboard/MissionControl';
import { SyllabusAtlas } from '@/components/Dashboard/SyllabusAtlas';
import HabitForge from '@/components/Dashboard/HabitForge';
import ProgressView from '@/components/Dashboard/ProgressView';
import { LayoutManager } from '@/components/Dashboard/LayoutManager';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { PremiumEffects } from '@/components/PremiumEffects';
import FlashcardManager from '@/components/Flashcards/FlashcardManager';
import NewsFeed from '@/components/NewsFeed/NewsFeed';
import SyncManager from '@/components/SyncManager';

export default function DashboardPage() {
  return (
    <main className="flex flex-col gap-8 p-4">
      <Navbar />
      <LayoutManager>
        <MissionControl />
        <SyllabusAtlas />
        <HabitForge />
        <ProgressView />
        <FlashcardManager />
        <NewsFeed />
      </LayoutManager>
      <ThemeCustomizer />
      <PremiumEffects />
      <SyncManager />
    </main>
  );
}

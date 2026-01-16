import DashboardWelcome from '@/components/DashboardWelcome';
import GoalsSection from '@/components/GoalsSection';
import AchievementSystem from '@/components/AchievementSystem';
import StreakAndXP from '@/components/StreakAndXP';

export default function Dashboard() {
  return (
    <div className="space-y-12">
      <DashboardWelcome />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          <StreakAndXP />
          <GoalsSection />
        </div>
        <div className="space-y-12">
          <AchievementSystem />
        </div>
      </div>
    </div>
  );
}

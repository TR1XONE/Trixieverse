import DashboardWelcome from '@/components/DashboardWelcome';
import GoalsSection from '@/components/GoalsSection';

export default function Dashboard() {
  return (
    <div className="space-y-12">
      <DashboardWelcome />
      <GoalsSection />
    </div>
  );
}

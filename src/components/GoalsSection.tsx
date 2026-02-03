import { Button } from '@/components/ui/button';
import { useCoach, Goal } from '@/contexts/CoachContext';
import { CheckCircle2, Circle, Trash2, Target } from 'lucide-react';
import { useState } from 'react';

export default function GoalsSection() {
  const { goals, updateGoal } = useCoach();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    metric: '',
    targetValue: 0,
    currentValue: 0,
  });

  const handleAddGoal = () => {
    if (formData.title && formData.metric) {
      const { addGoal } = require('@/contexts/CoachContext').useCoach();
      addGoal({
        ...formData,
        targetValue: Number(formData.targetValue),
        currentValue: Number(formData.currentValue),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        completed: false,
      });
      setFormData({
        title: '',
        description: '',
        metric: '',
        targetValue: 0,
        currentValue: 0,
      });
      setShowAddForm(false);
    }
  };

  const completionPercentage = (goal: Goal) => {
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Target className="w-8 h-8 text-primary" />
          Your Goals
        </h2>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="gaming-button"
        >
          + Add Goal
        </Button>
      </div>

      {showAddForm && (
        <div className="coaching-card p-6 space-y-4 neon-glow">
          <input
            type="text"
            placeholder="Goal title (e.g., Improve CS/min)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 rounded-sm border-2 border-primary/50 bg-input text-foreground placeholder-muted-foreground hover:border-primary/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 rounded-sm border-2 border-primary/50 bg-input text-foreground placeholder-muted-foreground hover:border-primary/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Metric (e.g., CS/min)"
              value={formData.metric}
              onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
              className="px-4 py-2 rounded-sm border-2 border-secondary/50 bg-input text-foreground placeholder-muted-foreground hover:border-secondary/80 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
            />
            <input
              type="number"
              placeholder="Target value"
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
              className="px-4 py-2 rounded-sm border-2 border-secondary/50 bg-input text-foreground placeholder-muted-foreground hover:border-secondary/80 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddGoal} className="gaming-button">
              Create Goal
            </Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline" className="rounded-sm border-2 border-muted/50 hover:border-muted hover:bg-muted/20 uppercase font-bold tracking-wider">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="coaching-card p-8 text-center neon-glow">
            <p className="text-muted-foreground mb-4">No goals yet. Let's set your first one!</p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="gaming-button"
            >
              Create Your First Goal
            </Button>
          </div>
        ) : (
          goals.map((goal) => {
            const percentage = completionPercentage(goal);
            return (
              <div key={goal.id} className="coaching-card p-6 neon-glow hover:border-primary/80 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => updateGoal(goal.id, { completed: !goal.completed })}
                        className="flex-shrink-0 transition-all duration-200 hover:scale-110"
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-secondary animate-pulse" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" />
                        )}
                      </button>
                      <h3 className={`text-lg font-bold uppercase tracking-wider ${goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {goal.title}
                      </h3>
                    </div>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground ml-9">{goal.description}</p>
                    )}
                  </div>
                  <button className="text-muted-foreground hover:text-destructive transition-colors hover:scale-110">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="ml-9 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-bold uppercase tracking-wider">
                      {goal.currentValue} / {goal.targetValue} {goal.metric}
                    </span>
                    <span className="font-bold text-primary uppercase tracking-wider">{percentage}%</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-sm h-3 overflow-hidden border border-primary/30">
                    <div
                      className="bg-gradient-to-r from-primary via-secondary to-accent h-full transition-all duration-500 shadow-lg shadow-primary/50"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Goal, DailyLog, UserReward } from '../types';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [mood, setMood] = useState<number>(3);
  const [journal, setJournal] = useState('');
  const [loading, setLoading] = useState(true);
  const [newRewards, setNewRewards] = useState<UserReward[]>([]);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [goalsRes, moodRes, rewardsRes] = await Promise.all([
        api.get('/goals?active=true'),
        api.get(`/mood?startDate=${today}&endDate=${today}`),
        api.get('/rewards'),
      ]);

      setGoals(goalsRes.data.goals);

      const logs = moodRes.data.logs;
      if (logs.length > 0) {
        const log = logs[0];
        setTodayLog(log);
        setMood(log.mood || 3);
        setJournal(log.journal || '');
      }

      // Check for new rewards (awarded today)
      const todayRewards = rewardsRes.data.rewards.filter(
        (r: UserReward) => r.awardedAt.startsWith(today)
      );
      if (todayRewards.length > 0) {
        setNewRewards(todayRewards);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSubmit = async () => {
    try {
      const response = await api.post('/mood', {
        mood,
        journal: journal.trim() || undefined,
      });
      setTodayLog(response.data.dailyLog);
      alert('Mood logged successfully!');
    } catch (error) {
      console.error('Failed to log mood:', error);
      alert('Failed to log mood');
    }
  };

  const handleProgressLog = async (goalId: string, goalType: string) => {
    try {
      if (goalType === 'HABIT') {
        await api.post('/progress', {
          goalId,
          completed: true,
        });
      } else if (goalType === 'METRIC') {
        const value = prompt('Enter value:');
        if (value) {
          await api.post('/progress', {
            goalId,
            value: parseFloat(value),
          });
        } else {
          return;
        }
      } else if (goalType === 'TIME') {
        const minutes = prompt('Enter minutes:');
        if (minutes) {
          await api.post('/progress', {
            goalId,
            minutes: parseInt(minutes),
          });
        } else {
          return;
        }
      }

      // Refresh goals to see updated streaks
      const goalsRes = await api.get('/goals?active=true');
      setGoals(goalsRes.data.goals);

      // Check for new rewards
      const rewardsRes = await api.get('/rewards');
      const todayRewards = rewardsRes.data.rewards.filter(
        (r: UserReward) => r.awardedAt.startsWith(today)
      );
      if (todayRewards.length > newRewards.length) {
        setNewRewards(todayRewards);
        // Show badge notification
        const newBadge = todayRewards[todayRewards.length - 1];
        alert(`🎉 Congratulations! You earned a ${newBadge.badgeType} badge for ${newBadge.streakDays} day streak on "${newBadge.goalTitle}"!`);
      }

      alert('Progress logged!');
    } catch (error) {
      console.error('Failed to log progress:', error);
      alert('Failed to log progress');
    }
  };

  const hasLoggedToday = (goal: Goal) => {
    if (!goal.progress || goal.progress.length === 0) return false;
    const latestProgress = goal.progress[0];
    return latestProgress.date.startsWith(today);
  };

  const moodLabels = ['😞 Terrible', '😕 Bad', '😐 Okay', '🙂 Good', '😄 Great'];

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary-text mb-2">Dashboard</h1>
        <p className="text-secondary-text">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* New Rewards */}
      {newRewards.length > 0 && (
        <div className="bg-accent bg-opacity-10 border-2 border-accent rounded-lg p-6">
          <h2 className="text-xl font-semibold text-primary-text mb-4">🎉 New Badges Earned!</h2>
          <div className="space-y-2">
            {newRewards.map((reward) => (
              <div key={reward.id} className="flex items-center gap-3">
                <span className="text-2xl">
                  {reward.badgeType === 'BRONZE' && '🥉'}
                  {reward.badgeType === 'SILVER' && '🥈'}
                  {reward.badgeType === 'GOLD' && '🥇'}
                  {reward.badgeType === 'PLATINUM' && '💎'}
                </span>
                <div>
                  <p className="font-medium text-primary-text">
                    {reward.badgeType} Badge - {reward.streakDays} days
                  </p>
                  <p className="text-sm text-secondary-text">{reward.goalTitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood Logging */}
      <div className="bg-white rounded-lg shadow-md border border-divider p-6">
        <h2 className="text-xl font-semibold text-primary-text mb-4">How are you feeling today?</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              {moodLabels.map((label, index) => (
                <button
                  key={index}
                  onClick={() => setMood(index + 1)}
                  className={`px-4 py-2 rounded text-sm transition-all ${
                    mood === index + 1
                      ? 'bg-accent text-white scale-110'
                      : 'bg-hover-bg text-primary-text hover:bg-accent hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Daily Note (optional, max 500 characters)
            </label>
            <textarea
              value={journal}
              onChange={(e) => setJournal(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Quick thoughts about your day..."
              className="w-full px-3 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-xs text-secondary-text mt-1">{journal.length}/500</p>
          </div>

          <button
            onClick={handleMoodSubmit}
            className="w-full py-2 px-4 bg-accent text-white rounded hover:bg-primary-text transition-colors"
          >
            {todayLog ? 'Update Mood' : 'Log Mood'}
          </button>
        </div>
      </div>

      {/* Streak Check-in */}
      <div className="bg-white rounded-lg shadow-md border border-divider p-6">
        <h2 className="text-xl font-semibold text-primary-text mb-4">Today's Goals</h2>
        {goals.length === 0 ? (
          <p className="text-secondary-text">
            No active goals. <a href="/goals" className="text-accent hover:underline">Create one</a>
          </p>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const loggedToday = hasLoggedToday(goal);
              return (
                <div
                  key={goal.id}
                  className={`flex items-center justify-between p-4 rounded border ${
                    loggedToday
                      ? 'bg-accent bg-opacity-10 border-accent'
                      : 'bg-hover-bg border-divider'
                  }`}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-primary-text">{goal.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-secondary-text">
                        {goal.type === 'HABIT' && `🔥 ${goal.currentStreak} day streak`}
                        {goal.type === 'METRIC' &&
                          `📊 ${goal.totalProgress}/${goal.targetValue} ${goal.unit}`}
                        {goal.type === 'TIME' &&
                          `⏱️ ${goal.totalProgress}/${goal.targetMinutes} minutes`}
                      </p>
                      {goal.category && (
                        <span className="text-xs px-2 py-1 bg-white rounded">
                          {goal.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleProgressLog(goal.id, goal.type)}
                    disabled={loggedToday}
                    className={`px-4 py-2 rounded font-medium transition-colors whitespace-nowrap ${
                      loggedToday
                        ? 'bg-accent text-white cursor-not-allowed'
                        : 'bg-accent text-white hover:bg-primary-text'
                    }`}
                  >
                    {loggedToday ? '✓ Done' : 'Log +1'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

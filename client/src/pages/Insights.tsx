import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { InsightData, UserReward } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Insights: React.FC = () => {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [rewards, setRewards] = useState<UserReward[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [days]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const [insightsRes, rewardsRes] = await Promise.all([
        api.get(`/mood/insights/data?days=${days}`),
        api.get('/rewards'),
      ]);

      setInsights(insightsRes.data.insights);
      setRewards(rewardsRes.data.rewards);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverages = () => {
    const validMoodData = insights.filter((d) => d.mood !== null);
    const avgMood = validMoodData.length > 0
      ? validMoodData.reduce((sum, d) => sum + (d.mood || 0), 0) / validMoodData.length
      : 0;

    const avgCompletion = insights.length > 0
      ? insights.reduce((sum, d) => sum + d.completionRate, 0) / insights.length
      : 0;

    return {
      avgMood: avgMood.toFixed(1),
      avgCompletion: avgCompletion.toFixed(0),
    };
  };

  const { avgMood, avgCompletion } = calculateAverages();

  const chartData = insights.map((insight) => ({
    date: insight.date.split('-').slice(1).join('/'), // MM/DD format
    Mood: insight.mood,
    'Completion %': insight.completionRate,
  }));

  const badgeIcons = {
    BRONZE: '🥉',
    SILVER: '🥈',
    GOLD: '🥇',
    PLATINUM: '💎',
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary-text mb-2">Insights</h1>
        <p className="text-secondary-text">
          Track the correlation between your mood and goal completion rate
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow-md border border-divider p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-primary-text self-center mr-2">
            Time Range:
          </span>
          {[7, 14, 30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                days === d
                  ? 'bg-accent text-white'
                  : 'bg-hover-bg text-primary-text hover:bg-accent hover:text-white'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md border border-divider p-6">
          <h3 className="text-sm font-medium text-secondary-text mb-2">Average Mood</h3>
          <p className="text-4xl font-bold text-accent">{avgMood}/5</p>
          <p className="text-xs text-secondary-text mt-1">Over the last {days} days</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-divider p-6">
          <h3 className="text-sm font-medium text-secondary-text mb-2">Average Goal Completion</h3>
          <p className="text-4xl font-bold text-accent">{avgCompletion}%</p>
          <p className="text-xs text-secondary-text mt-1">Over the last {days} days</p>
        </div>
      </div>

      {/* Correlation Chart */}
      <div className="bg-white rounded-lg shadow-md border border-divider p-6 mb-6">
        <h2 className="text-xl font-semibold text-primary-text mb-4">
          Mood vs Goal Completion Rate
        </h2>
        {chartData.length === 0 ? (
          <div className="text-center py-12 text-secondary-text">
            No data available. Start logging your mood and completing goals to see insights!
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E3F1" />
              <XAxis
                dataKey="date"
                stroke="#3E4B58"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                yAxisId="left"
                stroke="#8194A8"
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#8194A8"
                domain={[0, 100]}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E3E3F1',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Mood"
                stroke="#8194A8"
                strokeWidth={2}
                dot={{ fill: '#8194A8', r: 4 }}
                connectNulls={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Completion %"
                stroke="#1D2C3B"
                strokeWidth={2}
                dot={{ fill: '#1D2C3B', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        <div className="mt-4 p-4 bg-hover-bg rounded text-sm text-secondary-text">
          <strong>💡 Insight:</strong> This graph shows how your daily mood correlates with your
          goal completion rate. Track patterns to understand how your habits affect your mood, or
          vice versa!
        </div>
      </div>

      {/* Badges & Rewards */}
      <div className="bg-white rounded-lg shadow-md border border-divider p-6">
        <h2 className="text-xl font-semibold text-primary-text mb-4">Your Badges</h2>
        {rewards.length === 0 ? (
          <p className="text-secondary-text">
            No badges earned yet. Keep logging your goals to earn badges at 7, 30, 100, and 365 day
            streaks!
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center gap-4 p-4 border border-divider rounded hover:bg-hover-bg transition-colors"
              >
                <span className="text-4xl">{badgeIcons[reward.badgeType]}</span>
                <div>
                  <h3 className="font-semibold text-primary-text">
                    {reward.badgeType} Badge
                  </h3>
                  <p className="text-sm text-secondary-text">{reward.goalTitle}</p>
                  <p className="text-xs text-accent mt-1">{reward.streakDays} day streak</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;

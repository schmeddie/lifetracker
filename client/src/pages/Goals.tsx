import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Goal, Category } from '../types';

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'HABIT' | 'METRIC' | 'TIME'>('HABIT');
  const [categoryId, setCategoryId] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [targetMinutes, setTargetMinutes] = useState('');

  // Category form state
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [goalsRes, categoriesRes] = await Promise.all([
        api.get('/goals'),
        api.get('/categories'),
      ]);
      setGoals(goalsRes.data.goals);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const goalData: any = {
        title,
        description: description.trim() || undefined,
        type,
        categoryId: categoryId || undefined,
      };

      if (type === 'METRIC') {
        goalData.targetValue = parseFloat(targetValue);
        goalData.unit = unit;
      } else if (type === 'TIME') {
        goalData.targetMinutes = parseInt(targetMinutes);
      }

      await api.post('/goals', goalData);
      alert('Goal created successfully!');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Failed to create goal:', error);
      alert(error.response?.data?.error || 'Failed to create goal');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/categories', {
        name: categoryName,
        color: categoryColor || undefined,
      });
      alert('Category created successfully!');
      setShowCategoryModal(false);
      setCategoryName('');
      setCategoryColor('');
      fetchData();
    } catch (error: any) {
      console.error('Failed to create category:', error);
      alert(error.response?.data?.error || 'Failed to create category');
    }
  };

  const handleToggleActive = async (goalId: string, isActive: boolean) => {
    try {
      await api.put(`/goals/${goalId}`, { isActive: !isActive });
      fetchData();
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/goals/${goalId}`);
      alert('Goal deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('HABIT');
    setCategoryId('');
    setTargetValue('');
    setUnit('');
    setTargetMinutes('');
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary-text">Goals</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 bg-secondary-text text-white rounded hover:bg-primary-text transition-colors"
          >
            + Category
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-primary-text transition-colors"
          >
            + New Goal
          </button>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat.id}
              className="px-3 py-1 bg-hover-bg text-primary-text rounded-full text-sm"
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}

      {/* Goals List */}
      <div className="grid gap-4 md:grid-cols-2">
        {goals.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-secondary-text">
            No goals yet. Create your first goal to get started!
          </div>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className={`bg-white rounded-lg shadow-md border border-divider p-6 ${
                !goal.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary-text">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-sm text-secondary-text mt-1">{goal.description}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    goal.type === 'HABIT'
                      ? 'bg-blue-100 text-blue-700'
                      : goal.type === 'METRIC'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {goal.type}
                </span>
              </div>

              {goal.category && (
                <div className="mb-3">
                  <span className="px-2 py-1 bg-hover-bg text-primary-text rounded text-sm">
                    {goal.category.name}
                  </span>
                </div>
              )}

              {/* Progress Stats */}
              <div className="space-y-2 mb-4">
                {goal.type === 'HABIT' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-text">Current Streak</span>
                      <span className="font-medium text-accent">🔥 {goal.currentStreak} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-text">Longest Streak</span>
                      <span className="font-medium">⭐ {goal.longestStreak} days</span>
                    </div>
                  </>
                )}

                {goal.type === 'METRIC' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-text">Progress</span>
                      <span className="font-medium">
                        {goal.totalProgress} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-divider rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((goal.totalProgress / (goal.targetValue || 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </>
                )}

                {goal.type === 'TIME' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-text">Time Logged</span>
                      <span className="font-medium">
                        {goal.totalProgress} / {goal.targetMinutes} minutes
                      </span>
                    </div>
                    <div className="w-full bg-divider rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((goal.totalProgress / (goal.targetMinutes || 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(goal.id, goal.isActive)}
                  className="flex-1 px-3 py-2 text-sm border border-divider rounded hover:bg-hover-bg transition-colors"
                >
                  {goal.isActive ? 'Pause' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-primary-text mb-4">Create New Goal</h2>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Goal Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="HABIT">Habit (Yes/No daily)</option>
                    <option value="METRIC">Metric (Track numbers)</option>
                    <option value="TIME">Time (Track minutes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Category (optional)
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">None</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {type === 'METRIC' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1">
                        Target Value *
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1">
                        Unit (e.g., km, £, pages) *
                      </label>
                      <input
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </>
                )}

                {type === 'TIME' && (
                  <div>
                    <label className="block text-sm font-medium text-primary-text mb-1">
                      Target Minutes *
                    </label>
                    <input
                      type="number"
                      value={targetMinutes}
                      onChange={(e) => setTargetMinutes(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-divider rounded hover:bg-hover-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-accent text-white rounded hover:bg-primary-text transition-colors"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-primary-text mb-4">Create Category</h2>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                    placeholder="e.g., Health, Career, Personal"
                    className="w-full px-3 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setCategoryName('');
                      setCategoryColor('');
                    }}
                    className="flex-1 px-4 py-2 border border-divider rounded hover:bg-hover-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-accent text-white rounded hover:bg-primary-text transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;

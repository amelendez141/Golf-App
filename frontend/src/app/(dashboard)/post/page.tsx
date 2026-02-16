'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import type { Course } from '@/lib/types';

const INDUSTRIES = [
  'TECHNOLOGY',
  'FINANCE',
  'HEALTHCARE',
  'LEGAL',
  'REAL_ESTATE',
  'CONSULTING',
  'MARKETING',
  'SALES',
  'ENGINEERING',
  'EXECUTIVE',
  'ENTREPRENEURSHIP',
  'OTHER',
];

const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'ANY'];

export default function PostTeeTimePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    courseId: '',
    date: '',
    time: '',
    totalSlots: 4,
    industryPreference: [] as string[],
    skillPreference: [] as string[],
    notes: '',
  });

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await api.getCourses({ limit: 100 });
        if (response.success && response.data) {
          setCourses(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    }
    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();

      const response = await api.createTeeTime({
        courseId: formData.courseId,
        dateTime,
        totalSlots: formData.totalSlots,
        industryPreference: formData.industryPreference.length > 0 ? formData.industryPreference as any : undefined,
        skillPreference: formData.skillPreference.length > 0 ? formData.skillPreference as any : undefined,
        notes: formData.notes || undefined,
      });

      if (response.success) {
        router.push('/my-times');
      } else {
        setError('Failed to create tee time. Please try again.');
      }
    } catch (err: any) {
      setError(err.error?.message || 'Failed to create tee time. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIndustry = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      industryPreference: prev.industryPreference.includes(industry)
        ? prev.industryPreference.filter(i => i !== industry)
        : [...prev.industryPreference, industry],
    }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skillPreference: prev.skillPreference.includes(skill)
        ? prev.skillPreference.filter(s => s !== skill)
        : [...prev.skillPreference, skill],
    }));
  };

  const formatIndustry = (industry: string) => {
    return industry.charAt(0) + industry.slice(1).toLowerCase().replace(/_/g, ' ');
  };

  const formatSkill = (skill: string) => {
    return skill.charAt(0) + skill.slice(1).toLowerCase();
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="py-6">
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-6">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-2">
              Post a Tee Time
            </h1>
            <p className="text-text-secondary">
              Create a tee time and find playing partners.
            </p>
          </div>

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Golf Course *
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-secondary border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary"
                >
                  <option value="">Select a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} - {course.city}, {course.state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    min={minDate}
                    required
                    className="w-full px-4 py-3 bg-secondary border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-secondary border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary"
                  />
                </div>
              </div>

              {/* Total Slots */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Group Size
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, totalSlots: num }))}
                      className={`flex-1 py-3 rounded-lg border transition-colors ${
                        formData.totalSlots === num
                          ? 'bg-primary text-white border-primary'
                          : 'bg-secondary border-primary/10 text-primary hover:border-primary/30'
                      }`}
                    >
                      {num} Players
                    </button>
                  ))}
                </div>
              </div>

              {/* Industry Preferences */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Preferred Industries (optional)
                </label>
                <p className="text-xs text-text-muted mb-3">
                  Leave empty to welcome all industries
                </p>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((industry) => (
                    <button
                      key={industry}
                      type="button"
                      onClick={() => toggleIndustry(industry)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        formData.industryPreference.includes(industry)
                          ? 'bg-accent text-white border-accent'
                          : 'bg-secondary border-primary/10 text-text-secondary hover:border-primary/30'
                      }`}
                    >
                      {formatIndustry(industry)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Preferences */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Preferred Skill Levels (optional)
                </label>
                <p className="text-xs text-text-muted mb-3">
                  Leave empty to welcome all skill levels
                </p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_LEVELS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        formData.skillPreference.includes(skill)
                          ? 'bg-accent text-white border-accent'
                          : 'bg-secondary border-primary/10 text-text-secondary hover:border-primary/30'
                      }`}
                    >
                      {formatSkill(skill)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional details about your round..."
                  rows={3}
                  className="w-full px-4 py-3 bg-secondary border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary placeholder:text-text-muted resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !formData.courseId || !formData.date || !formData.time}
                  className="flex-1"
                >
                  {isLoading ? 'Creating...' : 'Post Tee Time'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}

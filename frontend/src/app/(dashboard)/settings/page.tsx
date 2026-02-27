'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { SettingsSkeleton } from '@/components/ui/Skeleton';
import { INDUSTRIES, SKILL_LEVELS } from '@/lib/constants';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { Industry, SkillLevel } from '@/lib/types';

interface SettingsForm {
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  industry: Industry | '';
  bio: string;
  handicap: string;
  skillLevel: SkillLevel | '';
  city: string;
  state: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderNotifications: boolean;
}

interface PrivacySettings {
  profileVisibility: boolean;
  showHandicap: boolean;
  showCompany: boolean;
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState<SettingsForm>({
    firstName: '',
    lastName: '',
    jobTitle: '',
    company: '',
    industry: '',
    bio: '',
    handicap: '',
    skillLevel: '',
    city: '',
    state: '',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    reminderNotifications: true,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: true,
    showHandicap: true,
    showCompany: true,
  });

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        jobTitle: user.jobTitle || '',
        company: user.company || '',
        industry: (user.industry as Industry) || '',
        bio: user.bio || '',
        handicap: user.handicap?.toString() || '',
        skillLevel: (user.skillLevel as SkillLevel) || '',
        city: user.city || '',
        state: user.state || '',
      });
      setIsLoading(false);
    }
  }, [user]);

  const handleInputChange = (field: keyof SettingsForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const updateData: Record<string, unknown> = {
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        jobTitle: form.jobTitle || null,
        company: form.company || null,
        industry: form.industry || null,
        bio: form.bio || null,
        handicap: form.handicap ? parseFloat(form.handicap) : null,
        skillLevel: form.skillLevel || null,
        city: form.city || null,
        state: form.state || null,
      };

      const response = await api.updateProfile(updateData);

      if (response.success) {
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
        refreshUser();
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // For now, just show coordinates - in production, would reverse geocode
          setSaveMessage({
            type: 'success',
            text: `Location detected: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          });
        },
        (error) => {
          setSaveMessage({ type: 'error', text: 'Could not get your location. Please enter it manually.' });
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="py-4 sm:py-6 pb-24 sm:pb-6">
        <Container size="md">
          <SettingsSkeleton />
        </Container>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 pb-24 sm:pb-6">
      <Container size="md">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Settings
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Manage your account and preferences.
          </p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
            saveMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {saveMessage.text}
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          {/* Profile Settings */}
          <Card padding="md">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Profile Information
            </h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="John"
                  value={form.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
                <Input
                  label="Last Name"
                  placeholder="Smith"
                  value={form.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
              <Input
                label="Job Title"
                placeholder="Senior Account Executive"
                value={form.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              />
              <Input
                label="Company"
                placeholder="Acme Corp"
                value={form.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
              <Dropdown
                label="Industry"
                options={INDUSTRIES.map((i) => ({ value: i.id, label: i.label }))}
                value={form.industry}
                onChange={(value) => handleInputChange('industry', value)}
                placeholder="Select your industry"
              />
              <Input
                label="Bio"
                placeholder="Tell other golfers about yourself..."
                value={form.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
              />
            </div>
          </Card>

          {/* Golf Settings */}
          <Card padding="md">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Golf Profile
            </h2>
            <div className="space-y-4">
              <Input
                label="Handicap"
                type="number"
                placeholder="12"
                hint="Enter your current handicap index"
                value={form.handicap}
                onChange={(e) => handleInputChange('handicap', e.target.value)}
              />
              <Dropdown
                label="Skill Level"
                options={SKILL_LEVELS.map((s) => ({
                  value: s.id,
                  label: `${s.label} (${s.handicapRange})`,
                }))}
                value={form.skillLevel}
                onChange={(value) => handleInputChange('skillLevel', value)}
                placeholder="Select your skill level"
              />
            </div>
          </Card>

          {/* Location Settings */}
          <Card padding="md">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Location
            </h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="San Francisco"
                  value={form.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
                <Input
                  label="State"
                  placeholder="California"
                  value={form.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
              </div>
              <Button variant="secondary" size="sm" onClick={handleUseCurrentLocation}>
                Use Current Location
              </Button>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card padding="md">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Notifications
            </h2>
            <div className="space-y-4">
              <ToggleSetting
                label="Email notifications"
                description="Receive email updates about tee times and messages"
                checked={notifications.emailNotifications}
                onChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
              />
              <ToggleSetting
                label="Push notifications"
                description="Get notified about new tee times in your area"
                checked={notifications.pushNotifications}
                onChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
              />
              <ToggleSetting
                label="Reminder notifications"
                description="Receive reminders before your upcoming tee times"
                checked={notifications.reminderNotifications}
                onChange={(checked) => setNotifications(prev => ({ ...prev, reminderNotifications: checked }))}
              />
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card padding="md">
            <h2 className="font-serif text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Privacy
            </h2>
            <div className="space-y-4">
              <ToggleSetting
                label="Profile visibility"
                description="Allow other users to view your profile"
                checked={privacy.profileVisibility}
                onChange={(checked) => setPrivacy(prev => ({ ...prev, profileVisibility: checked }))}
              />
              <ToggleSetting
                label="Show handicap"
                description="Display your handicap on your profile"
                checked={privacy.showHandicap}
                onChange={(checked) => setPrivacy(prev => ({ ...prev, showHandicap: checked }))}
              />
              <ToggleSetting
                label="Show company"
                description="Display your company name on your profile"
                checked={privacy.showCompany}
                onChange={(checked) => setPrivacy(prev => ({ ...prev, showCompany: checked }))}
              />
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button variant="secondary" fullWidth className="sm:w-auto" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button fullWidth className="sm:w-auto" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm sm:text-base">{label}</p>
        <p className="text-xs sm:text-sm text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
          checked ? 'bg-accent' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-100 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

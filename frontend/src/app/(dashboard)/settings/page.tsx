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
      <div className="py-6">
        <Container size="md">
          <SettingsSkeleton />
        </Container>
      </div>
    );
  }

  return (
    <div className="py-6">
      <Container size="md">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-2">
            Settings
          </h1>
          <p className="text-text-secondary">
            Manage your account and preferences.
          </p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveMessage.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {saveMessage.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <h2 className="font-serif text-lg font-semibold text-primary mb-4">
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
          <Card>
            <h2 className="font-serif text-lg font-semibold text-primary mb-4">
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
          <Card>
            <h2 className="font-serif text-lg font-semibold text-primary mb-4">
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
          <Card>
            <h2 className="font-serif text-lg font-semibold text-primary mb-4">
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
          <Card>
            <h2 className="font-serif text-lg font-semibold text-primary mb-4">
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
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
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
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-primary">{label}</p>
        <p className="text-sm text-text-muted">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
          checked ? 'bg-accent' : 'bg-secondary-300'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

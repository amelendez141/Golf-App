'use client';

import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { INDUSTRIES, SKILL_LEVELS } from '@/lib/constants';

export default function SettingsPage() {
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

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <h2 className="font-serif text-lg font-semibold text-primary mb-4">
              Profile Information
            </h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="First Name" placeholder="John" />
                <Input label="Last Name" placeholder="Smith" />
              </div>
              <Input label="Job Title" placeholder="Senior Account Executive" />
              <Input label="Company" placeholder="Acme Corp" />
              <Dropdown
                label="Industry"
                options={INDUSTRIES.map((i) => ({ value: i.id, label: i.label }))}
                value=""
                onChange={() => {}}
                placeholder="Select your industry"
              />
              <Input
                label="Bio"
                placeholder="Tell other golfers about yourself..."
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
              />
              <Dropdown
                label="Skill Level"
                options={SKILL_LEVELS.map((s) => ({
                  value: s.id,
                  label: `${s.label} (${s.handicapRange})`,
                }))}
                value=""
                onChange={() => {}}
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
                <Input label="City" placeholder="San Francisco" />
                <Input label="State" placeholder="California" />
              </div>
              <Button variant="secondary" size="sm">
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
              />
              <ToggleSetting
                label="Push notifications"
                description="Get notified about new tee times in your area"
              />
              <ToggleSetting
                label="Reminder notifications"
                description="Receive reminders before your upcoming tee times"
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
              />
              <ToggleSetting
                label="Show handicap"
                description="Display your handicap on your profile"
              />
              <ToggleSetting
                label="Show company"
                description="Display your company name on your profile"
              />
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-primary">{label}</p>
        <p className="text-sm text-text-muted">{description}</p>
      </div>
      <button
        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-secondary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        role="switch"
        aria-checked="false"
      >
        <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform translate-x-0" />
      </button>
    </div>
  );
}

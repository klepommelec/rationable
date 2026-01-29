import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './switch';
import { Label } from './label';
import { useState } from 'react';

const meta = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex items-center space-x-2">
        <Switch
          id="airplane-mode"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <Label htmlFor="airplane-mode">Airplane Mode</Label>
      </div>
    );
  },
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="checked-switch" defaultChecked />
      <Label htmlFor="checked-switch">Enabled</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="disabled-switch" disabled />
      <Label htmlFor="disabled-switch" className="opacity-50">
        Disabled
      </Label>
    </div>
  ),
};

export const DisabledChecked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="disabled-checked-switch" disabled defaultChecked />
      <Label htmlFor="disabled-checked-switch" className="opacity-50">
        Disabled (Checked)
      </Label>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => {
    const [notifications, setNotifications] = useState(true);
    const [marketing, setMarketing] = useState(false);
    const [security, setSecurity] = useState(true);

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="notifications"
            checked={notifications}
            onCheckedChange={setNotifications}
          />
          <Label htmlFor="notifications">Email notifications</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="marketing"
            checked={marketing}
            onCheckedChange={setMarketing}
          />
          <Label htmlFor="marketing">Marketing emails</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="security"
            checked={security}
            onCheckedChange={setSecurity}
          />
          <Label htmlFor="security">Security alerts</Label>
        </div>
      </div>
    );
  },
};

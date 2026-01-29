import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { useState } from 'react';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
    );
  },
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="checked" defaultChecked />
      <Label htmlFor="checked">Checked by default</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="disabled" disabled />
      <Label htmlFor="disabled" className="opacity-50">
        Disabled
      </Label>
    </div>
  ),
};

export const DisabledChecked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="disabled-checked" disabled defaultChecked />
      <Label htmlFor="disabled-checked" className="opacity-50">
        Disabled (Checked)
      </Label>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => {
    const [items, setItems] = useState({
      item1: false,
      item2: true,
      item3: false,
    });

    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="item1"
            checked={items.item1}
            onCheckedChange={(checked) =>
              setItems({ ...items, item1: checked as boolean })
            }
          />
          <Label htmlFor="item1">Item 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="item2"
            checked={items.item2}
            onCheckedChange={(checked) =>
              setItems({ ...items, item2: checked as boolean })
            }
          />
          <Label htmlFor="item2">Item 2</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="item3"
            checked={items.item3}
            onCheckedChange={(checked) =>
              setItems({ ...items, item3: checked as boolean })
            }
          />
          <Label htmlFor="item3">Item 3</Label>
        </div>
      </div>
    );
  },
};

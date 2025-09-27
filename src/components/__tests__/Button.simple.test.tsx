import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Button } from '@/components/ui/button';

describe('Button - Simple Test', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('should render with variant prop', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    
    const button = screen.getByRole('button', { name: /secondary button/i });
    expect(button).toBeInTheDocument();
  });
});



import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@/test/test-utils';
import {
  TouchButton,
  SwipeableCard,
  LongPressButton,
  PullToRefresh,
  TouchSlider,
  SwipeableListItem
} from '../touch-friendly-components';

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true
});

describe('TouchButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with children', () => {
    render(<TouchButton onClick={mockOnClick}>Click Me</TouchButton>);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should call onClick when pressed', () => {
    render(<TouchButton onClick={mockOnClick}>Click Me</TouchButton>);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should provide haptic feedback when enabled', () => {
    render(
      <TouchButton onClick={mockOnClick} hapticFeedback>
        Click Me
      </TouchButton>
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(navigator.vibrate).toHaveBeenCalledWith(50);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should not vibrate when haptic feedback is disabled', () => {
    render(
      <TouchButton onClick={mockOnClick} hapticFeedback={false}>
        Click Me
      </TouchButton>
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(navigator.vibrate).not.toHaveBeenCalled();
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    render(
      <TouchButton onClick={mockOnClick} className="custom-class">
        Click Me
      </TouchButton>
    );
    
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <TouchButton onClick={mockOnClick} disabled>
        Click Me
      </TouchButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });
});

describe('SwipeableCard', () => {
  const mockOnSwipeLeft = vi.fn();
  const mockOnSwipeRight = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with children', () => {
    render(
      <SwipeableCard onSwipeLeft={mockOnSwipeLeft} onSwipeRight={mockOnSwipeRight}>
        <div>Card Content</div>
      </SwipeableCard>
    );
    
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should handle touch events for swiping', () => {
    render(
      <SwipeableCard onSwipeLeft={mockOnSwipeLeft} onSwipeRight={mockOnSwipeRight}>
        <div>Card Content</div>
      </SwipeableCard>
    );

    const card = screen.getByText('Card Content').parentElement;

    // Simulate swipe right
    fireEvent.touchStart(card!, {
      touches: [{ clientX: 0, clientY: 0, identifier: 0 } as Touch]
    });

    fireEvent.touchEnd(card!, {
      changedTouches: [{ clientX: 100, clientY: 0, identifier: 0 } as Touch]
    });

    expect(mockOnSwipeRight).toHaveBeenCalled();
  });

  it('should show swipe indicators when swiping', async () => {
    render(
      <SwipeableCard 
        onSwipeLeft={mockOnSwipeLeft} 
        onSwipeRight={mockOnSwipeRight}
        leftAction={{ icon: <span>Left</span>, color: 'red' }}
        rightAction={{ icon: <span>Right</span>, color: 'green' }}
      >
        <div>Card Content</div>
      </SwipeableCard>
    );

    const card = screen.getByText('Card Content').parentElement;

    // Start swiping
    fireEvent.touchStart(card!, {
      touches: [{ clientX: 0, clientY: 0, identifier: 0 } as Touch]
    });

    fireEvent.touchMove(card!, {
      touches: [{ clientX: 50, clientY: 0, identifier: 0 } as Touch]
    });

    // Should show swipe indicator
    await waitFor(() => {
      expect(screen.getByText('Right')).toBeInTheDocument();
    });
  });

  it('should not trigger swipe for small movements', () => {
    render(
      <SwipeableCard onSwipeLeft={mockOnSwipeLeft} onSwipeRight={mockOnSwipeRight}>
        <div>Card Content</div>
      </SwipeableCard>
    );

    const card = screen.getByText('Card Content').parentElement;

    // Simulate small movement (less than threshold)
    fireEvent.touchStart(card!, {
      touches: [{ clientX: 0, clientY: 0, identifier: 0 } as Touch]
    });

    fireEvent.touchEnd(card!, {
      changedTouches: [{ clientX: 30, clientY: 0, identifier: 0 } as Touch]
    });

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });
});

describe('LongPressButton', () => {
  const mockOnLongPress = vi.fn();
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should trigger onLongPress after delay', async () => {
    render(
      <LongPressButton
        onLongPress={mockOnLongPress}
        onClick={mockOnClick}
        delay={500}
      >
        Long Press Me
      </LongPressButton>
    );

    const button = screen.getByRole('button');

    fireEvent.mouseDown(button);
    
    // Advance timers to trigger long press
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockOnLongPress).toHaveBeenCalledTimes(1);
    expect(navigator.vibrate).toHaveBeenCalledWith([50, 50, 50]);
  });

  it('should not trigger onLongPress if released early', () => {
    render(
      <LongPressButton
        onLongPress={mockOnLongPress}
        onClick={mockOnClick}
        delay={500}
      >
        Long Press Me
      </LongPressButton>
    );

    const button = screen.getByRole('button');

    fireEvent.mouseDown(button);
    
    // Release before delay
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    fireEvent.mouseUp(button);
    
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockOnLongPress).not.toHaveBeenCalled();
  });

  it('should trigger regular click for short press', () => {
    render(
      <LongPressButton
        onLongPress={mockOnLongPress}
        onClick={mockOnClick}
        delay={500}
      >
        Long Press Me
      </LongPressButton>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should show visual feedback during long press', () => {
    render(
      <LongPressButton
        onLongPress={mockOnLongPress}
        onClick={mockOnClick}
        delay={500}
      >
        Long Press Me
      </LongPressButton>
    );

    const button = screen.getByRole('button');

    fireEvent.mouseDown(button);

    // Should have pressed state class
    expect(button).toHaveClass('scale-95');
  });
});

describe('PullToRefresh', () => {
  const mockOnRefresh = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children', () => {
    render(
      <PullToRefresh onRefresh={mockOnRefresh}>
        <div>Content to refresh</div>
      </PullToRefresh>
    );

    expect(screen.getByText('Content to refresh')).toBeInTheDocument();
  });

  it('should trigger refresh when pulled down', async () => {
    render(
      <PullToRefresh onRefresh={mockOnRefresh} threshold={100}>
        <div>Content to refresh</div>
      </PullToRefresh>
    );

    const container = screen.getByText('Content to refresh').parentElement;

    // Simulate pull down gesture
    fireEvent.touchStart(container!, {
      touches: [{ clientX: 0, clientY: 0, identifier: 0 } as Touch]
    });

    fireEvent.touchMove(container!, {
      touches: [{ clientX: 0, clientY: 150, identifier: 0 } as Touch]
    });

    fireEvent.touchEnd(container!, {
      changedTouches: [{ clientX: 0, clientY: 150, identifier: 0 } as Touch]
    });

    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('should show loading state during refresh', async () => {
    const slowRefresh = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <PullToRefresh onRefresh={slowRefresh}>
        <div>Content to refresh</div>
      </PullToRefresh>
    );

    const container = screen.getByText('Content to refresh').parentElement;

    // Trigger refresh
    fireEvent.touchStart(container!, {
      touches: [{ clientX: 0, clientY: 0, identifier: 0 } as Touch]
    });

    fireEvent.touchMove(container!, {
      touches: [{ clientX: 0, clientY: 150, identifier: 0 } as Touch]
    });

    fireEvent.touchEnd(container!, {
      changedTouches: [{ clientX: 0, clientY: 150, identifier: 0 } as Touch]
    });

    // Should show loading indicator
    expect(screen.getByText('Refreshing...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Refreshing...')).not.toBeInTheDocument();
    });
  });

  it('should not trigger refresh for small movements', () => {
    render(
      <PullToRefresh onRefresh={mockOnRefresh} threshold={100}>
        <div>Content to refresh</div>
      </PullToRefresh>
    );

    const container = screen.getByText('Content to refresh').parentElement;

    // Simulate small pull (below threshold)
    fireEvent.touchStart(container!, {
      touches: [{ clientX: 0, clientY: 0, identifier: 0 } as Touch]
    });

    fireEvent.touchMove(container!, {
      touches: [{ clientX: 0, clientY: 50, identifier: 0 } as Touch]
    });

    fireEvent.touchEnd(container!, {
      changedTouches: [{ clientX: 0, clientY: 50, identifier: 0 } as Touch]
    });

    expect(mockOnRefresh).not.toHaveBeenCalled();
  });
});

describe('TouchSlider', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with initial value', () => {
    render(
      <TouchSlider
        value={50}
        min={0}
        max={100}
        onChange={mockOnChange}
        label="Test Slider"
      />
    );

    expect(screen.getByLabelText('Test Slider')).toBeInTheDocument();
  });

  it('should update value on interaction', () => {
    render(
      <TouchSlider
        value={50}
        min={0}
        max={100}
        onChange={mockOnChange}
        label="Test Slider"
      />
    );

    const slider = screen.getByRole('slider');
    
    fireEvent.change(slider, { target: { value: '75' } });

    expect(mockOnChange).toHaveBeenCalledWith(75);
  });

  it('should respect min and max values', () => {
    render(
      <TouchSlider
        value={50}
        min={10}
        max={90}
        onChange={mockOnChange}
        label="Test Slider"
      />
    );

    const slider = screen.getByRole('slider');

    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '90');
  });

  it('should show value when enabled', () => {
    render(
      <TouchSlider
        value={75}
        min={0}
        max={100}
        onChange={mockOnChange}
        label="Test Slider"
        showValue
      />
    );

    expect(screen.getByText('75')).toBeInTheDocument();
  });
});

describe('SwipeableListItem', () => {
  const mockOnSwipeLeft = vi.fn();
  const mockOnSwipeRight = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render list item content', () => {
    render(
      <SwipeableListItem
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
      >
        <div>List Item Content</div>
      </SwipeableListItem>
    );

    expect(screen.getByText('List Item Content')).toBeInTheDocument();
  });

  it('should handle swipe gestures', () => {
    render(
      <SwipeableListItem
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
      >
        <div>List Item Content</div>
      </SwipeableListItem>
    );

    const item = screen.getByText('List Item Content').parentElement;

    // Simulate swipe left
    fireEvent.touchStart(item!, {
      touches: [{ clientX: 100, clientY: 0, identifier: 0 } as Touch]
    });

    fireEvent.touchEnd(item!, {
      changedTouches: [{ clientX: 0, clientY: 0, identifier: 0 } as Touch]
    });

    expect(mockOnSwipeLeft).toHaveBeenCalled();
  });

  it('should show action buttons when swiping', async () => {
    const leftActions = [
      { id: 'archive', label: 'Archive', color: 'blue', icon: <span>📁</span> }
    ];
    
    const rightActions = [
      { id: 'delete', label: 'Delete', color: 'red', icon: <span>🗑️</span> }
    ];

    render(
      <SwipeableListItem
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        leftActions={leftActions}
        rightActions={rightActions}
      >
        <div>List Item Content</div>
      </SwipeableListItem>
    );

    const item = screen.getByText('List Item Content').parentElement;

    // Start swiping to reveal actions
    fireEvent.touchStart(item!, {
      touches: [{ clientX: 0, clientY: 0, identifier: 0 } as Touch]
    });

    fireEvent.touchMove(item!, {
      touches: [{ clientX: 100, clientY: 0, identifier: 0 } as Touch]
    });

    // Should show action buttons
    await waitFor(() => {
      expect(screen.getByText('Archive')).toBeInTheDocument();
    });
  });
});
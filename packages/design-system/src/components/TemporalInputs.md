# Temporal Input Components

## Overview
A complete set of temporal input components built on React Aria for date and time input with segment-based interaction.

## Components

### DateInput
- Segment-based date input (day/month/year)
- No calendar popup - manual input only
- Auto-focus advancement when segment is filled
- Customizable date format

### TimeInput
- Segment-based time input (hour/minute/second)
- 12/24 hour format support
- Auto-focus advancement
- Granularity control (hour/minute/second)

### DateTimeInput
- Combined date and time input in a single field
- Uses same segment logic as DateInput but with time segments
- Granularity control for time precision
- Unified field for smooth input experience

### DateRangeInput
- Range selection with start and end dates
- Built on `useDateRangePicker` from React Aria
- Independent editing of start/end dates
- Visual separator between ranges

## Core Features

### Segment-based Input
- Each part (day, month, year, hour, etc.) is a separate segment
- Direct keyboard input without string parsing
- Smart auto-advance logic:
  - Month: advances after entering 2-9 or two digits
  - Day: advances after entering 4-9 or two digits
  - Hour/Minute/Second: context-aware advancement

### Keyboard Navigation
- Tab/Shift+Tab between segments
- Arrow keys for increment/decrement
- Separator keys (/, -, :, space) jump to next segment
- Full keyboard accessibility

### Architecture
- **TemporalCore**: Shared logic and utilities
  - `TemporalSegment`: Segment renderer with React Aria integration
  - `TemporalContext`: Shared state provider
  - `formatUtils`: Date/time format tokens
  - `hooks`: Controlled state management

### Format System
- Token-based formatting (not string templates)
- Predefined formats (US, European, ISO)
- Custom format support
- Locale-aware rendering

## Usage Example

```tsx
import { DateInput } from './DateInput';
import { TimeInput } from './TimeInput';
import { DateTimeInput } from './DateTimeInput';
import { DateRangeInput } from './DateRangeInput';

// Date input
<DateInput
  value={date}
  onChange={setDate}
  format={customFormat}
/>

// Time input with seconds
<TimeInput
  value={time}
  onChange={setTime}
  granularity="second"
/>

// DateTime with minute precision
<DateTimeInput
  value={dateTime}
  onChange={setDateTime}
  granularity="minute"
/>

// Date range
<DateRangeInput
  value={range}
  onChange={setRange}
/>
```

## Implementation Notes

- Built entirely on React Aria hooks
- No native date inputs used
- Full TypeScript support
- Compound component pattern for flexibility
- Integrates with existing InputGroup component
- Clean, minimal implementation without placeholder overlays
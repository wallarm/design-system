import figma from '@figma/code-connect';
import { Button } from '../Button';
import { Calendar } from './Calendar';
import { CalendarApplyButton } from './CalendarApplyButton';
import { CalendarBody } from './CalendarBody';
import { CalendarContent } from './CalendarContent';
import { CalendarFooter } from './CalendarFooter';
import { CalendarFooterControls } from './CalendarFooterControls';
import { CalendarGrids } from './CalendarGrids';
import { CalendarInputHeader } from './CalendarInputHeader';
import { CalendarKeyboardHints } from './CalendarKeyboardHints';
import { CalendarPresets } from './CalendarPresets';
import { CalendarResetButton } from './CalendarResetButton';
import { CalendarTrigger } from './CalendarTrigger';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=2233-8455';

// Single calendar - basic
figma.connect(Calendar, figmaNodeUrl, {
  variant: {
    Type: 'Single',
    Presets: false,
    Input: false,
    Footer: false,
  },
  example: () => (
    <Calendar type='single'>
      <Button variant='outline' color='neutral'>
        Select date
      </Button>
    </Calendar>
  ),
});

// Single calendar with input
figma.connect(Calendar, figmaNodeUrl, {
  variant: {
    Type: 'Single',
    Presets: false,
    Input: true,
    Footer: false,
  },
  example: () => (
    <Calendar type='single' showInput>
      <Button variant='outline' color='neutral'>
        Select date
      </Button>
    </Calendar>
  ),
});

// Single calendar with presets
figma.connect(Calendar, figmaNodeUrl, {
  variant: {
    Type: 'Single',
    Presets: true,
    Input: false,
    Footer: false,
  },
  example: () => (
    <Calendar type='single' showPresets>
      <Button variant='outline' color='neutral'>
        Select date
      </Button>
    </Calendar>
  ),
});

// Single calendar with presets and input
figma.connect(Calendar, figmaNodeUrl, {
  variant: {
    Type: 'Single',
    Presets: true,
    Input: true,
    Footer: false,
  },
  example: () => (
    <Calendar type='single' showPresets showInput>
      <Button variant='outline' color='neutral'>
        Select date
      </Button>
    </Calendar>
  ),
});

// Single calendar full featured
figma.connect(Calendar, figmaNodeUrl, {
  variant: {
    Type: 'Single',
    Presets: true,
    Input: true,
    Footer: true,
  },
  example: () => (
    <Calendar type='single' showPresets showInput showFooter>
      <Button variant='outline' color='neutral'>
        Select date
      </Button>
    </Calendar>
  ),
});

// Double calendar - basic
figma.connect(Calendar, figmaNodeUrl, {
  variant: {
    Type: 'Double',
    Presets: false,
    Input: false,
    Footer: false,
  },
  example: () => (
    <Calendar type='double'>
      <Button variant='outline' color='neutral'>
        Select date range
      </Button>
    </Calendar>
  ),
});

// Double calendar with input
figma.connect(Calendar, figmaNodeUrl, {
  variant: {
    Type: 'Double',
    Presets: false,
    Input: true,
    Footer: false,
  },
  example: () => (
    <Calendar type='double' showInput>
      <Button variant='outline' color='neutral'>
        Select date range
      </Button>
    </Calendar>
  ),
});

// Double calendar with presets
figma.connect(Calendar, figmaNodeUrl, {
  variant: {
    Type: 'Double',
    Presets: true,
    Input: false,
    Footer: false,
  },
  example: () => (
    <Calendar type='double' showPresets>
      <Button variant='outline' color='neutral'>
        Select date range
      </Button>
    </Calendar>
  ),
});

// Double calendar with presets and input
figma.connect(Calendar, figmaNodeUrl, {
  variant: {
    Type: 'Double',
    Presets: true,
    Input: true,
    Footer: false,
  },
  example: () => (
    <Calendar type='double' showPresets showInput>
      <Button variant='outline' color='neutral'>
        Select date range
      </Button>
    </Calendar>
  ),
});

// Double calendar full featured
figma.connect(Calendar, figmaNodeUrl, {
  variant: {
    Type: 'Double',
    Presets: true,
    Input: true,
    Footer: true,
  },
  example: () => (
    <Calendar type='double' showPresets showInput showFooter>
      <Button variant='outline' color='neutral'>
        Select date range
      </Button>
    </Calendar>
  ),
});

// Assembled pattern example (for documentation)
figma.connect(Calendar, figmaNodeUrl, {
  variant: {
    Type: 'Double',
    Presets: true,
    Input: true,
    Footer: true,
  },
  example: () => (
    <Calendar type='double'>
      <CalendarTrigger>
        <Button variant='outline' color='neutral'>
          Select date range
        </Button>
      </CalendarTrigger>
      <CalendarContent>
        <CalendarPresets />
        <CalendarBody>
          <CalendarInputHeader />
          <CalendarGrids />
          <CalendarFooter>
            <CalendarKeyboardHints />
            <CalendarFooterControls>
              <CalendarResetButton />
              <CalendarApplyButton />
            </CalendarFooterControls>
          </CalendarFooter>
        </CalendarBody>
      </CalendarContent>
    </Calendar>
  ),
});

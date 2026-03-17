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
      <CalendarTrigger>
        <Button variant='outline' color='neutral'>
          Select date
        </Button>
      </CalendarTrigger>
      <CalendarContent>
        <CalendarBody>
          <CalendarGrids />
        </CalendarBody>
      </CalendarContent>
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
    <Calendar type='single'>
      <CalendarTrigger>
        <Button variant='outline' color='neutral'>
          Select date
        </Button>
      </CalendarTrigger>
      <CalendarContent>
        <CalendarBody>
          <CalendarInputHeader />
          <CalendarGrids />
        </CalendarBody>
      </CalendarContent>
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
    <Calendar type='single'>
      <CalendarTrigger>
        <Button variant='outline' color='neutral'>
          Select date
        </Button>
      </CalendarTrigger>
      <CalendarContent>
        <CalendarPresets />
        <CalendarBody>
          <CalendarGrids />
        </CalendarBody>
      </CalendarContent>
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
    <Calendar type='single'>
      <CalendarTrigger>
        <Button variant='outline' color='neutral'>
          Select date
        </Button>
      </CalendarTrigger>
      <CalendarContent>
        <CalendarPresets />
        <CalendarBody>
          <CalendarInputHeader />
          <CalendarGrids />
        </CalendarBody>
      </CalendarContent>
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
    <Calendar type='single'>
      <CalendarTrigger>
        <Button variant='outline' color='neutral'>
          Select date
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

// Double calendar - basic
figma.connect(Calendar, figmaNodeUrl, {
  variant: {
    Type: 'Double',
    Presets: false,
    Input: false,
    Footer: false,
  },
  example: () => (
    <Calendar type='range'>
      <CalendarTrigger>
        <Button variant='outline' color='neutral'>
          Select date range
        </Button>
      </CalendarTrigger>
      <CalendarContent>
        <CalendarBody>
          <CalendarGrids />
        </CalendarBody>
      </CalendarContent>
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
    <Calendar type='range'>
      <CalendarTrigger>
        <Button variant='outline' color='neutral'>
          Select date range
        </Button>
      </CalendarTrigger>
      <CalendarContent>
        <CalendarBody>
          <CalendarInputHeader />
          <CalendarGrids />
        </CalendarBody>
      </CalendarContent>
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
    <Calendar type='range'>
      <CalendarTrigger>
        <Button variant='outline' color='neutral'>
          Select date range
        </Button>
      </CalendarTrigger>
      <CalendarContent>
        <CalendarPresets />
        <CalendarBody>
          <CalendarGrids />
        </CalendarBody>
      </CalendarContent>
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
    <Calendar type='range'>
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
        </CalendarBody>
      </CalendarContent>
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
    <Calendar type='range'>
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

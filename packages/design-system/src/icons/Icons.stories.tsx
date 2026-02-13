import { useState } from 'react';
import { createListCollection } from '@ark-ui/react';
import type { Meta, StoryObj } from '@storybook/react';
import { Flex } from '../components/Flex';
import { Heading } from '../components/Heading';
import { Input } from '../components/Input';
import {
  Select,
  SelectButton,
  SelectContent,
  type SelectDataItem,
  SelectOption,
  SelectOptionText,
  SelectPositioner,
} from '../components/Select';
import { HStack, VStack } from '../components/Stack';
import { Text } from '../components/Text';
import { ToggleButton } from '../components/ToggleButton';
// Import all icon components
import { Activity } from './Activity';
import { Alt } from './Alt';
import { ArrowBigUp } from './ArrowBigUp';
import { ArrowBigUpDash } from './ArrowBigUpDash';
import { ArrowDown } from './ArrowDown';
import { ArrowDownLeft } from './ArrowDownLeft';
import { ArrowDownRight } from './ArrowDownRight';
import { ArrowLeft } from './ArrowLeft';
import { ArrowRight } from './ArrowRight';
import { ArrowUp } from './ArrowUp';
import { ArrowUpLeft } from './ArrowUpLeft';
import { ArrowUpRight } from './ArrowUpRight';
import { Calendar } from './Calendar';
import { CalendarCheck } from './CalendarCheck';
import { CalendarCheck2 } from './CalendarCheck2';
import { CalendarClock } from './CalendarClock';
import { CalendarCog } from './CalendarCog';
import { CalendarDays } from './CalendarDays';
import { CalendarFold } from './CalendarFold';
import { CalendarHeart } from './CalendarHeart';
import { CalendarMinus } from './CalendarMinus';
import { CalendarMinus2 } from './CalendarMinus2';
import { CalendarOff } from './CalendarOff';
import { CalendarPlus } from './CalendarPlus';
import { CalendarPlus2 } from './CalendarPlus2';
import { CalendarRange } from './CalendarRange';
import { CalendarSearch } from './CalendarSearch';
import { CalendarX } from './CalendarX';
import { CalendarX2 } from './CalendarX2';
import { Check } from './Check';
import { CheckCheck } from './CheckCheck';
import { ChevronDown } from './ChevronDown';
import { ChevronFirst } from './ChevronFirst';
import { ChevronLast } from './ChevronLast';
import { ChevronLeft } from './ChevronLeft';
import { ChevronRight } from './ChevronRight';
import { ChevronsDown } from './ChevronsDown';
import { ChevronsLeft } from './ChevronsLeft';
import { ChevronsRight } from './ChevronsRight';
import { ChevronsUp } from './ChevronsUp';
import { ChevronUp } from './ChevronUp';
import { Circle } from './Circle';
import { CircleArrowDown } from './CircleArrowDown';
import { CircleArrowLeft } from './CircleArrowLeft';
import { CircleArrowOutDownLeft } from './CircleArrowOutDownLeft';
import { CircleArrowOutDownRight } from './CircleArrowOutDownRight';
import { CircleArrowOutUpLeft } from './CircleArrowOutUpLeft';
import { CircleArrowOutUpRight } from './CircleArrowOutUpRight';
import { CircleArrowRight } from './CircleArrowRight';
import { CircleArrowUp } from './CircleArrowUp';
import { CircleCheck } from './CircleCheck';
import { CircleCheckBig } from './CircleCheckBig';
import { CircleChevronDown } from './CircleChevronDown';
import { CircleChevronLeft } from './CircleChevronLeft';
import { CircleChevronRight } from './CircleChevronRight';
import { CircleChevronUp } from './CircleChevronUp';
import { CircleDashed } from './CircleDashed';
import { CircleDotDashed } from './CircleDotDashed';
import { CircleEllipsis } from './CircleEllipsis';
import { CircleHelp } from './CircleHelp';
import { CirclePlus } from './CirclePlus';
import { Clock } from './Clock';
import { Command } from './Command';
import { Ctrl } from './Ctrl';
import { Dot } from './Dot';
import { Earth } from './Earth';
import { EarthLock } from './EarthLock';
import { Ellipsis } from './Ellipsis';
import { Filter } from './Filter';
import { FilterX } from './FilterX';
import { Folder } from './Folder';
import { FunnelPlus } from './FunnelPlus';
import { GitCommitHorizontal } from './GitCommitHorizontal';
import { GitCommitVertical } from './GitCommitVertical';
import { GitCompare } from './GitCompare';
import { GitCompareArrows } from './GitCompareArrows';
import { GitFork } from './GitFork';
import { GitGraph } from './GitGraph';
import { GitMerge } from './GitMerge';
import { GitPullRequest } from './GitPullRequest';
import { GitPullRequestArrow } from './GitPullRequestArrow';
import { GitPullRequestClosed } from './GitPullRequestClosed';
import { GitPullRequestCreate } from './GitPullRequestCreate';
import { GitPullRequestCreateArrow } from './GitPullRequestCreateArrow';
import { GitPullRequestDraft } from './GitPullRequestDraft';
import { Globe } from './Globe';
import { GlobeLock } from './GlobeLock';
import { History } from './History';
import { Home } from './Home';
import { Info } from './Info';
import { Keyboard } from './Keyboard';
import { KeyRound } from './KeyRound';
import { KeySquare } from './KeySquare';
import { Layers } from './Layers';
import { Layers2 } from './Layers2';
import { Layers3 } from './Layers3';
import { LayoutDashboard } from './LayoutDashboard';
import { LayoutGrid } from './LayoutGrid';
import { LayoutList } from './LayoutList';
import { LayoutPanelLeft } from './LayoutPanelLeft';
import { LayoutPanelTop } from './LayoutPanelTop';
import { LayoutTemplate } from './LayoutTemplate';
import { LibraryBig } from './LibraryBig';
import { Loader } from './Loader';
import { LoaderCircle } from './LoaderCircle';
import { Lock } from './Lock';
import { LockOpen } from './LockOpen';
import { Maximize } from './Maximize';
import { Maximize2 } from './Maximize2';
import { Megaphone } from './Megaphone';
import { MegaphoneOff } from './MegaphoneOff';
import { MessageSquare } from './MessageSquare';
import { MessageSquareText } from './MessageSquareText';
import { MessageSquareWarning } from './MessageSquareWarning';
import { MessageSquareX } from './MessageSquareX';
import { MessagesSquare } from './MessagesSquare';
import { Minus } from './Minus';
import { Mouse } from './Mouse';
import { Move3D } from './Move3D';
import { NotebookPen } from './NotebookPen';
import { NotepadText } from './NotepadText';
import { OctagonAlert } from './OctagonAlert';
import { PanelBottom } from './PanelBottom';
import { PanelBottomOpen } from './PanelBottomOpen';
import { PanelRight } from './PanelRight';
import { PanelRightClose } from './PanelRightClose';
import { PanelRightDashed } from './PanelRightDashed';
import { PanelRightOpen } from './PanelRightOpen';
import { Paperclip } from './Paperclip';
import { Pen } from './Pen';
import { Pencil } from './Pencil';
import { PencilLine } from './PencilLine';
import { PencilOff } from './PencilOff';
import { PencilRuler } from './PencilRuler';
import { PenLine } from './PenLine';
import { PenOff } from './PenOff';
import { PenTool } from './PenTool';
import { Pentagon } from './Pentagon';
import { Plus } from './Plus';
import { Quote } from './Quote';
import { Redo } from './Redo';
import { Redo2 } from './Redo2';
import { RedoDot } from './RedoDot';
import { RefreshCcw } from './RefreshCcw';
import { RefreshCwOff } from './RefreshCwOff';
import { Search } from './Search';
import { Shift } from './Shift';
import { Skull } from './Skull';
import { SlidersHorizontal } from './SlidersHorizontal';
import { SlidersVertical } from './SlidersVertical';
import { Space } from './Space';
import { SquareArrowOutUpRight } from './SquareArrowOutUpRight';
import type { SvgIconSize } from './SvgIcon';
import { Trash } from './Trash';
import { Trash2 } from './Trash2';
import { TriangleAlert } from './TriangleAlert';
import { Undo } from './Undo';
import { Undo2 } from './Undo2';
import { UndoDot } from './UndoDot';
import { Wrench } from './Wrench';
import { X } from './X';
import { ZoomIn } from './ZoomIn';
import { ZoomOut } from './ZoomOut';

// Icon categories for organization
const iconCategories = {
  Arrows: {
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUpLeft,
    ArrowUpRight,
    ArrowDownLeft,
    ArrowDownRight,
    ArrowBigUp,
    ArrowBigUpDash,
  },
  Chevrons: {
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronFirst,
    ChevronLast,
    ChevronsUp,
    ChevronsDown,
    ChevronsLeft,
    ChevronsRight,
  },
  'Circle Icons': {
    Circle,
    CircleCheck,
    CircleCheckBig,
    CirclePlus,
    CircleHelp,
    CircleDashed,
    CircleDotDashed,
    CircleEllipsis,
  },
  'Circle Arrows': {
    CircleArrowUp,
    CircleArrowDown,
    CircleArrowLeft,
    CircleArrowRight,
    CircleArrowOutUpLeft,
    CircleArrowOutUpRight,
    CircleArrowOutDownLeft,
    CircleArrowOutDownRight,
  },
  'Circle Chevrons': {
    CircleChevronUp,
    CircleChevronDown,
    CircleChevronLeft,
    CircleChevronRight,
  },
  'Basic Actions': {
    Check,
    CheckCheck,
    Plus,
    Minus,
    X,
    Search,
    Info,
  },
  'Calendar & Time': {
    Calendar,
    CalendarCheck,
    CalendarCheck2,
    CalendarClock,
    CalendarCog,
    CalendarDays,
    CalendarFold,
    CalendarHeart,
    CalendarMinus,
    CalendarMinus2,
    CalendarOff,
    CalendarPlus,
    CalendarPlus2,
    CalendarRange,
    CalendarSearch,
    CalendarX,
    CalendarX2,
    Clock,
  },
  'Keyboard Keys': {
    Alt,
    Command,
    Ctrl,
    Shift,
    Space,
  },
  'Layout & Panels': {
    LayoutDashboard,
    LayoutGrid,
    LayoutList,
    LayoutPanelLeft,
    LayoutPanelTop,
    LayoutTemplate,
    PanelBottom,
    PanelBottomOpen,
    PanelRight,
    PanelRightClose,
    PanelRightDashed,
    PanelRightOpen,
  },
  Layers: {
    Layers,
    Layers2,
    Layers3,
    LibraryBig,
  },
  Messages: {
    MessageSquare,
    MessageSquareText,
    MessageSquareWarning,
    MessageSquareX,
    MessagesSquare,
  },
  Movement: {
    Move3D,
  },
  Notes: {
    NotebookPen,
    NotepadText,
  },
  'Mouse & Pointers': {
    Mouse,
  },
  Shapes: {
    Pentagon,
    TriangleAlert,
    OctagonAlert,
    Dot,
  },
  'Editing Tools': {
    Pen,
    PenLine,
    PenOff,
    PenTool,
    Pencil,
    PencilLine,
    PencilOff,
    PencilRuler,
    Paperclip,
    Quote,
  },
  'Git & Version Control': {
    GitCommitHorizontal,
    GitCommitVertical,
    GitCompare,
    GitCompareArrows,
    GitFork,
    GitGraph,
    GitMerge,
    GitPullRequest,
    GitPullRequestArrow,
    GitPullRequestClosed,
    GitPullRequestCreate,
    GitPullRequestCreateArrow,
    GitPullRequestDraft,
    Activity,
  },
  'Security & Access': {
    Lock,
    LockOpen,
    KeyRound,
    KeySquare,
    Earth,
    EarthLock,
    Globe,
    GlobeLock,
    Skull,
  },
  'Filters & Controls': {
    Filter,
    FilterX,
    FunnelPlus,
    SlidersHorizontal,
    SlidersVertical,
  },
  'Actions & State': {
    Loader,
    LoaderCircle,
    Maximize,
    Maximize2,
    Megaphone,
    MegaphoneOff,
    Ellipsis,
  },
  Navigation: {
    Home,
    Folder,
    History,
    Keyboard,
    ZoomIn,
    ZoomOut,
    SquareArrowOutUpRight,
  },
  'Editing Actions': {
    Redo,
    Redo2,
    RedoDot,
    Undo,
    Undo2,
    UndoDot,
    RefreshCcw,
    RefreshCwOff,
  },
  Utilities: {
    Trash,
    Trash2,
    Wrench,
  },
};

const meta: Meta = {
  title: 'Primitives/Icons',
  parameters: {
    layout: 'centered',
    docs: {
      canvas: {
        sourceState: 'none',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const IconGrid = ({ icons, title }: { icons: Record<string, any>; title: string }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSize, setSelectedSize] = useState<SvgIconSize>('md');

  const collection = createListCollection<SelectDataItem>({
    items: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].map(size => ({
      value: size,
      label: size.toUpperCase(),
    })),
  });

  const filteredIcons = Object.entries(icons).filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <VStack spacing={12} align='stretch'>
      <VStack spacing={12}>
        <Heading>{title}</Heading>

        <HStack spacing={8}>
          <Input
            type='text'
            placeholder='Search icons...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          <Select
            collection={collection}
            value={[selectedSize]}
            onSelect={({ value }) => setSelectedSize(value as SvgIconSize)}
          >
            <SelectButton />

            <SelectPositioner>
              <SelectContent>
                {collection.items.map(option => (
                  <SelectOption key={option.value} item={option}>
                    <SelectOptionText>{option.label}</SelectOptionText>
                  </SelectOption>
                ))}
              </SelectContent>
            </SelectPositioner>
          </Select>
        </HStack>
      </VStack>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {filteredIcons.map(([name, IconComponent]) => (
          <div
            key={name}
            className='flex flex-col items-center justify-center p-16 border border-border-primary rounded-8 bg-component-outline-button-bg transition-colors cursor-pointer'
            onClick={() => navigator.clipboard?.writeText(`<${name} />`)}
            title={`Click to copy: <${name} />`}
          >
            <IconComponent size={selectedSize} style={{ marginBottom: '8px' }} />

            <Text color='secondary' size='sm'>
              {name}
            </Text>
          </div>
        ))}
      </div>

      {filteredIcons.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
          }}
        >
          <Text color='secondary'>No icons found matching "{searchTerm}"</Text>
        </div>
      )}
    </VStack>
  );
};

export const AllIcons: Story = {
  render: () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const allIcons = Object.values(iconCategories).reduce((acc, categoryIcons) => {
      return { ...acc, ...categoryIcons };
    }, {});

    const displayIcons =
      selectedCategory === 'All'
        ? allIcons
        : iconCategories[selectedCategory as keyof typeof iconCategories] || {};

    return (
      <VStack spacing={20} align='stretch'>
        <Flex gap={8} wrap='wrap'>
          <ToggleButton
            active={selectedCategory === 'All'}
            onToggle={() => setSelectedCategory('All')}
          >
            All ({Object.keys(allIcons).length})
          </ToggleButton>
          {Object.keys(iconCategories).map(category => (
            <ToggleButton
              key={category}
              active={selectedCategory === category}
              onToggle={() => setSelectedCategory(category)}
            >
              {category} (
              {Object.keys(iconCategories[category as keyof typeof iconCategories]).length})
            </ToggleButton>
          ))}
        </Flex>

        <IconGrid
          icons={displayIcons}
          title={selectedCategory === 'All' ? 'All Icons' : selectedCategory}
        />
      </VStack>
    );
  },
};

export const IconSizes: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px' }}>Icon Sizes</h3>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Check size='xs' title='Check icon XS' />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>XS</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Check size='sm' title='Check icon SM' />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>SM</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Check size='md' title='Check icon MD' />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>MD</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Check size='lg' title='Check icon LG' />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>LG</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Check size='xl' title='Check icon XL' />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>XL</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Check size='2xl' title='Check icon 2XL' />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>2XL</div>
        </div>
      </div>
    </div>
  ),
};

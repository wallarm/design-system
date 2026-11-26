import { type AnimationEvent, type CSSProperties, type FC, useContext, useState } from 'react';
import { Bar, BarChart, type BarShapeProps, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { cn } from '../../../utils/cn';
import { funnelBandClasses } from './classes';
import {
  FUNNEL_BAND_HEIGHT,
  FUNNEL_HALO_OPACITY,
  FUNNEL_HALOS,
  FUNNEL_MIN_BODY,
} from './constants';
import { FunnelRibbonContext } from './FunnelContext';
import { funnelSegmentPath } from './lib/funnelGeometry';

const NO_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };
const Y_DOMAIN = [0, 1];
const BAND = { band: 1 };

/** One step's segment: two halos and the body, from this step's thickness to the next one's. */
interface FunnelRibbonSegmentProps {
  index: number;
  /** The plot area recharts lays the bars out in. */
  plot: BarShapeProps['parentViewBox'];
}

const FunnelRibbonSegment: FC<FunnelRibbonSegmentProps> = ({ index, plot }) => {
  const { thicknesses, fills, activeIndex } = useContext(FunnelRibbonContext);
  // Column i spans exactly [i·W/n, (i+1)·W/n]: recharts rounds the bar width down, which would
  // leave sub-pixel seams between segments and stop the ribbon short of the right edge.
  const width = plot.width / fills.length;
  const x = plot.x + index * width;
  const from = thicknesses[index] ?? FUNNEL_MIN_BODY;
  const to = thicknesses[index + 1] ?? from;
  const dimmed = activeIndex !== null && activeIndex !== index;
  return (
    <g
      data-slot='funnel-ribbon-fill'
      data-dimmed={dimmed || undefined}
      className={cn(fills[index], funnelBandClasses)}
      style={{ '--funnel-i': index } as CSSProperties}
    >
      {FUNNEL_HALOS.map(grow => (
        <path
          key={grow}
          d={funnelSegmentPath(from, to, grow, x, width)}
          fillOpacity={FUNNEL_HALO_OPACITY[grow]}
        />
      ))}
      <path d={funnelSegmentPath(from, to, 0, x, width)} />
    </g>
  );
};

// Module-level so the `shape` prop never changes identity.
const renderSegment = ({ index, parentViewBox }: BarShapeProps) => (
  <FunnelRibbonSegment index={index} plot={parentViewBox} />
);

interface FunnelRibbonProps {
  /** Body thickness per step, from `funnelThicknesses`. */
  thicknesses: readonly number[];
  /** Fill classes per step, from `funnelStepFills`. */
  fills: readonly string[];
  activeIndex: number | null;
  testId: string | undefined;
}

/**
 * The ribbon under the title cells: a recharts `BarChart` with one category per step. The bars
 * are never drawn — each bar's shape paints its step's smooth segment over an exact `1/n` column
 * of recharts' plot area, which spans the same track as the step columns.
 */
export const FunnelRibbon: FC<FunnelRibbonProps> = ({
  thicknesses,
  fills,
  activeIndex,
  testId,
}) => {
  const count = fills.length;
  // Depends on the step count only: the bars just place one shape per step in the plot.
  const data = Array.from({ length: count }, () => BAND);

  // Once the last band has grown in, the entrance is off for good: a resize recomputes recharts'
  // rectangles and remounts the shapes, which would otherwise replay it.
  const [entered, setEntered] = useState(false);
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    const target = event.target as SVGElement;
    const isLast = target.style.getPropertyValue('--funnel-i') === String(count - 1);
    if (event.animationName === 'ds-funnel-band-in' && isLast) setEntered(true);
  };

  return (
    <div
      aria-hidden
      data-slot='funnel-ribbon'
      data-testid={testId ? `${testId}--ribbon` : undefined}
      data-entered={entered || undefined}
      onAnimationEnd={handleAnimationEnd}
      // In RTL the columns run right to left; mirroring the whole plot keeps step i under column i.
      className='absolute inset-x-0 top-100 h-172 pointer-events-none rtl:-scale-x-100'
    >
      <FunnelRibbonContext value={{ thicknesses, fills, activeIndex }}>
        <ResponsiveContainer width='100%' height={FUNNEL_BAND_HEIGHT}>
          <BarChart
            data={data}
            margin={NO_MARGIN}
            barCategoryGap={0}
            barGap={0}
            // The title cells are the accessible surface; the plot is `aria-hidden`.
            accessibilityLayer={false}
          >
            <XAxis hide />
            <YAxis hide domain={Y_DOMAIN} />
            {/* Entrance is CSS (`funnelBandClasses`), like the rest of the family. */}
            <Bar dataKey='band' isAnimationActive={false} activeBar={false} shape={renderSegment} />
          </BarChart>
        </ResponsiveContainer>
      </FunnelRibbonContext>
    </div>
  );
};

FunnelRibbon.displayName = 'FunnelRibbon';

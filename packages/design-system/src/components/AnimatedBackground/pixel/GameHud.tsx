import type { FC } from 'react';
import { cn } from '../../../utils/cn';
import type { GameStats } from './module';

interface GameHudProps {
  caught: number;
  armed: boolean;
  roundOver: boolean;
  stats: GameStats;
  accuracy: number;
  faced: number;
  catchKey: number;
  gateTarget: number;
  onTryAgain: () => void;
  soundOn: boolean;
}

export const GameHud: FC<GameHudProps> = ({
  caught,
  armed,
  roundOver,
  stats,
  accuracy,
  faced,
  catchKey,
  gateTarget,
  onTryAgain,
  soundOn,
}) => {
  const showCounter = caught > 0;

  return (
    <>
      {showCounter && (
        <div
          className='fixed top-24 right-24 flex flex-col items-end gap-6 font-mono pointer-events-none'
          style={{ animation: 'hud-in 0.3s ease-out' }}
        >
          <div
            className={cn(
              'flex flex-col border w-120 border-text-hint bg-states-primary-hover',
              armed ? '' : 'items-center justify-center',
            )}
          >
            {armed ? (
              <>
                <div className='flex flex-col items-center gap-4 px-16 py-8'>
                  <span className='text-base leading-xl font-bold tabular-nums text-text-success'>
                    {stats.stopped}
                    <span className='opacity-45'> / {faced}</span>
                  </span>
                  <span
                    className='text-xs leading-xs uppercase text-text-secondary'
                    style={{ fontFeatureSettings: '"liga" 0' }}
                  >
                    HIT
                  </span>
                </div>

                <div className='h-px w-full bg-border-primary' />

                <div className='flex flex-col items-center gap-4 px-16 py-8'>
                  <span className='text-base leading-xl font-bold tabular-nums text-text-success'>
                    {accuracy}%
                  </span>
                  <span
                    className='text-xs leading-xs uppercase text-text-secondary'
                    style={{ fontFeatureSettings: '"liga" 0' }}
                  >
                    SCORE
                  </span>
                </div>
              </>
            ) : (
              <div className='flex flex-col items-center gap-4 px-16 py-8'>
                <span
                  key={catchKey}
                  className='text-base leading-xl font-bold tabular-nums text-text-success'
                  style={{ animation: 'catch-pop 0.25s ease-out' }}
                >
                  {caught}
                  <span className='opacity-45'> / {gateTarget}</span>
                </span>
                <span
                  className='text-xs leading-xs uppercase text-text-secondary'
                  style={{ fontFeatureSettings: '"liga" 0' }}
                >
                  INSERT COIN
                </span>
              </div>
            )}
          </div>

          {roundOver && (
            <button
              type='button'
              className='pointer-events-auto text-2xs leading-sm font-mono uppercase underline underline-offset-4 hover:text-[var(--animated-bg-accent-dot)] text-text-secondary'
              onClick={onTryAgain}
            >
              Try again
            </button>
          )}

          {armed && !roundOver && (
            <span className='text-2xs leading-sm text-text-secondary'>
              {`\u2190 \u2192 move \u00B7 space fire \u00B7 esc exit \u00B7 m sound ${soundOn ? 'off' : 'on'}`}
            </span>
          )}
        </div>
      )}

      {caught > 0 && !armed && (
        <div
          className='fixed bottom-24 left-1/2 -translate-x-1/2 text-xs pointer-events-none text-text-secondary'
          style={{ animation: 'hud-in 0.3s ease-out' }}
        >
          {`Click the red anomalies \u2014 catch 5 to arm the cannon \u00B7 m sound ${soundOn ? 'off' : 'on'}`}
        </div>
      )}
    </>
  );
};

GameHud.displayName = 'GameHud';

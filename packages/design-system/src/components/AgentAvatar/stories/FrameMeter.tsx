import { type FC, useEffect, useState } from 'react';
import { subscribeFrames } from './subscribeFrames';

/** Story-only: engine frames per second and JavaScript per frame, refreshed every second. */
export const FrameMeter: FC = () => {
  const [meter, setMeter] = useState({ fps: 0, js: 0, max: 0 });
  useEffect(() => {
    const acc = { n: 0, sum: 0, max: 0 };
    const stop = subscribeFrames(js => {
      acc.n++;
      acc.sum += js;
      acc.max = Math.max(acc.max, js);
    });
    const id = setInterval(() => {
      setMeter({ fps: acc.n, js: acc.n ? acc.sum / acc.n : 0, max: acc.max });
      acc.n = 0;
      acc.sum = 0;
      acc.max = 0;
    }, 1000);
    return () => {
      clearInterval(id);
      stop();
    };
  }, []);
  return (
    <span
      className='sb-annotation'
      data-testid='agent-avatar-meter'
      data-fps={meter.fps}
      data-js={meter.js.toFixed(3)}
      data-max={meter.max.toFixed(3)}
    >
      {`${meter.fps} fps · ${meter.js.toFixed(2)} ms JS per frame (max ${meter.max.toFixed(2)})`}
    </span>
  );
};

import type { GamePlugins } from './game-logic';
import type { RenderPlugins } from './game-renderer';

let cached: { game: GamePlugins; render: RenderPlugins } | null = null;

export async function loadGamePlugins(): Promise<{
  game: GamePlugins;
  render: RenderPlugins;
}> {
  if (cached) return cached;
  const [sfx, cel, celR] = await Promise.all([
    import('./sfx'),
    import('./celebration'),
    import('./celebration-renderer'),
  ]);
  cached = {
    game: {
      playCoin: sfx.playCoin,
      playZap: sfx.playZap,
      playPew: sfx.playPew,
      playPowerUp: sfx.playPowerUp,
      playFanfare: sfx.playFanfare,
      startCelebration: cel.startCelebration,
      stepCelebration: cel.stepCelebration,
      adjustCelebrationTimeMarkers: cel.adjustCelebrationTimeMarkers,
      tierForScore: cel.tierForScore,
    },
    render: {
      CEL_CAUGHT_COL: cel.CEL_CAUGHT_COL,
      celDotEffect: cel.celDotEffect,
      computeCelFrameParams: cel.computeCelFrameParams,
      drawCelebrationOverlay: celR.drawCelebrationOverlay,
      getCelCannonOffset: celR.getCelCannonOffset,
    },
  };
  return cached;
}

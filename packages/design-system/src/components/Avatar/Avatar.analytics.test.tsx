import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { FileUpload, FileUploadTrigger } from '../FileUpload';
import { Avatar, AvatarFallback, AvatarImage } from '.';

afterEach(() => vi.restoreAllMocks());

describe('Avatar — analytics (docs/metrics/contract.md)', () => {
  const PROPS = '{"surface":"profile"}';

  it('lands data-analytics-* and onClick on the real button through both Slot layers', async () => {
    const spy = captureAnalyticsClicks();
    const onClick = vi.fn();
    render(
      <FileUpload data-testid='fu'>
        <FileUploadTrigger asChild data-analytics-id='AVATAR_CHANGE' data-analytics-props={PROPS}>
          <Avatar asChild onClick={onClick}>
            <button type='button' aria-label='Change avatar'>
              <AvatarImage />
              <AvatarFallback />
            </button>
          </Avatar>
        </FileUploadTrigger>
      </FileUpload>,
    );
    const button = screen.getByTestId('fu--trigger');
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('data-analytics-props')).toBe(PROPS);
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith('AVATAR_CHANGE');
  });

  it('forwards analytics attributes on a plain Avatar root', () => {
    render(
      <Avatar data-testid='av' data-analytics-id='AVATAR_VIEW'>
        <AvatarFallback />
      </Avatar>,
    );
    expect(screen.getByTestId('av')).toHaveAttribute('data-analytics-id', 'AVATAR_VIEW');
  });
});

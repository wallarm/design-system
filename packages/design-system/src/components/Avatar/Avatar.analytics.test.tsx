import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  Avatar,
  AvatarContent,
  AvatarDescription,
  AvatarFallback,
  AvatarImage,
  AvatarName,
} from '.';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { FileUpload, FileUploadTrigger } from '../FileUpload';

afterEach(() => {
  rs.restoreAllMocks();
});

describe('Avatar — analytics (docs/metrics/contract.md)', () => {
  const PROPS = '{"surface":"profile"}';

  it('lands data-analytics-* and onClick on the real button through both Slot layers', async () => {
    const spy = captureAnalyticsClicks();
    const onClick = rs.fn();
    render(
      <FileUpload data-testid='fu'>
        <FileUploadTrigger asChild data-analytics-id='AVATAR_CHANGE' data-analytics-props={PROPS}>
          <Avatar as='button' aria-label='Change avatar' onClick={onClick}>
            <AvatarImage />
            <AvatarFallback />
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

  it('forwards consumer attributes on the content, name and description nodes', () => {
    render(
      <Avatar data-testid='av'>
        <AvatarFallback />
        <AvatarContent data-analytics-id='USER_ITEM'>
          <AvatarName data-analytics-props={PROPS}>Ada</AvatarName>
          <AvatarDescription aria-label='Email'>ada@example.com</AvatarDescription>
        </AvatarContent>
      </Avatar>,
    );
    expect(screen.getByTestId('av--content')).toHaveAttribute('data-analytics-id', 'USER_ITEM');
    expect(screen.getByTestId('av--name').getAttribute('data-analytics-props')).toBe(PROPS);
    expect(screen.getByTestId('av--description')).toHaveAttribute('aria-label', 'Email');
  });
});

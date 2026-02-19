import type { FC, PropsWithChildren } from 'react';
import { Tour as ArkUiTour, type TourRootProps as ArkUiTourRootProps } from '@ark-ui/react';
import { TourContent } from './TourContent';

export type TourProps = ArkUiTourRootProps;

export const Tour: FC<PropsWithChildren<TourProps>> = ({ children, ...props }) => (
  <ArkUiTour.Root {...props}>
    <TourContent>{children}</TourContent>
  </ArkUiTour.Root>
);

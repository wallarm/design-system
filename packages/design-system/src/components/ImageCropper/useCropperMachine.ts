import { useId, useLayoutEffect, useRef } from 'react';
import { useEnvironmentContext } from '@ark-ui/react/environment';
import type { UseImageCropperProps } from '@ark-ui/react/image-cropper';
import { useLocaleContext } from '@ark-ui/react/locale';
import * as imageCropper from '@zag-js/image-cropper';
import { normalizeProps, useMachine } from '@zag-js/react';

/**
 * Zag 1.43.3's zoom prop only initializes/watches internal state. Keep rejected controlled
 * edits transactional: its zoom callback runs before the proposed pan offset is committed,
 * so capture that offset and restore both fields before paint when the owner rejects zoom.
 * Accepted edits retain native wheel/pinch anchoring; no gesture logic is duplicated here.
 */
export const useCropperMachine = (props: UseImageCropperProps) => {
  const id = useId();
  const { dir } = useLocaleContext();
  const { getRootNode } = useEnvironmentContext();
  const pendingOffset = useRef<{ x: number; y: number } | null>(null);
  const restoring = useRef(false);
  const service: imageCropper.Service = useMachine(imageCropper.machine, {
    id,
    dir,
    getRootNode,
    ...props,
    onZoomChange: details => {
      if (restoring.current || details.zoom === props.zoom) return;
      if (props.zoom !== undefined && pendingOffset.current === null) {
        pendingOffset.current = { ...service.context.get('offset') };
      }
      props.onZoomChange?.(details);
    },
  });
  const api = imageCropper.connect(service, normalizeProps);
  useLayoutEffect(() => {
    if (props.zoom !== undefined && api.zoom !== props.zoom && pendingOffset.current) {
      restoring.current = true;
      service.context.set('zoom', props.zoom);
      service.context.set('offset', pendingOffset.current);
      restoring.current = false;
    }
    pendingOffset.current = null;
  }, [api.zoom, props.zoom, service]);
  return api;
};

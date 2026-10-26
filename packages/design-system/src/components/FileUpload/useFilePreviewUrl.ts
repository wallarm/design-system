import { useEffect, useState } from 'react';

/**
 * An object URL for previewing a picked file (e.g. in `AvatarImage`), revoked when the file
 * changes or the component unmounts. The effect manages the blob URL's lifetime — an external
 * resource, not derived state.
 */
export const useFilePreviewUrl = (file?: File | null): string | undefined => {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!file) {
      // oxlint-disable-next-line react/set-state-in-effect -- The effect owns an external blob URL and must clear the revoked resource on file removal.
      setUrl(undefined);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  return url;
};

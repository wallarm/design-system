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
      setUrl(undefined);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  return url;
};

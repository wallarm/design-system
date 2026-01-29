import type { FC, PropsWithChildren } from 'react';

export const ToastIcon: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="shrink-0 pt-2 pb-2" data-part="toast-icon">
      {children}
    </div>
  );
};

ToastIcon.displayName = 'ToastIcon';

import type { FC } from 'react';

import { useSelectContext } from '@ark-ui/react/select';

interface SelectButtonTagValueProps {
  placeholder: string;
}

export const SelectButtonTagValue: FC<SelectButtonTagValueProps> = ({
  placeholder,
}) => {
  const { valueAsString } = useSelectContext();

  return valueAsString ? `${placeholder}: ${valueAsString}` : placeholder;
};

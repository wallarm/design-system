import type { FC, ReactNode } from 'react';
import type { GenUiComponent } from './define';
import { Placeholder } from './Placeholder';

interface GuardedViewProps {
  component: GenUiComponent;
  /** The props as the format resolved them: untrusted, and possibly incomplete mid-stream. */
  props: unknown;
  emit: (event: string) => void;
  children?: ReactNode;
}

/**
 * Renders a component only with props that match its schema. Neither format validates props
 * before rendering, and a View can't defend against every value a model may send (an enum value
 * the DS lacks, a missing required field). A props object that fails holds a placeholder instead:
 * mid-stream that is a binding whose data hasn't arrived yet, at the end a mistake in the answer.
 */
export const GuardedView: FC<GuardedViewProps> = ({ component, props, emit, children }) => {
  const parsed = component.props.safeParse(props);
  if (!parsed.success) {
    return (
      <Placeholder
        id={component.name}
        detail={parsed.error.issues.map(i => `${i.path.join('.') || '(props)'}: ${i.message}`)}
      />
    );
  }
  const { View } = component;
  return (
    <View props={parsed.data} emit={emit}>
      {children}
    </View>
  );
};

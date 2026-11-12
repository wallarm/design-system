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
 * the DS lacks, a missing required field). A props object that fails holds the component's
 * skeleton instead: mid-stream that is a binding whose data hasn't arrived yet, at the end a
 * mistake in the answer (the reasons are in the skeleton's tooltip).
 */
export const GuardedView: FC<GuardedViewProps> = ({ component, props, emit, children }) => {
  const parsed = component.props.safeParse(props);
  if (!parsed.success) {
    const { Skeleton } = component;
    const title = isRecord(props) && typeof props.title === 'string' ? props.title : undefined;
    return (
      <Placeholder
        id={component.name}
        detail={parsed.error.issues.map(i => `${i.path.join('.') || '(props)'}: ${i.message}`)}
      >
        {Skeleton && <Skeleton title={title} />}
      </Placeholder>
    );
  }
  const { View } = component;
  return (
    <View props={parsed.data} emit={emit}>
      {children}
    </View>
  );
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

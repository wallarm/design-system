import { type FC, type ReactNode, useState } from 'react';
import type { GenUiComponent } from '../core/define';
import { isRecord } from '../core/guards';
import { Placeholder } from './Placeholder';
import { useSurfaceForm } from './SurfaceForm';

interface GuardedViewProps {
  component: GenUiComponent;
  /** The props as the format resolved them: untrusted, and possibly incomplete mid-stream. */
  props: unknown;
  emit: (event: string) => void;
  /**
   * Writes a `bindable` prop to the path the agent bound it to, and says whether it did; a prop
   * the agent sent as a literal has no path, so the value stays here instead.
   */
  write?: (prop: string, value: unknown) => boolean;
  children?: ReactNode;
}

/**
 * Renders a component only with props that match its schema. Neither format validates props
 * before rendering, and a View can't defend against every value a model may send (an enum value
 * the DS lacks, a missing required field). A props object that fails holds the component's
 * skeleton instead: mid-stream that is a binding whose data hasn't arrived yet, at the end a
 * mistake in the answer (the reasons are in the skeleton's tooltip). Props that pass are checked
 * with the entry's `validate`, and the error is kept on the surface's form.
 */
export const GuardedView: FC<GuardedViewProps> = ({ component, props, emit, write, children }) => {
  const [local, setLocal] = useState<Record<string, unknown>>({});
  const [touched, setTouched] = useState(false);
  const set = (prop: string, value: unknown) => {
    if (!component.bindable?.includes(prop)) return;
    setTouched(true);
    if (write?.(prop, value)) return;
    setLocal(current => ({ ...current, [prop]: value }));
  };
  const parsed = component.props.safeParse(isRecord(props) ? { ...props, ...local } : props);
  const form = useSurfaceForm(
    parsed.success ? component.validate?.(parsed.data) : undefined,
    touched,
  );
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
    <View props={parsed.data} emit={emit} set={set} error={form.shown} checkForm={form.check}>
      {children}
    </View>
  );
};

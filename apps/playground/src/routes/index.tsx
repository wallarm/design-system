import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@wallarm-org/design-system/Button';
import { Heading } from '@wallarm-org/design-system/Heading';
import { VStack } from '@wallarm-org/design-system/Stack';
import { Text } from '@wallarm-org/design-system/Text';
import { useTheme } from '@wallarm-org/design-system/ThemeProvider';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { theme, setTheme } = useTheme();

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  const handleSwitchTheme = () => setTheme(nextTheme);

  return (
    <div className='flex flex-col justify-center w-screen h-screen p-32'>
      <VStack spacing={12} justify='center' align='center'>
        <Heading color='primary'>Wallarm Design System Playground</Heading>
        <Text color='secondary' align='center'>
          Welcome to the Wallarm Design System Playground. This is where you can explore and test
          components.
        </Text>

        <Button onClick={handleSwitchTheme}>Switch theme to {nextTheme}</Button>
      </VStack>
    </div>
  );
}

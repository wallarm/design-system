import figma from '@figma/code-connect';

import { InlineCodeSnippet } from './InlineCodeSnippet';

const figmaNodeUrl =
    'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=2983-55138';

figma.connect(InlineCodeSnippet, figmaNodeUrl, {
    props: {
        code: figma.string('Code'),
        size: figma.enum('Size', {
            sm: 'sm',
            md: 'md',
            lg: 'lg',
        }),
    },
    example: ({ code, size }) => <InlineCodeSnippet code={code} size={size} />,
});

import figma from '@figma/code-connect';
import { Tooltip } from './Tooltip';
import { TooltipContent } from './TooltipContent';
import { TooltipTrigger } from './TooltipTrigger';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=269-10037';

figma.connect(Tooltip, figmaNodeUrl, {
  props: {
    content: figma.string('Name'),
  },
  example: ({ content }) => (
    <Tooltip>
      <TooltipTrigger />
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  ),
});

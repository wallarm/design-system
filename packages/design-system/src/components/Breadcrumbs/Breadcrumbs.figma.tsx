import figma from '@figma/code-connect';
import { CircleDashed } from '../../icons';
import { Breadcrumbs } from './Breadcrumbs';
import { BreadcrumbsItem } from './BreadcrumbsItem';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/wip-components?node-id=821-16083&t=NsOLklpMC14E4hYl-4';

figma.connect(Breadcrumbs, figmaNodeUrl, {
  example: () => (
    <Breadcrumbs>
      <BreadcrumbsItem href='#'>
        <CircleDashed size='md' />
        Breadcrumb
      </BreadcrumbsItem>
      <BreadcrumbsItem href='#'>
        Breadcrumb
        <CircleDashed size='md' />
      </BreadcrumbsItem>
      <BreadcrumbsItem>
        <CircleDashed size='md' />
        Current
      </BreadcrumbsItem>
    </Breadcrumbs>
  ),
});

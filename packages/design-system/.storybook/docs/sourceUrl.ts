const REPO_URL = 'https://github.com/wallarm/design-system';
const PACKAGE_PATH = 'packages/design-system';

export const ISSUE_URL = `${REPO_URL}/issues/new`;

/**
 * Storybook populates `parameters.fileName` internally from the story's import path, so both links
 * below stay correct without anything to maintain per component.
 */
const pathFromSrc = (fileName: string | undefined): string | undefined => {
  if (!fileName) {
    return undefined;
  }

  const srcIndex = fileName.indexOf('src/');

  return srcIndex === -1 ? undefined : fileName.slice(srcIndex);
};

/** The component's folder on GitHub. */
export const resolveSourceUrl = (fileName: string | undefined): string | undefined => {
  const fromSrc = pathFromSrc(fileName);
  if (!fromSrc) {
    return undefined;
  }

  const directory = fromSrc.split('/').slice(0, -1).join('/');
  // A few components keep their stories in a `stories/` subfolder — link to the component instead.
  const componentDirectory = directory.replace(/\/stories$/, '');

  return `${REPO_URL}/tree/main/${PACKAGE_PATH}/${componentDirectory}`;
};

/** The story file itself on GitHub, so a reader can edit the page they are looking at. */
export const resolveStoryFileUrl = (fileName: string | undefined): string | undefined => {
  const fromSrc = pathFromSrc(fileName);

  return fromSrc ? `${REPO_URL}/blob/main/${PACKAGE_PATH}/${fromSrc}` : undefined;
};

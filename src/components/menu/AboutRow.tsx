import { REPO_URL } from '../../constants';
import { versionLabel } from '../../utils/versionLabel';
import { UiIcon } from '../icons/UiIcon';

/** Link to the project page, with the running version. */
export function AboutRow() {
  return (
    <a className="row" href={REPO_URL} target="_blank" rel="noreferrer">
      <UiIcon name="github" size={20} />
      <span>EDH Hub on GitHub</span>
      <span className="row-meta">{versionLabel(__APP_VERSION__)}</span>
    </a>
  );
}

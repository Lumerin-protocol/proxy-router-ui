import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

export const Spinner: React.FC = (props) => <FontAwesomeIcon icon={faCircleNotch} size='10x' color='#11B4BF' spin />;

Spinner.displayName = 'Spinner';
Spinner.whyDidYouRender = false;

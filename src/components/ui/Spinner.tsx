import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
const { colors } = require('styles/styles.config.js');

export const Spinner: React.FC = () => <FontAwesomeIcon icon={faCircleNotch} size='10x' color={colors['lumerin-aqua']} spin />;

Spinner.displayName = 'Spinner';
Spinner.whyDidYouRender = false;

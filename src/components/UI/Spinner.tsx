import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export const Spinner: React.FC = () => <FontAwesomeIcon icon={faSpinner} />;

Spinner.displayName = 'Spinner';
(Spinner as any).whyDidYouRender = false;

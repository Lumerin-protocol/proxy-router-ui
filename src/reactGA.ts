import ReactGA from 'react-ga';
// TODO: add once there is a site url, use env variables to set correct url (ie dev/prod)
const TRACKING_ID = '';
ReactGA.initialize(TRACKING_ID);

export default ReactGA;

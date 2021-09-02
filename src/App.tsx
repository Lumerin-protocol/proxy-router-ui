import React from 'react';
import { Main } from './components/Main';

export const App: React.FC = () => <Main />;
App.displayName = 'App';
(App as any).whyDidYouRender = false;

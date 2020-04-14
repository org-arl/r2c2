import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';

import { createStore } from "redux";
import { Provider } from "react-redux";

// var store = createStore();

// ReactDOM.render(
// 	<Provider store={store}>
// 	<App />
// 	</Provider>,
// 	document.getElementById('root')
// );

ReactDOM.render(
	<App />,
	document.getElementById('root')
);

serviceWorker.unregister();

/**
 * AI Simple应用入口文件
 */

import {AppRegistry} from 'react-native';
import App from './App.tsx';
import {name as appName} from './app.json';

// 注册应用
AppRegistry.registerComponent(appName, () => App); 
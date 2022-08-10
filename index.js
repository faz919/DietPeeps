/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';
import { Text, TextInput } from 'react-native'

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.maxFontSizeMultiplier = 1; 
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps = Text.defaultProps || {};
TextInput.defaultProps.maxFontSizeMultiplier = 1; 
TextInput.defaultProps.allowFontScaling = false;

messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);

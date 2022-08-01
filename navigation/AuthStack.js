import React, {useState, useEffect} from 'react'
import {Platform, View} from 'react-native'
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack'
import SignupScreen from '../screens/SignupScreen'
import LoginScreen from '../screens/LoginScreen'
import OnboardingWizard from '../screens/OnboardingWizard'
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen'
import IntroVideo from '../screens/IntroVideo'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { GOOGLE_SIGNIN_CONFIG_ANDROID, GOOGLE_SIGNIN_CONFIG_IOS } from '../constants/constants'
import IntroExplainerScreen from '../screens/IntroExplainerScreen'

const Stack = createStackNavigator()

const AuthStack = () => {
  const [firstLogon, setFirstLogon] = useState(null)
  let routeName

  useEffect(() => {
    // check if user has opened app before
    AsyncStorage.getItem('alreadyLaunched').then((value) => {
      if (value == null) {
        AsyncStorage.setItem('alreadyLaunched', 'true') 
        setFirstLogon(true)
      } else {
        setFirstLogon(false)
      }
    }) 
  
    // config google signin
    GoogleSignin.configure({
      webClientId: Platform.OS === 'ios' ? GOOGLE_SIGNIN_CONFIG_IOS : GOOGLE_SIGNIN_CONFIG_ANDROID,
      profileImageSize: 300
    })
  
  }, [])

  // change initial route name depending on first login
  if (firstLogon === null) {
    return null 
  } else if (firstLogon == true) {
    routeName = 'Intro'
  } else {
    routeName = 'Login'
  }

  // routeName = 'Intro'

  return (
    <Stack.Navigator initialRouteName={routeName}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{header: () => null}}
      />
      {/* <Stack.Screen
        name="Intro Video"
        component={IntroVideo}
        options={{header: () => null}}
      /> */}
      <Stack.Screen
        name="Onboarding"
        component={OnboardingWizard}
        options={{header: () => null}}
      />
      <Stack.Screen 
        name="Intro" component={IntroExplainerScreen} 
        options={{header: () => null}}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS,
          gestureEnabled: true,
          gestureDirection: "horizontal"
        }} 
      />
      <Stack.Screen
        name="Forgot Password"
        component={ForgotPasswordScreen}
        options={{
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS,
          gestureEnabled: true,
          gestureDirection: "horizontal"
        }} 
      />
    </Stack.Navigator>
  )
}

export default AuthStack
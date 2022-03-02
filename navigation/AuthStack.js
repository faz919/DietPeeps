import React, {useState, useEffect} from 'react'
import {Platform, View} from 'react-native'
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack'
import SignupScreen from '../screens/SignupScreen'
import LoginScreen from '../screens/LoginScreen'
import OnboardingScreen from '../screens/OnboardingScreen'
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen'
import IntroVideo from '../screens/IntroVideo'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

const Stack = createStackNavigator()

const AuthStack = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null)
  let routeName

  useEffect(() => {
    AsyncStorage.getItem('alreadyLaunched').then((value) => {
      if (value == null) {
        AsyncStorage.setItem('alreadyLaunched', 'true') 
        setIsFirstLaunch(true)
      } else {
        setIsFirstLaunch(false)
      }
    }) 
  
    GoogleSignin.configure({
      webClientId: Platform.OS === 'ios' ? '202312705150-0as7142qafv5phn9a277jq7c90vtjq9k.apps.googleusercontent.com' : '202312705150-63k1sau74drj13t0u8ptn01ubgh03534.apps.googleusercontent.com',
      profileImageSize: 300
    })
  
  }, [])

  if (isFirstLaunch === null) {
    return null 
  } else if (isFirstLaunch == true) {
    routeName = 'Intro Video'
  } else {
    routeName = 'Login'
  }

  return (
    <Stack.Navigator initialRouteName={routeName}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{header: () => null}}
      />
      <Stack.Screen
        name="Intro Video"
        component={IntroVideo}
        options={{header: () => null}}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
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
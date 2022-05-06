import "react-native-reanimated"
import React, { useEffect } from 'react'
import Providers from './navigation'
import SplashScreen from  "react-native-splash-screen"
import Purchases from "react-native-purchases"
import { IOS_API_KEY, ANDROID_API_KEY } from "./constants/constants"
import { Platform } from "react-native"

const App = () => {

  useEffect(() => {
    SplashScreen.hide()
    Purchases.setDebugLogsEnabled(true)
    if (Platform.OS === 'ios') {
      Purchases.setup(IOS_API_KEY)
    } else if (Platform.OS === 'android') {
      Purchases.setup(ANDROID_API_KEY)
    }
  }, [])

  return <Providers />
}

export default App;
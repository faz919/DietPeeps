import React, {useContext, useState, useEffect, useRef} from 'react'
import {NavigationContainer, useNavigationContainerRef, validatePathConfig} from '@react-navigation/native'
import auth from '@react-native-firebase/auth'
import {AuthContext} from './AuthProvider'
import analytics from '@react-native-firebase/analytics'

import AuthStack from './AuthStack'
import AppStack from './AppStack'

const Routes = () => {
  const {user, setUser, setGlobalVars} = useContext(AuthContext)
  const [initializing, setInitializing] = useState(true)

  const navigationRef = useNavigationContainerRef()
  const routeNameRef = useRef()

  const onAuthStateChanged = (user) => {
    setUser(user)
    // why???
    // setGlobalVars(val => ({...val, chatID: null}))
    if (initializing) setInitializing(false)
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        navigationRef.getCurrentRoute() ? routeNameRef.current = navigationRef.getCurrentRoute().name : null
      }}
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current
        const currentRouteName = navigationRef.getCurrentRoute().name

        if (previousRouteName !== currentRouteName) {
          console.log('user navigated to', currentRouteName)
          try {
            await analytics().logScreenView({
              screen_name: currentRouteName,
              screen_class: currentRouteName
            })
          } catch (e) {
            console.error('error while screen tracking: ', e)
          }
        }
        routeNameRef.current = currentRouteName
      }}
    >
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Routes
import React, {useContext, useState, useEffect} from 'react'
import {NavigationContainer, validatePathConfig} from '@react-navigation/native'
import auth from '@react-native-firebase/auth'
import {AuthContext} from './AuthProvider'

import AuthStack from './AuthStack'
import AppStack from './AppStack'

const Routes = () => {
  const {user, setUser, setGlobalVars} = useContext(AuthContext)
  const [initializing, setInitializing] = useState(true)

  const onAuthStateChanged = (user) => {
    setUser(user)
    setGlobalVars(val => ({...val, chatID: null}))
    if (initializing) setInitializing(false)
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Routes
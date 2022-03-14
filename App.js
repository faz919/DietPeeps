import React from 'react'
import Providers from './navigation'
import SplashScreen from  "react-native-splash-screen"

const App = () => {

  React.useEffect(() => {
    SplashScreen.hide()
  }, [])

  return <Providers />
}

export default App;
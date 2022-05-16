import messaging from '@react-native-firebase/messaging'

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission()
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL

  if (enabled) {
    return true
  } else {
    return false
  }
}

async function checkUserPermission() {
  const authStatus = await messaging().hasPermission()
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL

  if (enabled) {
    return true
  } else {
    return false
  }
}

export { requestUserPermission, checkUserPermission }
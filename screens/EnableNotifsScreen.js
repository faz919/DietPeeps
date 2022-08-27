import React, { useEffect, useState, useContext } from 'react'
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity, Linking, ImageBackground } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { windowWidth } from '../utils/Dimensions.js'
import { requestUserPermission } from '../utils/notificationServices.js'
import { AuthContext } from '../navigation/AuthProvider.js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import messaging from '@react-native-firebase/messaging'
import AppIcon from '../assets/app-icon.png'

const EnableNotifsScreen = ({ navigation }) => {

  const { setGlobalVars, updateInfo } = useContext(AuthContext)

  const [alreadyRequested, setAlreadyRequested] = useState(null)

  // check if the user has already been prompted to enable notifications
  useEffect(() => {
    const checkAlrEnabled = async () => {
      const alreadyEnabled = await AsyncStorage.getItem('@notifs_enabled')
      if (alreadyEnabled != null) {
        setAlreadyRequested(true)
      } else {
        setAlreadyRequested(false)
      }
    }
    checkAlrEnabled()
  }, [])

  const requestPermission = async () => {
    // otherwise go through the motions
    // if(alreadyEnabled == null) {
      const result = await requestUserPermission()
      // if they've been prompted already, take them to settings for them to finish notification enabling process
      // this is necessary as the prompt will not pop up again
      if (!result) {
        Linking.openSettings('app-settings://notifications')
        navigation.replace('Main Menu')
        return
      }
      updateInfo({ notificationsEnabled: result })
      AsyncStorage.setItem('@notifs_enabled', JSON.stringify(result))
      setGlobalVars(val => ({...val, notificationsEnabled: result}))
      navigation.navigate('Main Menu')
      if(result){
        getToken()
      }
    // } else {
    //   navigation.navigate('Main Menu')
    // }
  }

  function updateUserToken(token) {
    updateInfo({ fcmToken: token })
  }

  async function getToken() {
      await messaging()
          .getToken()
          .then(token => {
              updateUserToken(token)
          })
  }

  const handleNotNowPress = () => {
    updateInfo({ notificationsEnabled: false })
    AsyncStorage.setItem('@notifs_enabled', 'false')
    setGlobalVars(val => ({ ...val, notificationsEnabled: false }))
    navigation.replace('Main Menu')
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e6e7fa' }}>
      <ScrollView contentContainerStyle={styles.ScrollViewUJContent} overScrollMode={'never'} bounces={false}>
        <View style={styles.ViewT7}>
          <ImageBackground
            source={AppIcon}
            imageStyle={styles.logo}
            style={styles.logoView}
          />
          <View style={styles.ViewD2}>
            <Text
              style={[
                styles.headline2,
                { color: '#202060' },
              ]}
            >
              {alreadyRequested ? 'Enable Notifications' : 'Welcome to Personal Diet Coach'}
            </Text>
          </View>

          <View style={styles.ViewsW}>
            <View style={styles.Viewvs}>
              <MaterialCommunityIcons
                style={styles.Icona8}
                color={'#202060'}
                size={24}
                name={'check-circle'}
              />
              <View style={styles.ViewZZ}>
                <Text
                  style={[
                    styles.subtitle1,
                    { color: '#202060' },
                  ]}
                  allowFontScaling={false}
                >
                  {'Enable notifications to receive live updates when your meals are graded.'}
                </Text>
              </View>
            </View>

            {/* <View style={styles.Viewwb}>
              <MaterialCommunityIcons
                style={styles.IcongB}
                name={'check-circle'}
                size={24}
                color={'#202060'}
              />
              <View style={styles.Viewk7}>
                <Text
                  style={[
                    styles.subtitle1,
                    { color: '#202060' },
                  ]}
                  allowFontScaling={false}
                >
                  {'Get regular reminders to submit your meal photos.'}
                </Text>
              </View>
            </View> */}

            <View style={styles.Viewre}>
              <MaterialCommunityIcons
                style={styles.IconCl}
                name={'check-circle'}
                color={'#202060'}
                size={24}
              />
              <View style={styles.View_9d}>
                <Text
                  style={[
                    styles.subtitle1,
                    { color: '#202060' },
                  ]}
                  allowFontScaling={false}
                >
                  {'Users who have notifications enabled are 200% more likely to succeed.'}
                </Text>
              </View>
            </View>
            <View style={styles.Viewre}>
              <MaterialCommunityIcons
                style={styles.IconCl}
                name={'check-circle'}
                color={'#202060'}
                size={24}
              />
              <View style={styles.View_9d}>
                <Text
                  style={[
                    styles.subtitle1,
                    { color: '#202060' },
                  ]}
                  allowFontScaling={false}
                >
                  {'Let us do our job by helping you do yours.'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.View_4v}>
            <TouchableOpacity 
              onPress={requestPermission}
              style={[
                styles.ButtonSolidQB,
                { backgroundColor: '#4C44D4' },
              ]}
            >
              <Text style={styles.panelButtonText}>{'Enable Notifications'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNotNowPress}
              style={styles.Buttonu5}
            >
              <Text style={[styles.panelButtonText, { marginTop: 13, color: '#4D43BD' }]}>{'Not Now'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  logo: {
    width: windowWidth * 0.24,
    height: windowWidth * 0.24,
    borderRadius: windowWidth * 0.06,
  },
  logoView: {
    width: windowWidth * 0.24,
    height: windowWidth * 0.24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 5,
    shadowOpacity: 0.4,
    elevation: 10
  },
  ViewD2: {
    alignItems: 'flex-start',
  },
  Icona8: {
    height: 34,
    width: 34,
    marginRight: 14,
  },
  ViewZZ: {
    flex: 1,
  },
  Viewvs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginTop: 12,
  },
  IcongB: {
    marginRight: 14,
    width: 34,
    height: 34,
  },
  Viewk7: {
    flex: 1,
  },
  Viewwb: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginTop: 12,
  },
  IconCl: {
    height: 34,
    width: 34,
    marginRight: 14,
  },
  View_9d: {
    flex: 1,
  },
  Viewre: {
    flexDirection: 'row',
    marginBottom: 12,
    marginTop: 12,
    alignItems: 'flex-start',
  },
  ViewsW: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  ButtonSolidQB: {
    width: '100%',
    height: 50,
    marginBottom: 12,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#4C44D4',
    alignItems: 'center',
    marginVertical: 7,
  },
  Buttonu5: {
    alignSelf: 'center',
    alignContent: 'center',
    paddingLeft: 12,
    paddingRight: 12,
  },
  View_4v: {
    alignItems: 'center',
  },
  ViewT7: {
    justifyContent: 'space-evenly',
    flex: 1,
    margin: 32,
    marginTop: 0
  },
  ScrollViewUJContent: {
    justifyContent: 'space-evenly',
    flex: 1,
  },
  headline2: {
    fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
    fontSize: 40,
    letterSpacing: 0,
  },
  subtitle1: {
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 26,
    top: -5,
  },
  panelButtonText: {
    fontSize: 17,
    fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
    color: 'white',
  },
})

export default EnableNotifsScreen

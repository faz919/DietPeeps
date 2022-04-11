import React, { useEffect, useState, useContext } from 'react'
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { windowWidth } from '../utils/Dimensions.js'
import requestUserPermission from '../utils/notificationServices.js'
import { AuthContext } from '../navigation/AuthProvider.js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import messaging from '@react-native-firebase/messaging'

const EnableNotifsScreen = ({ navigation }) => {

  const { setGlobalVars, updateInfo } = useContext(AuthContext)

  const requestPermission = async () => {
    const alreadyEnabled = await AsyncStorage.getItem('@notifs_enabled')
    if(alreadyEnabled == null) {
      const result = await requestUserPermission()
      if(result){
        updateInfo({ notificationsEnabled: true })
        AsyncStorage.setItem('@notifs_enabled', 'true')
        setGlobalVars(val => ({...val, notificationsEnabled: true}))
        getToken()
        navigation.navigate('Main Menu')
      } else if(!result) {
        updateInfo({ notificationsEnabled: false })
        AsyncStorage.setItem('@notifs_enabled', 'false')
        setGlobalVars(val => ({...val, notificationsEnabled: false}))
        navigation.navigate('Main Menu')
      }
    } else {
      navigation.navigate('Main Menu')
    }
  }

  function updateUserToken(token) {
    updateInfo({fcmToken: token, notificationsEnabled: true})
  }

  async function getToken() {
      await messaging()
          .getToken()
          .then(token => {
              updateUserToken(token)
          })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e6e7fa' }}>
      <ScrollView contentContainerStyle={styles.ScrollViewUJContent}>
        <View style={styles.ViewT7}>
          <Image
            style={styles.Imaget6}
            resizeMode={'contain'}
            source={require('../assets/app-icon.png')}
          />
          <View style={styles.ViewD2}>
            <Text
              style={[
                styles.headline2,
                { color: '#202060' },
              ]}
            >
              {'Welcome to DietPeeps'}
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
                  allowFontScaling={true}
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
                  allowFontScaling={true}
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
                  allowFontScaling={true}
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
                  allowFontScaling={true}
                >
                  {'Let us do our job by helping you do yours.'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.View_4v}>
            <TouchableOpacity 
              onPress={() => requestPermission()}
              style={[
                styles.ButtonSolidQB,
                { backgroundColor: '#4C44D4' },
              ]}
            >
              <Text style={styles.panelButtonText}>{'Enable Notifications'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { updateInfo({ notificationsEnabled: false }); AsyncStorage.setItem('@notifs_enabled', 'false'); setGlobalVars(val => ({...val, notificationsEnabled: false})); navigation.replace('Main Menu') }}
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
  Imaget6: {
    width: windowWidth * 0.24,
    height: windowWidth * 0.24,
    marginLeft: -(windowWidth * 0.04)
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: 'white',
  },
})

export default EnableNotifsScreen

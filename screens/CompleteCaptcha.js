import React, { useEffect, useState, useContext } from 'react'
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { windowWidth } from '../utils/Dimensions.js'
import requestUserPermission from '../utils/notificationServices.js'
import { AuthContext } from '../navigation/AuthProvider.js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import messaging from '@react-native-firebase/messaging'

// currently not being used. Development started on it at some point to ward off bots, but now our onboarding wizard does enough of that
const CaptchaScreen = ({ navigation }) => {

  const { setGlobalVars, updateInfo } = useContext(AuthContext)

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
              {'Complete your Captcha'}
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
                  {'Send pictures of your meals to your coach.'}
                </Text>
              </View>
            </View>

            <View style={styles.Viewwb}>
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
                  {'Get live feedback on the food you eat.'}
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
                  {'Keep track of your daily eating habits.'}
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
                  {'Take advantage of our extensive weight loss course curriculum.'}
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
              <Text style={styles.panelButtonText}>{'Continue'}</Text>
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

export default CaptchaScreen

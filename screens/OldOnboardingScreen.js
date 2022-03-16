import React, { useContext } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import { AuthContext } from '../navigation/AuthProvider'

import Onboarding from 'react-native-onboarding-swiper'

const Dots = ({ selected }) => {
  let backgroundColor

  backgroundColor = selected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.3)'

  return (
    <View
      style={{
        width: 6,
        height: 6,
        marginHorizontal: 3,
        backgroundColor,
        borderRadius: 3
      }}
    />
  )
}

const Skip = ({ ...props }) => (
  <TouchableOpacity
    style={{ marginHorizontal: 15 }}
    {...props}
  >
    <Text style={{ fontSize: 16 }}>Skip</Text>
  </TouchableOpacity>
)

const Next = ({ ...props }) => (
  <TouchableOpacity
    style={{ marginHorizontal: 15 }}
    {...props}
  >
    <Text style={{ fontSize: 16 }}>Next</Text>
  </TouchableOpacity>
)

const Done = ({ ...props }) => (
  <TouchableOpacity
    style={{ marginHorizontal: 15 }}
    {...props}
  >
    <Text style={{ fontSize: 16 }}>Done</Text>
  </TouchableOpacity>
)

const OnboardingScreen = ({ navigation }) => {

  const { user } = useContext(AuthContext)

  return (
    <Onboarding
      SkipButtonComponent={Skip}
      NextButtonComponent={Next}
      DoneButtonComponent={Done}
      DotComponent={Dots}
      onSkip={() => user ? navigation.goBack() : navigation.replace('Signup')}
      onDone={() => user ? navigation.goBack() : navigation.replace('Signup')}
      pages={[
        {
          backgroundColor: '#a6e4d0',
          image: <Image style={{ width: windowWidth * 0.8, height: windowHeight * 0.3, resizeMode: 'contain' }} source={require('../assets/onboarding-img1.png')} />,
          title: 'Accountability',
          subtitle: 'Send pictures of your meals to your coach.',
        },
        {
          backgroundColor: '#fdeb93',
          image: <Image style={{ width: windowWidth * 0.8, height: windowHeight * 0.3, resizeMode: 'contain' }} source={require('../assets/onboarding-img2.png')} />,
          title: 'Feedback',
          subtitle: 'Get live feedback on the food you eat.',
        },
        {
          backgroundColor: '#e9bcbe',
          image: <Image style={{ width: windowWidth * 0.8, height: windowHeight * 0.3, resizeMode: 'contain' }} source={require('../assets/onboarding-img3.png')} />,
          title: 'Statistics',
          subtitle: 'Keep track of your daily eating habits.',
        },
        {
          backgroundColor: '#c5b3e3',
          image: <Image style={{ width: windowWidth * 0.8, height: windowHeight * 0.3, resizeMode: 'contain' }} source={require('../assets/onboarding-img4.png')} />,
          title: 'Knowledge',
          subtitle: 'Take advantage of our extensive weight loss course curriculum.',
        },
      ]}
    />
  )
}

export default OnboardingScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
})
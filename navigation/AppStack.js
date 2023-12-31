import React, { useContext, useEffect, useState } from "react"
import { Platform, View } from "react-native"
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from 'react-native-vector-icons/Ionicons'
import PhotoGallery from '../screens/PhotoGallery.js'
import Chat from '../screens/Chat.js'
import CourseSelection from '../screens/CourseSelection.js'
import Course from "../screens/Course.js"
import CameraModal from '../screens/CameraModal.js'
import UserProfile from '../screens/UserProfile.js'
import Stats from "../screens/Stats.js"
import Settings from '../screens/Settings.js'
import OnboardingScreen from '../screens/OldOnboardingScreen.js'
import CoachProfile from "../screens/CoachProfile.js"
import { windowHeight, windowWidth } from "../utils/Dimensions.js"
import EnableNotifsScreen from "../screens/EnableNotifsScreen.js"
import WelcomeScreen from "../screens/WelcomeScreenAndroid.js"
import CaptchaScreen from "../screens/CompleteCaptcha.js"
import OnboardingWizard from "../screens/OnboardingWizard.js"
import CongratsPopup from "../screens/CongratsPopup.js"
import SubscriptionScreen from "../screens/SubscriptionScreen.js"
import WeighInModal from "../screens/WeighInModal.js"
import NotificationSettings from "../screens/NotificationSettings.js"
import EditUserDataScreen from "../screens/EditUserDataScreen.js"
import AsyncStorage from "@react-native-async-storage/async-storage"
import TrialPayPopup from "../screens/TrialPayPopup.js"
import IntroExplainerScreen from "../screens/IntroExplainerScreen.js"

// screen navigator
const AppStack = createStackNavigator()
// tab navigator (bottom of screen)
const Tab = createBottomTabNavigator()

const MainMenu = () => {
  return (
    <Tab.Navigator initialRouteName={"Coach"} screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        // icon picker based on route name
        switch (route.name) {
          case "Coach":
            iconName = focused ? 'ios-chatbox-ellipses' : 'ios-chatbox-ellipses-outline'
            break
          case "Gallery":
            iconName = focused ? 'ios-images' : 'ios-images-outline'
            break
          case "Camera":
            iconName = focused ? 'ios-camera' : 'ios-camera-outline'
            break
          case "Your Stats":
            iconName = focused ? 'ios-trending-up' : 'ios-trending-up-outline'
            break
          case "Courses":
            iconName = focused ? 'book' : 'book-outline'
            break
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      headerShown: false,
      tabBarHideOnKeyboard: Platform.OS === 'ios' ? false : true,
      tabBarBackground: () => (
        // can be customized, this is default
        <View style={{ width: windowWidth, height: windowHeight * 0.2, backgroundColor: '#fff' }}></View>
      ),
      tabBarInactiveTintColor: "#BDB9DB",
      tabBarActiveTintColor: "#4D43BD",
      tabBarShowLabel: true
    })}>
      {/* define each screen and their initial params */}
      <Tab.Screen name="Coach" component={Chat} initialParams={{ imageInfo: null, hasPaidForTrial: null, hasSubscribed: null, hasWeighedIn: null }} />
      <Tab.Screen name="Gallery" component={PhotoGallery} initialParams={{ imageInfo: null }} />
      <Tab.Screen name="Camera" component={CameraModal}
        listeners={(params) => ({
          tabPress: (e) => {
            e.preventDefault()
            params.navigation.navigate('CameraModal')
          }
        })}
      />
      <Tab.Screen name="Your Stats" component={Stats} />
      <Tab.Screen name="Courses" component={CourseSelection} initialParams={{ courseInfo: null }} />
    </Tab.Navigator>
  )
}

const App = () => {

  const [completedWizard, setCompletedWizard] = useState(null)
  let initialRoute
  
  useEffect(() => {
    AsyncStorage.getItem('hasCompletedWizard').then((value) => {
      // console.log(value, typeof value)
      if (value == null || value === 'false') {
        setCompletedWizard(false)
        return
      }
      if (value === 'true') {
        setCompletedWizard(true)
        return
      }
    })
  }, [])

  if (completedWizard == null) {
    return null
  } else if (completedWizard == true) {
    initialRoute = 'Main Menu'
  } else {
    initialRoute = 'Onboarding Wizard'
  }

  // initialRoute = 'Intro Screen'

  return (
    <AppStack.Navigator initialRouteName={initialRoute}>
      <AppStack.Screen name="Main Menu" component={MainMenu} options={{ headerShown: false }} />
      {/* <AppStack.Screen name="Photo Gallery" component={PhotoGallery} options={{ headerShown: false }} /> */}
      <AppStack.Screen name="Enable Notifs" component={EnableNotifsScreen} options={{ 
        headerShown: false,
        ...TransitionPresets.ModalPresentationIOS,
      }} />
      <AppStack.Screen name="Intro Screen" component={IntroExplainerScreen} options={{
        headerShown: false,
      }} />
      <AppStack.Screen name="Onboarding Wizard" component={OnboardingWizard} options={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS 
      }} />
      {/* <AppStack.Screen name="Courses" component={CourseSelection} options={{ headerShown: false }} /> */}
      <AppStack.Screen name="CameraModal" component={CameraModal} options={{ presentation: 'transparentModal', headerShown: false }} />
      <AppStack.Screen name="Congrats" component={CongratsPopup} options={{ presentation: 'transparentModal', headerShown: false }} initialParams={{ congratsType: null }} />
      <AppStack.Screen name="WeighInModal" component={WeighInModal} options={{ presentation: 'transparentModal', headerShown: false }} />
      <AppStack.Screen name="Welcome" component={WelcomeScreen} options={{ 
        headerShown: false,
        ...TransitionPresets.ModalPresentationIOS,
      }} />
      <AppStack.Screen name="Captcha" component={CaptchaScreen} options={{ 
        headerShown: false,
        ...TransitionPresets.ModalPresentationIOS,
      }} />
      {/* <AppStack.Screen name="Coach" component={Chat} options={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        gestureDirection: "horizontal"
      }} /> */}
      <AppStack.Screen name="Course" component={Course} options={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        gestureDirection: "horizontal"
      }} />
      <AppStack.Screen name="User Profile" component={UserProfile} options={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        gestureDirection: "horizontal"
      }} />
      <AppStack.Screen name="Settings" component={Settings} options={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        gestureDirection: "horizontal"
      }} />
      <AppStack.Screen name="Notification Settings" component={NotificationSettings} options={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        gestureDirection: "horizontal"
      }} />
      {/* <AppStack.Screen name="Onboarding" component={OnboardingScreen} options={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        gestureDirection: "horizontal"
      }} /> */}
      <AppStack.Screen name="Coach Profile" component={CoachProfile} options={{
        headerShown: false,
        ...TransitionPresets.ModalPresentationIOS,
        gestureEnabled: true,
        gestureDirection: "vertical"
      }} />
      <AppStack.Screen name="EditUserData" component={EditUserDataScreen} options={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        gestureDirection: "horizontal"
      }} />
      <AppStack.Screen name="Subscription" component={SubscriptionScreen} initialParams={{ trialReminder: null }} options={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        gestureDirection: "horizontal"
      }} />
      <AppStack.Screen name="Trial Pay Popup" component={TrialPayPopup} options={{
        headerShown: false,
        ...TransitionPresets.ModalPresentationIOS,
        gestureEnabled: true,
        gestureDirection: "vertical"
      }} />
    </AppStack.Navigator>
  );
}

export default App
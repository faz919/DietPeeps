import React, { useContext } from "react"
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
import { AuthContext } from "./AuthProvider.js"

const AppStack = createStackNavigator()
const Tab = createBottomTabNavigator()

const MainMenu = () => {
  return (
    <Tab.Navigator initialRouteName={"Coach"} screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
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
        <View style={{ width: windowWidth, height: windowHeight * 0.2, backgroundColor: '#fff' }}></View>
      ),
      tabBarInactiveTintColor: "#BDB9DB",
      tabBarActiveTintColor: "#4D43BD",
    })}>
      <Tab.Screen name="Coach" component={Chat} initialParams={{imageInfo: null}} />
      <Tab.Screen name="Gallery" component={PhotoGallery} initialParams={{imageInfo: null}} />
      <Tab.Screen name="Camera" component={CameraModal}
        listeners={(params) => ({
          tabPress:(e)=>{
            e.preventDefault()
            params.navigation.navigate('CameraModal')
          }
        })}
      />
      <Tab.Screen name="Your Stats" component={Stats} />
      <Tab.Screen name="Courses" component={CourseSelection} />
    </Tab.Navigator>
  )
}

const App = () => {
  const { globalVars, setGlobalVars } = useContext(AuthContext)
  return (
    <AppStack.Navigator initialRouteName={'Main Menu'} >
      <AppStack.Screen name="Main Menu" component={MainMenu} options={{ headerShown: false }} />
      <AppStack.Screen name="Photo Gallery" component={PhotoGallery} options={{ headerShown: false }} />
      <AppStack.Screen name="Onboarding Wizard" component={OnboardingWizard} options={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
      }} />
      <AppStack.Screen name="Courses" component={CourseSelection} options={{ headerShown: false }} />
      <AppStack.Screen name="CameraModal" component={CameraModal} options={{ presentation: 'transparentModal', headerShown: false }} />
      <AppStack.Screen name="Enable Notifs" component={EnableNotifsScreen} options={{ 
        headerShown: false,
        ...TransitionPresets.ModalPresentationIOS,
      }} />
      <AppStack.Screen name="Welcome" component={WelcomeScreen} options={{ 
        headerShown: false,
        ...TransitionPresets.ModalPresentationIOS,
      }} />
      <AppStack.Screen name="Captcha" component={CaptchaScreen} options={{ 
        headerShown: false,
        ...TransitionPresets.ModalPresentationIOS,
      }} />
      <AppStack.Screen name="Coach" component={Chat} options={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        gestureDirection: "horizontal"
      }} />
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
      <AppStack.Screen name="Onboarding" component={OnboardingScreen} options={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        gestureDirection: "horizontal"
      }} />
      <AppStack.Screen name="Coach Profile" component={CoachProfile} options={{
        headerShown: false,
        ...TransitionPresets.ModalPresentationIOS,
        gestureEnabled: true,
        gestureDirection: "vertical"
      }} />
    </AppStack.Navigator>
  );
}

export default App
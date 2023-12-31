import React, { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View, ImageBackground, TouchableOpacity, Platform, TextInput, Alert } from 'react-native'
import { AuthContext } from '../navigation/AuthProvider.js'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import BackButton from '../components/BackButton.js'
import FormInput from '../components/FormInput.js'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { windowHeight } from '../utils/Dimensions.js'
import ImagePicker from 'react-native-image-crop-picker'
import Modal from 'react-native-modal'
import storage from '@react-native-firebase/storage'
import firestore from '@react-native-firebase/firestore'
import { windowWidth } from '../utils/Dimensions.js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ProfilePic from '../components/ProfilePic.js'

// this is the code for the 'User Profile' screen which can be found either in the Your Stats page
// or by going to Your Stats > Settings > Account Settings
// this will change, however. the one in Your Stats will become an 'Edit Bio Data' screen
const UserProfile = ({ navigation }) => {
  const { user, updateInfo, emailVerification, changeEmail, forgotPassword, logout, deleteAccount, globalVars, setGlobalVars, authErrorText, mixpanel } = useContext(AuthContext)

  const [newInfo, setNewInfo] = useState({})
  const [attachingImage, setAttachingImage] = useState({})
  const [amntTransferred, setAmntTransferred] = useState(0)
  const [userInfo, setUserInfo] = useState({})

  // what to display in case user doesn't have a pfp
  const tempPfp = () => {
    if (user.providerData[0].providerId === "apple.com") {
      return `https://avatars.dicebear.com/api/bottts/${user.displayName.substring(user.displayName.indexOf(" ") + 1)}.png?dataUri=true`
    } else {
      return `https://avatars.dicebear.com/api/bottts/${user.displayName}.png?dataUri=true`
    }
  }

  useEffect(() => {
    setUserInfo(globalVars.userData)
  }, [])

  // firebase requires a user to have logged in recently to perform sensitive operations, such as this one: deleting your account
  // give them the proper error if they try to delete without recent login
  useEffect(() => {
    if (authErrorText.code === 'auth/requires-recent-login') {
      setGlobalVars(val => ({ ...val, loggingIn: false }))
      Alert.alert(
        'Unable to delete acccount:',
        'This operation is sensitive and requires recent authentication. Log in again before trying this request.'
      )
    }
  }, [authErrorText])

  const thirtyDays = 60 * 60 * 24 * 1000 * 30

  // run checks to ensure that the info being updated is valid, and that the user has permission to update their info
  const runChecks = () => {
    let now = new Date()
    if (newInfo.displayName || newInfo.email) {
      if (newInfo.displayName?.length >= 4) {
        // if client, check if the user has updated their display name in the past 30 days
        if(now - userInfo.displayNameLastUpdated?.toDate() >= thirtyDays || userInfo.type === 'coach' || userInfo.type === 'admin'){
          updateInfo({ displayName: newInfo.displayName, displayNameLastUpdated: firestore.Timestamp.now() })
          setNewInfo(val => ({ ...val, displayName: '' }))
          Alert.alert('Display name updated!',
          'Your display name was successfully updated.')
        } else {
          Alert.alert('Unable to change display name.',
          'You can only change your display name once every 30 days.')
        }
      }
      // check if valid email
      if (newInfo.email?.includes("@") && newInfo.email?.includes(".")) {
        // if client, check if the user has updated their email in the past 30 days
        if(now - userInfo.emailLastUpdated?.toDate() >= thirtyDays || userInfo.type === 'coach' || userInfo.type === 'admin'){
          changeEmail(newInfo.email)
          updateInfo({ emailLastUpdated: firestore.Timestamp.now() })
          setNewInfo(val => ({ ...val, email: '' }))
          Alert.alert('Email updated!',
          'Your email was successfully updated.')
        } else {
          Alert.alert('Unable to change email.',
          'You can only change your email once every 30 days.')
        }
      }
    } else {
      return null
    }
  }

  const takePhotoFromCamera = () => {
    setAttachingImage(val => ({...val, loading: true}))
    ImagePicker.openCamera({
      width: 300,
      height: 300,
      cropping: true,
      cropperCircleOverlay: true,
      forceJpg: true
    }).then((image) => {
      setNewInfo(val => ({ ...val, photoURL: image.path }))
      uploadImage(image.path)
    }).catch(() => {
      setAttachingImage(val => ({...val, loading: false}))
    })
  }

  const choosePhotoFromLibrary = () => {
    setAttachingImage(val => ({...val, loading: true}))
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      cropperCircleOverlay: true,
      forceJpg: true
    }).then((image) => {
      setNewInfo(val => ({ ...val, photoURL: image.path }))
      uploadImage(image.path)
    }).catch(() => {
      setAttachingImage(val => ({...val, loading: false}))
    })
  }

  const uploadImage = async (image) => {
    const imageURL = await imageUploader(image)

    updateInfo({ photoURL: imageURL, photoURLLastUpdated: firestore.Timestamp.now() })

    Alert.alert(
      'Profile photo updated!',
      'Your profile photo has been successfully updated.'
    )

    setAttachingImage(val => ({...val, loading: false, visible: false}))
  }

  const imageUploader = async (image) => {
    await deleteOldPfp()
    const uploadURI = image
    let fileName = uploadURI.substring(uploadURI.lastIndexOf('/') + 1)

    const extension = fileName.split('.').pop()
    const name = fileName.split('.').slice(0, -1).join('.')
    fileName = name + Date.now() + '.' + extension

    setAmntTransferred(0)

    const storageRef = storage().ref(`profile-pics/${fileName}`)
    const task = storageRef.putFile(uploadURI)

    // progress bar for image upload. might consider adding this feature to main chat
    task.on('state_changed', taskSnapshot => {
      setAmntTransferred(
        Math.round((taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100)
      )
    })

    try {
      await task

      const url = await storageRef.getDownloadURL()

      return url
    } catch (e) {
      console.error(e)
      return null
    }
  }

  // delete existing PFP on firebase storage
  const deleteOldPfp = async () => {
    if (user.photoURL != null) {
      let storageRef
      try {
        storageRef = storage()?.refFromURL(user.photoURL)
      } catch (e) {
        console.log('error while retrieving storage ref: ', e)
      }
      if(storageRef){
        const imageRef = storage().ref(storageRef.fullPath)

        imageRef
          .delete()
          .catch((e) => {
            console.error("Error while deleting image from Firebase Storage: ", e)
          })
        return null
      } else {
        console.error("user's profile picture does not exist on cloud storage")
        return null
      }
    } else {
      console.error('no user photo found')
      return null
    }
  }

  // check if the user is allowed to change their pfp (if they haven't in last 30 days or if they aren't a client)
  const checkPfpChange = () => {
    let now = new Date()
    if(now - userInfo.photoURLLastUpdated?.toDate() >= thirtyDays || userInfo.type === 'coach' || userInfo.type === 'admin') {
      setAttachingImage(val => ({...val, visible: true}))
    } else {
      Alert.alert('Unable to change profile photo.',
      'You can only change your profile photo once every 30 days.')
    }
  }

  // check if user's email has been verified. if not, check if the verification email has been sent
  // we only allow one re-send so that users can't just spam this button and throttle our firebase email verification service
  const verifyEmail = () => {
    mixpanel.track('Button Press', { 'Button': 'VerifyEmail' })
    AsyncStorage.getItem('@email_verification_sent').then((value) => {
      if(value == null){
        AsyncStorage.setItem('@email_verification_sent', 'true')
        emailVerification()
      }
      Alert.alert('Email verification sent!',
      'Please check your email for further instructions.')
    })
  }

  // check if the user is allowed to change their pfp (if they haven't in last 30 days or if they aren't a client)
  const checkPasswordReset = () => {
    mixpanel.track('Button Press', { 'Button': 'PasswordReset' })
    let now = new Date()
    if(now - userInfo.passwordLastUpdated?.toDate() >= thirtyDays || userInfo.type === 'coach' || userInfo.type === 'admin'){
      updateInfo({ passwordLastUpdated: firestore.Timestamp.now() })
      forgotPassword(user.email)
      logout()
      Alert.alert('Password reset email sent!',
      'Please reset your password and log back in with your new credentials.')
    } else {
      Alert.alert('Unable to reset password.',
      'You can only reset your password once every 30 days.')
    }
  }

  // extra prompt asking if they want to delete their account. in the future will make this into a whole form they fill out
  // want to make it difficult for user to delete account, without making it unreasonably difficult
  const deleteAccountForm = () => {
    mixpanel.track('Button Press', { 'Button': 'DeleteAccount' })
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account?',
      [
          {
              text: 'Cancel',
              style: 'cancel',
          },
          {
              text: 'Confirm',
              onPress: () => {setGlobalVars(val => ({ ...val, loggingIn: true })); deleteAccount()},
          },
      ],
      { cancelable: false },
  );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6E7FA' }}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.KeyboardAvoidingViewtk}
        keyboardOpeningTime={0}
      >
        <View style={styles.ViewaX}>
          <Text style={[styles.Text_8H, { color: '#202060' }]}>
            {'Update Profile'}
          </Text>

          <Text style={[styles.Textmr, { color: 'gray' }]}>
            {"Changes may take a minute to go into effect."}
          </Text>
          <TouchableOpacity onPress={() => checkPfpChange()}>
            <ProfilePic style={{marginTop: 20}} size={90} source={{ uri: newInfo.photoURL == null ? user.photoURL == null ? tempPfp() : user.photoURL : newInfo.photoURL }} />
              <View style={{ backgroundColor: '#4C44D4', position: 'absolute', bottom: 0, width: 30, height: 30, borderRadius: 15, alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center' }}>
                <Icon
                  name='pencil'
                  size={15}
                  color={'#fff'}
                />
              </View>
          </TouchableOpacity>
          <Text style={[styles.TextJa, { color: '#202060', marginTop: 20 }]}>
            {user.displayName}
          </Text>
          <Text style={[styles.Textmr, { color: 'gray' }]}>
            {user.email}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 5, marginBottom: 15 }}>
            <Ionicons
              name={user.emailVerified ? "checkmark-circle" : "close-circle"}
              size={20}
              color={user.emailVerified ? '#32ad32' : '#DA302C'}
            />
            <Text style={{ marginLeft: 5, alignSelf: 'center', color: '#202060' }}>{user.emailVerified ? 'Email Verified' : 'Email Not Verified'}</Text>
          </View>
          <View style={{ marginTop: 10 }}>
            <FormInput
              labelValue={newInfo.displayName}
              onChangeText={(userName) => setNewInfo(val => ({ ...val, displayName: userName }))}
              placeholderText={user.displayName}
              iconType="user"
              autoCapitalize="none"
              autoCorrect={false}
              passwordInput={false}
              maxLength={25}
            />
            {newInfo.displayName ?
              <View style={{ flexDirection: 'row', marginLeft: 5, marginBottom: 15, alignItems: 'center', marginTop: -10 }}>
                <Ionicons
                  name={newInfo.displayName?.length >= 4 ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={newInfo.displayName?.length >= 4 ? '#32ad32' : '#DA302C'}
                />
                <Text style={{ marginLeft: 5, color: '#202060' }}>Name contains at least 4 characters</Text>
              </View> : null}

            <FormInput
              labelValue={newInfo.email}
              onChangeText={(userEmail) => setNewInfo(val => ({ ...val, email: userEmail }))}
              placeholderText={user.email}
              iconType="mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              passwordInput={false}
            />
            {newInfo.email ?
              <View style={{ flexDirection: 'row', marginLeft: 5, marginBottom: 15, alignItems: 'center', marginTop: -10 }}>
                <Ionicons
                  name={newInfo.email?.includes("@") && newInfo.email?.includes(".") ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={newInfo.email?.includes("@") && newInfo.email?.includes(".") ? '#32ad32' : '#DA302C'}
                />
                <Text style={{ marginLeft: 5, color: '#202060' }}>Email formatting is valid</Text>
              </View> : null}
            <TouchableOpacity disabled={!newInfo.displayName && !newInfo.email} style={[styles.panelButton, { opacity: !newInfo.displayName && !newInfo.email ? 0.5 : 1, width: 'auto' }]} onPress={runChecks}>
              <Text style={styles.panelButtonTitle}>Update</Text>
            </TouchableOpacity>
            {user.emailVerified ? null : 
            <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', marginTop: windowHeight / 80, marginBottom: windowHeight / 360 }} onPress={verifyEmail}>
              <Text style={{fontSize: 18, fontWeight: '500', color: '#4D43BD', lineHeight: 20 }}>{'Verify Email'}</Text>
            </TouchableOpacity>
            }
            <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center', marginTop: windowHeight / 60, marginBottom: windowHeight / 120}} onPress={checkPasswordReset}>
              <Text style={{fontSize: 18, fontWeight: '500', color: '#4D43BD', lineHeight: 20 }}>Reset Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center', marginTop: windowHeight / 90, marginBottom: windowHeight / 120}} onPress={deleteAccountForm}>
              <Text style={{fontSize: 18, fontWeight: '500', color: '#DA302C', lineHeight: 20 }}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
      <BackButton navigation={navigation} />
      <Modal
        isVisible={attachingImage.visible}
        avoidKeyboard={true}
        onBackButtonPress={() => setAttachingImage(val => ({ ...val, visible: false, loading: false }))}
        useNativeDriverForBackdrop
        onBackdropPress={() => setAttachingImage(val => ({ ...val, visible: false, loading: false }))}
        onSwipeComplete={() => setAttachingImage(val => ({ ...val, visible: false, loading: false }))}
        swipeDirection={['down']}
        swipeThreshold={50}
        animationInTiming={400}
        animationOutTiming={400}
      >
        <View style={styles.panel}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.panelTitle}>Choose Profile Photo</Text>
            <Text style={styles.panelSubtitle}></Text>
          </View>
          <TouchableOpacity style={styles.panelButton} onPress={takePhotoFromCamera}>
            <Text style={styles.panelButtonTitle}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.panelButton} onPress={choosePhotoFromLibrary}>
            <Text style={styles.panelButtonTitle}>Choose Photo From Library</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.panelButton}
            onPress={() => setAttachingImage(val => ({ ...val, visible: false, loading: false }))}>
            <Text style={styles.panelButtonTitle}>Cancel</Text>
          </TouchableOpacity>
          {attachingImage.loading ?
            <View style={styles.modalLoading}>
              <ActivityIndicator size={35} color="#BDB9DB" />
              <Text style={{fontSize: 30, color: '#BDB9DB'}}>{amntTransferred}% uploaded</Text>
            </View>
            : null}
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  TextJa: {
    fontSize: 24,
    fontFamily: 'System',
    fontWeight: '700',
    textAlign: 'center',
  },
  Textmr: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  CircleImage_0E: {
    marginTop: 20,
    height: 90,
    width: 90,
  },
  ViewaX: {
    alignItems: 'center',
  },
  ButtonSolid_51: {
    borderRadius: 8,
    fontFamily: 'System',
    fontWeight: '700',
    textAlign: 'center',
  },
  KeyboardAvoidingViewtk: {
    flex: 1,
    justifyContent: 'space-around',
    paddingLeft: 16,
    paddingRight: 16,
    marginTop: 30
  },
  panelButton: {
    height: windowHeight / 17,
    width: '100%',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#4C44D4',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
    color: 'white',
    textAlign: 'center',
    width: '100%'
  },
  Text_8H: {
    marginBottom: 6,
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'System',
    fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
  },
  panel: {
    padding: 20,
    backgroundColor: '#E6E7FA',
    paddingTop: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    shadowOpacity: 0.4,
    width: windowWidth,
    position: 'absolute',
    margin: -20,
    bottom: 0,
    height: windowHeight * (320/844),
    alignItems: 'center'
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
    color: '#202060',
    width: '100%'
  },
  panelSubtitle: {
      fontSize: 14,
      color: 'gray',
      textAlign: 'center',
      marginBottom: 10,
  },
  modalLoading: {
    position: 'absolute',
    width: windowWidth,
    height: 320,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: 'rgba(32,32,96,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default UserProfile

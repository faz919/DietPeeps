import React, { createContext, useState } from 'react'
import { ActivityIndicator, Alert, View } from 'react-native'
import auth from '@react-native-firebase/auth'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { appleAuth } from '@invertase/react-native-apple-authentication'
import firestore from '@react-native-firebase/firestore'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    const [authErrorText, setAuthErrorText] = useState('')
    const [emailSent, setEmailSent] = useState(false)
    const [verificationEmailSent, setVerificationEmailSent] = useState(false)
    const [passwordChanged, setPasswordChanged] = useState(false)
    const [infoUpdated, setInfoUpdated] = useState(false)
    const [emailUpdated, setEmailUpdated] = useState(false)
    const [globalVars, setGlobalVars] = useState({})

    const makeNewUserChat = async () => {
        await AsyncStorage.removeItem('@notifs_enabled')
        await AsyncStorage.removeItem('alreadyLoggedIn')
        let coachList = []
        firestore()
            .collection('user-info')
            .where('type', '==', 'coach')
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    coachList.push(doc.id)
                })
            })
            .then(() => {
                var userCoachGet = coachList[Math.floor(Math.random() * coachList.length)]
                let userCoach = userCoachGet
                const _user = auth().currentUser
                firestore()
                    .collection('chat-rooms')
                    .add({
                        timeCreated: firestore.Timestamp.fromDate(new Date()),
                        latestMessageTime: firestore.Timestamp.fromDate(new Date()),
                        latestMessage: "",
                        userIDs: [_user.uid, userCoach]
                    })
                    .then((doc) => {
                        setGlobalVars(val => ({
                            ...val,
                            chatID: doc.id,
                        }))
                    })
                    .then(() => {
                        const _user = auth().currentUser
                        firestore()
                            .collection('user-info')
                            .doc(_user.uid)
                            .set({
                                displayName: _user.displayName,
                                photoURL: _user.photoURL,
                                type: 'client',
                                lastImageSent: firestore.Timestamp.fromDate(new Date()),
                                streakUpdated: firestore.Timestamp.fromDate(new Date()),
                                streak: 0,
                                dateJoined: _user.metadata.creationTime,
                                courseData: {
                                    courseDay: 1,
                                    courseDayCompleted: false,
                                    latestCourseCompleted: 0
                                },
                                lastLoggedIn: _user.metadata.lastSignInTime
                            }, { merge: true })
                            .then(() => {
                                setGlobalVars(val => ({ ...val, loggingIn: false }))
                                const _user = auth().currentUser
                                _user.reload()
                            })
                            .catch((e) => {
                                console.log("Error while adding user profile on Firestore: ", e)
                            })
                    })
                    .catch((e) => {
                        console.log('Error while making new coach/client chat: ', e)
                    })
            })
            .catch((e) => {
                console.log("Error while fetching coach data: ", e)
            })
    }

    async function setUserToken(token) {
        const _user = auth().currentUser

        await firestore()
            .collection('user-info')
            .doc(_user.uid)
            .set({
                fcmToken: token,
                lastLoggedIn: _user.metadata.lastSignInTime
            }, {merge: true})
            .catch((e) => {
                console.log('yo: ', e)
            })
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                login: async (email, password) => {
                    try {
                        await auth().signInWithEmailAndPassword(email, password).then(() => {
                            setGlobalVars(val => ({ ...val, loggingIn: false }))
                            messaging()
                                .getToken()
                                .then(token => {
                                    return setUserToken(token);
                                })
                                .catch((e) => {
                                    console.log('error while retrieving messaging token: ', e)
                                })
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthErrorText(eMessage.substring(eMessage.lastIndexOf(']') + 2))
                        console.log(e)
                        setGlobalVars(val => ({ ...val, loggingIn: false }))
                    }
                },
                googleLogin: async () => {
                    try {
                        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
                        const { idToken } = await GoogleSignin.signIn()
                        const googleCredential = auth.GoogleAuthProvider.credential(idToken)
                        await auth().signInWithCredential(googleCredential).then(() => {
                            const _user = auth().currentUser
                            messaging()
                                .getToken()
                                .then(token => {
                                    setUserToken(token)
                                    console.log('token is: ', token)
                                })
                                .catch((e) => {
                                    console.log('error while retrieving messaging token: ', e)
                                })
                            if (Math.abs(Date.parse(_user.metadata.creationTime) - Date.parse(_user.metadata.lastSignInTime)) < 1000) {
                                let now = new Date()
                                if (now - Date.parse(_user.metadata.creationTime) > 5000) {
                                    setGlobalVars(val => ({ ...val, loggingIn: false }))
                                } else {
                                    makeNewUserChat()
                                }
                            } else {
                                console.log('User was not just created.')
                                setGlobalVars(val => ({ ...val, loggingIn: false }))
                            }
                        })
                            .catch((e) => {
                                console.log('Error when updating user info for Google login: ', e)
                                setGlobalVars(val => ({ ...val, loggingIn: false }))
                            })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        console.log(e)
                        if (e.code === statusCodes.SIGN_IN_CANCELLED) {
                            setGlobalVars(val => ({ ...val, loggingIn: false }))
                        }
                        setGlobalVars(val => ({ ...val, loggingIn: false }))
                    }
                },
                appleLogin: async () => {
                    try {
                        // Start the sign-in request
                        const appleAuthRequestResponse = await appleAuth.performRequest({
                            requestedOperation: appleAuth.Operation.LOGIN,
                            requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
                        })

                        // Ensure Apple returned a user identityToken
                        if (!appleAuthRequestResponse.identityToken) {
                            throw new Error('Apple Sign-In failed - no identify token returned')
                        }

                        // Create a Firebase credential from the response
                        const { identityToken, nonce, fullName } = appleAuthRequestResponse
                        const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce)

                        // Sign the user in with the credential
                        const userCredentials = await auth().signInWithCredential(appleCredential).catch((e) => {
                            console.log('error while signing in with apple: ', e)
                        })
                        if (userCredentials.user) {
                            if (fullName.familyName != null && fullName.givenName != null) {
                                const displayName = fullName.givenName + ' ' + fullName.familyName
                                await userCredentials.user.updateProfile({
                                    displayName,
                                    photoURL: `https://avatars.dicebear.com/api/bottts/${fullName.familyName}.png?dataUri=true`,
                                    type: 'client'
                                })
                            }
                            await userCredentials.user.reload().then(() => {
                                const _user = auth().currentUser
                                messaging()
                                .getToken()
                                .then(token => {
                                    setUserToken(token)
                                    console.log('token is: ', token)
                                })
                                .catch((e) => {
                                    console.log('error while retrieving messaging token: ', e)
                                })
                                if (Math.abs(Date.parse(_user.metadata.creationTime) - Date.parse(_user.metadata.lastSignInTime)) < 1000) {
                                    let now = new Date()
                                    if (now - Date.parse(_user.metadata.creationTime) > 5000) {
                                        setGlobalVars(val => ({ ...val, loggingIn: false }))
                                    } else {
                                        makeNewUserChat()
                                    }
                                } else {
                                    console.log('User was not just created.')
                                    setGlobalVars(val => ({ ...val, loggingIn: false }))
                                }
                            })
                        } else {
                            console.log('User not found when logging in with Apple.')
                        }
                    } catch (e) {
                        const eMessage = e.message.toString()
                        //setAuthErrorText(eMessage.substring(0, eMessage.indexOf('(')))
                        console.log(e)
                        setGlobalVars(val => ({ ...val, loggingIn: false }))
                    }
                },
                register: async (name, email, password) => {
                    try {
                        const userCredentials = await auth().createUserWithEmailAndPassword(email, password)
                        if (userCredentials.user) {
                            userCredentials.user.sendEmailVerification()
                            await userCredentials.user.updateProfile({
                                displayName: name,
                                photoURL: `https://avatars.dicebear.com/api/bottts/${name}.png?dataUri=true`,
                                type: 'client'
                            })
                            await userCredentials.user.reload().then(() => {
                                messaging()
                                    .getToken()
                                    .then(token => {
                                        setUserToken(token)
                                    })
                                    .catch((e) => {
                                        console.log('error while retrieving messaging token: ', e)
                                    })
                                makeNewUserChat()
                            })
                        }
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthErrorText(eMessage.substring(eMessage.lastIndexOf(']') + 2))
                        console.log(e)
                        setGlobalVars(val => ({ ...val, loggingIn: false }))
                    }
                },
                forgotPassword: async (email) => {
                    try {
                        await auth().sendPasswordResetEmail(email).then(() => { setEmailSent(true) })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthErrorText(eMessage.substring(eMessage.lastIndexOf(']') + 2))
                        console.log(e)
                    }
                },
                deleteAccount: async () => {
                    try {
                        await firestore()
                            .collection('deleted-users')
                            .doc('id-list')
                            .update({
                                // log deleted user's UID so that all their respective images peut être effacé
                                uids: firestore.FieldValue.arrayUnion(auth().currentUser.uid)
                            })
                            .catch((e) => {
                                console.log("Error while deleting user: ", e)
                            })
                        await firestore()
                            .collection('user-info')
                            .doc(auth().currentUser.uid)
                            .set({
                                deleted: true
                            }, { merge: true })
                        await auth().currentUser.delete().then(() => {
                            Alert.alert(
                                'Account deleted!',
                                'Your account has been successfully deleted.')
                            setGlobalVars(val => ({ ...val, loggingIn: false }))
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthErrorText(eMessage.substring(eMessage.lastIndexOf(']') + 2))
                        console.log(e)
                    }
                },
                logout: async () => {
                    try {
                        await auth().signOut().then(() => {
                            messaging().deleteToken()
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthErrorText(eMessage.substring(eMessage.lastIndexOf(']') + 2))
                        console.log(e)
                    }
                },
                emailVerification: async () => {
                    try {
                        await auth().currentUser.sendEmailVerification().then(() => {
                            setVerificationEmailSent(true)
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthErrorText(eMessage.substring(eMessage.lastIndexOf(']') + 2))
                        console.log(e)
                    }
                },
                updateInfo: async ({ ...rest }) => {
                    try {
                        await auth().currentUser.updateProfile({ ...rest }).then(() => {
                            const _user = auth().currentUser
                            firestore()
                                .collection('user-info')
                                .doc(_user.uid)
                                .set({ ...rest }, { merge: true })
                                .catch((e) => {
                                    console.log("Error while updating user profile on Firestore: ", e)
                                })
                            setInfoUpdated(true)
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthErrorText(eMessage.substring(eMessage.lastIndexOf(']') + 2))
                        console.log(e)
                    }
                },
                changePassword: async (password) => {
                    try {
                        await auth().currentUser.updatePassword(password).then(() => {
                            setPasswordChanged(true)
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthErrorText(eMessage.substring(eMessage.lastIndexOf(']') + 2))
                        console.log(e)
                    }
                },
                changeEmail: async (email) => {
                    try {
                        await auth().currentUser.updateEmail(email).then(() => {
                            auth().currentUser.sendEmailVerification().then(() => {
                                auth().signOut().then(() => {
                                    messaging().deleteToken()
                                    Alert.alert('Email updated!', 'Please log in with your new email.')
                                })
                            })
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthErrorText(eMessage.substring(eMessage.lastIndexOf(']') + 2))
                        console.log(e)
                    }
                },
                getUserInfo: async (uid) => {
                    await firestore()
                        .collection('user-info')
                        .doc(uid)
                        .get()
                        .then((doc) => {
                            return doc.data()
                        })
                },
                infoUpdated, setInfoUpdated,
                emailUpdated, setEmailUpdated,
                passwordChanged, setPasswordChanged,
                authErrorText, setAuthErrorText,
                emailSent, setEmailSent,
                verificationEmailSent,
                globalVars, setGlobalVars
            }}
        >
            {children}
            {
                globalVars.loggingIn ?
                    <View style={{ position: 'absolute', width: windowWidth, height: windowHeight, backgroundColor: 'rgba(32,32,96,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size={60} color="#BDB9DB" />
                    </View>
                    : null
            }
        </AuthContext.Provider>
    )
}
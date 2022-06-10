import React, { createContext, useCallback, useRef, useState } from 'react'
import { ActivityIndicator, Alert, View } from 'react-native'
import auth from '@react-native-firebase/auth'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { appleAuth } from '@invertase/react-native-apple-authentication'
import firestore from '@react-native-firebase/firestore'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import messaging from '@react-native-firebase/messaging'
import AsyncStorage from '@react-native-async-storage/async-storage'
import crashlytics from '@react-native-firebase/crashlytics'
import analytics from '@react-native-firebase/analytics'
import { requestUserPermission, checkUserPermission } from '../utils/notificationServices'
import { Mixpanel } from 'mixpanel-react-native'
import { MIXPANEL_TOKEN } from '../constants/constants'

export const AuthContext = createContext()

const mixpanel = new Mixpanel(MIXPANEL_TOKEN)
mixpanel.init()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    const [authErrorText, setAuthErrorText] = useState('')
    const [emailSent, setEmailSent] = useState(false)
    const [verificationEmailSent, setVerificationEmailSent] = useState(false)
    const [passwordChanged, setPasswordChanged] = useState(false)
    const [infoUpdated, setInfoUpdated] = useState(false)
    const [emailUpdated, setEmailUpdated] = useState(false)
    const [globalVars, setGlobalVars] = useState({})

    const logLoginEvent = async () => {
        const _user = auth().currentUser
        await analytics().logEvent('user_signin', {
            userID: _user.uid,
            loginTime: _user.metadata.lastSignInTime
        })
    }

    // const makeNewUserChat = async () => {
    //     const _user = auth().currentUser
    //     await analytics().logEvent('new_signup', {
    //         userID: _user.uid,
    //         dateJoined: _user.metadata.creationTime
    //     })
    //     let coachList = []
    //     firestore()
    //         .collection('user-info')
    //         .where('type', '==', 'coach')
    //         .get()
    //         .then((querySnapshot) => {
    //             querySnapshot.forEach((doc) => {
    //                 coachList.push(doc.id)
    //             })
    //         })
    //         .then(() => {
    //             var userCoachGet = coachList[Math.floor(Math.random() * coachList.length)]
    //             let userCoach = userCoachGet
    //             const _user = auth().currentUser
    //             firestore()
    //                 .collection('chat-rooms')
    //                 .add({
    //                     timeCreated: firestore.Timestamp.now(),
    //                     latestMessageTime: firestore.Timestamp.now(),
    //                     latestMessage: "",
    //                     userIDs: [_user.uid, userCoach],
    //                     unreadCount: 0,
    //                     ungradedImageCount: 0
    //                 })
    //                 .then((doc) => {
    //                     setGlobalVars(val => ({
    //                         ...val,
    //                         chatID: doc.id,
    //                     }))
    //                 })
    //                 .then(() => {
    //                     const _user = auth().currentUser
    //                     firestore()
    //                         .collection('user-info')
    //                         .doc(_user.uid)
    //                         .set({
    //                             displayName: _user.displayName,
    //                             photoURL: _user.photoURL,
    //                             type: 'client',
    //                             lastImageSent: firestore.Timestamp.fromDate(new Date(2022, 1, 1)),
    //                             streakUpdated: firestore.Timestamp.fromDate(new Date(2022, 1, 1)),
    //                             totalImageCount: 0,
    //                             streak: 0,
    //                             dateJoined: _user.metadata.creationTime,
    //                             courseData: {
    //                                 courseDay: 1,
    //                                 courseDayCompleted: false,
    //                                 latestCourseCompleted: 0
    //                             },
    //                             lastLoggedIn: _user.metadata.lastSignInTime,
    //                             lastWeighIn: firestore.Timestamp.fromDate(new Date(2022, 1, 1)),
    //                             usesImperial: true,
    //                             trialPeriod: true,
    //                             photoURLLastUpdated: firestore.Timestamp.fromDate(new Date(2022, 1, 1)),
    //                             emailLastUpdated: firestore.Timestamp.fromDate(new Date(2022, 1, 1)),
    //                             displayNameLastUpdated: firestore.Timestamp.fromDate(new Date(2022, 1, 1)),
    //                             passwordLastUpdated: firestore.Timestamp.fromDate(new Date(2022, 1, 1)),
    //                             settings: {
    //                                 notificationTypes: ['chatMessage', 'imageGrade', 'courseLink', 'statSummary', 'mealReminder']
    //                             }
    //                         }, { merge: true })
    //                         .then(() => {
    //                             setGlobalVars(val => ({ ...val, loggingIn: false }))
    //                             const _user = auth().currentUser
    //                             _user.reload()
    //                         })
    //                         .catch((e) => {
    //                             console.log("Error while adding user profile on Firestore: ", e)
    //                             crashlytics().recordError(e)
    //                         })
    //                 })
    //                 .catch((e) => {
    //                     console.log('Error while making new coach/client chat: ', e)
    //                     crashlytics().recordError(e)
    //                 })
    //         })
    //         .catch((e) => {
    //             console.log("Error while fetching coach data: ", e)
    //             crashlytics().recordError(e)
    //         })
    // }

    // subscribe user to meal msging topics
    async function setUserMessagingInfo(token) {
        const _user = auth().currentUser
        // check if user has completed onboarding wizard (at some point)
        const userBioData = await AsyncStorage.getItem('@onboarding_responses')
        // check if user has completed onboarding wizard (in this app instance)
        if(globalVars.userBioData == null) {
            if (userBioData != null) {
                for(let mealTime of JSON.parse(userBioData).mealTimes) {
                    // getting UTC time of meal time ensures that the user's timezone is accounted for
                    const globalHour = new Date(mealTime).getUTCHours()
                    // subscribe user to that messaging topic
                    messaging().subscribeToTopic(`MealReminderAt${globalHour}`).then(() => {
                        console.log('Subscribed user to messaging topic: MealReminderAt' + globalHour)
                    }).catch((e) => {
                        console.error('error while subscribing user to meal reminder: ', e)
                    })
                }
                messaging().subscribeToTopic('subscribed')
                // set user bio data in their profile
                firestore()
                    .collection('user-info')
                    .doc(_user.uid)
                    .set({
                        userBioData: JSON.parse(userBioData)
                    }, { merge: true })
                    .catch((e) => {
                        console.log('error while setting userbiodata: ', e)
                        crashlytics().recordError(e)
                    })
            }
        } else {
            for(let mealTime of globalVars.userBioData.mealTimes) {
                const globalHour = new Date(mealTime).getUTCHours()
                messaging().subscribeToTopic(`MealReminderAt${globalHour}`).then(() => {
                    console.log('Subscribed user to messaging topic: MealReminderAt' + globalHour)
                })
            }
            messaging().subscribeToTopic('subscribed')
            firestore()
                .collection('user-info')
                .doc(_user.uid)
                .set({
                    userBioData: globalVars.userBioData
                }, { merge: true })
                .catch((e) => {
                    console.log('error while setting userbiodata: ', e)
                    crashlytics().recordError(e)
                })
        }
        // set user messaging token and some extra metadata
        await firestore()
            .collection('user-info')
            .doc(_user.uid)
            .set({
                fcmToken: token,
                lastLoggedIn: _user.metadata.lastSignInTime,
                settings: {
                    notificationTypes: ['chatMessage', 'imageGrade', 'courseLink', 'statSummary', 'mealReminder']
                }
            }, { merge: true })
            .catch((e) => {
                console.log('error while setting user token: ', e)
                crashlytics().recordError(e)
            })
    }

    return (
        <AuthContext.Provider
            value={{
                // this is where we create/define the global vars
                user,
                setUser,
                mixpanel,
                login: async (email, password) => {
                    try {
                        await auth().signInWithEmailAndPassword(email, password).then(() => {
                            logLoginEvent()
                            setGlobalVars(val => ({ ...val, loggingIn: false }))
                            // messaging token is needed to send notifications to user
                            messaging()
                                .getToken()
                                .then(token => {
                                    return setUserMessagingInfo(token)
                                })
                                .catch((e) => {
                                    console.error('error while retrieving messaging token (login): ', e)
                                    crashlytics().recordError(e)
                                })
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthErrorText(eMessage.substring(eMessage.lastIndexOf(']') + 2))
                        console.log(e)
                        crashlytics().recordError(e)
                        setGlobalVars(val => ({ ...val, loggingIn: false }))
                    }
                },
                googleLogin: async () => {
                    try {
                        // stuff required for google login. basically copy pasted this from documentation at rnfirebase.io
                        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
                        const { idToken } = await GoogleSignin.signIn()
                        const googleCredential = auth.GoogleAuthProvider.credential(idToken)
                        await auth().signInWithCredential(googleCredential).then(() => {
                            messaging()
                                .getToken()
                                .then(token => {
                                    setUserMessagingInfo(token)
                                })
                                .catch((e) => {
                                    console.log('error while retrieving messaging token (google login): ', e)
                                    crashlytics().recordError(e)
                                })
                            // if (Math.abs(Date.parse(_user.metadata.creationTime) - Date.parse(_user.metadata.lastSignInTime)) < 1000) {
                            //     let now = new Date()
                            //     if (now - Date.parse(_user.metadata.creationTime) > 5000) {
                            //         logLoginEvent()
                            //         setGlobalVars(val => ({ ...val, loggingIn: false }))
                            //     } else {
                            //         makeNewUserChat()
                            //     }
                            // } else {
                            //     console.log('User was not just created.')
                            //     logLoginEvent()
                            //     setGlobalVars(val => ({ ...val, loggingIn: false }))
                            // }
                            logLoginEvent()
                            setGlobalVars(val => ({ ...val, loggingIn: false }))
                        })
                            .catch((e) => {
                                console.log('Error when updating user info for Google login: ', e)
                                crashlytics().recordError(e)
                                setGlobalVars(val => ({ ...val, loggingIn: false }))
                            })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        console.log(e)
                        crashlytics().recordError(e)
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
                            crashlytics().recordError(e)
                        })
                        if (userCredentials.user) {
                            // set display name to user's name
                            if (fullName.familyName != null || fullName.givenName != null) {
                                const displayName = fullName.givenName + ' ' + fullName.familyName
                                await userCredentials.user.updateProfile({
                                    displayName,
                                    photoURL: `https://avatars.dicebear.com/api/bottts/${fullName.familyName}.png?dataUri=true`,
                                    type: 'client'
                                })
                            }
                            await userCredentials.user.reload().then(() => {
                                messaging()
                                .getToken()
                                .then(token => {
                                    setUserMessagingInfo(token)
                                })
                                .catch((e) => {
                                    console.log('error while retrieving messaging token (apple login): ', e)
                                    crashlytics().recordError(e)
                                })
                                // if (Math.abs(Date.parse(_user.metadata.creationTime) - Date.parse(_user.metadata.lastSignInTime)) < 1000) {
                                //     let now = new Date()
                                //     if (now - Date.parse(_user.metadata.creationTime) > 5000) {
                                //         logLoginEvent()
                                //         setGlobalVars(val => ({ ...val, loggingIn: false }))
                                //     } else {
                                //         makeNewUserChat()
                                //     }
                                // } else {
                                //     console.log('User was not just created.')
                                //     logLoginEvent()
                                //     setGlobalVars(val => ({ ...val, loggingIn: false }))
                                // }
                                logLoginEvent()
                                setGlobalVars(val => ({ ...val, loggingIn: false }))
                            })
                        } else {
                            console.log('User not found when logging in with Apple.')
                        }
                    } catch (e) {
                        const eMessage = e.message.toString()
                        //setAuthErrorText(eMessage.substring(0, eMessage.indexOf('(')))
                        console.log(e)
                        crashlytics().recordError(e)
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
                                        setUserMessagingInfo(token)
                                    })
                                    .catch((e) => {
                                        console.log('error while retrieving messaging token (register): ', e)
                                        crashlytics().recordError(e)
                                    })
                                // makeNewUserChat()
                            })
                        }
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthErrorText(eMessage.substring(eMessage.lastIndexOf(']') + 2))
                        console.log(e)
                        crashlytics().recordError(e)
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
                        crashlytics().recordError(e)
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
                                crashlytics().recordError(e)
                            })
                        await firestore()
                            .collection('user-info')
                            .doc(auth().currentUser.uid)
                            .set({
                                deleted: true,
                                dateDeleted: firestore.Timestamp.now()
                            }, { merge: true })
                        await auth().currentUser.delete().then(() => {
                            Alert.alert(
                                'Account deleted!',
                                'Your account has been successfully deleted.')
                            setGlobalVars(val => ({ ...val, loggingIn: false }))
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthErrorText(e)
                        console.log(e)
                        crashlytics().recordError(e)
                        await firestore()
                            .collection('deleted-users')
                            .doc('id-list')
                            .update({
                                // remove deleted user's uid
                                uids: firestore.FieldValue.arrayRemove(auth().currentUser.uid)
                            })
                            .catch((e) => {
                                console.log("Error while deleting user: ", e)
                                crashlytics().recordError(e)
                            })
                        await firestore()
                            .collection('user-info')
                            .doc(auth().currentUser.uid)
                            .set({
                                deleted: false,
                                dateDeleted: null
                            }, { merge: true })
                    }
                },
                logout: async () => {
                    try {
                        await auth().signOut().then(() => {
                            messaging().deleteToken()
                            AsyncStorage.removeItem('@notifs_enabled')
                            AsyncStorage.removeItem('alreadyLoggedIn')
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthErrorText(eMessage.substring(eMessage.lastIndexOf(']') + 2))
                        console.log(e)
                        crashlytics().recordError(e)
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
                        crashlytics().recordError(e)
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
                                    crashlytics().recordError(e)
                                })
                            analytics().logEvent('profile_updated', {
                                userID: _user.uid,
                                ...rest
                            }).catch((e) => {
                                console.log('error while logging profile update event: ', e)
                                crashlytics().recordError(e)
                            })
                            mixpanel.track('Profile Update', {...rest})
                            setInfoUpdated(true)
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthErrorText(eMessage.substring(eMessage.lastIndexOf(']') + 2))
                        console.log(e)
                        crashlytics().recordError(e)
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
                        crashlytics().recordError(e)
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
                        crashlytics().recordError(e)
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
                requestPermission: async () => {
                    const _user = auth().currentUser
                    // check if user has received notif enable prompt
                    const alreadyEnabled = await AsyncStorage.getItem('@notifs_enabled')
                    if (alreadyEnabled == null) {
                        // request user notif permission
                        const result = await requestUserPermission()
                        // update user profile with the result
                        firestore()
                            .collection('user-info')
                            .doc(_user.uid)
                            .set({ notificationsEnabled: result }, { merge: true })
                        await AsyncStorage.setItem('@notifs_enabled', JSON.stringify(result))
                        setGlobalVars(val => ({ ...val, notificationsEnabled: result }))
                        if (result) {
                            messaging()
                                .getToken()
                                .then(token => {
                                    setUserMessagingInfo(token)
                                })
                        }
                        // if (result) {
                        //     firestore()
                        //         .collection('user-info')
                        //         .doc(_user.uid)
                        //         .set({ notificationsEnabled: true }, { merge: true })
                        //     await AsyncStorage.setItem('@notifs_enabled', 'true')
                        //     setGlobalVars(val => ({ ...val, notificationsEnabled: true }))
                        // } else if (!result) {
                        //     firestore()
                        //         .collection('user-info')
                        //         .doc(_user.uid)
                        //         .set({ notificationsEnabled: false }, { merge: true })
                        //     await AsyncStorage.setItem('@notifs_enabled', 'false')
                        //     setGlobalVars(val => ({ ...val, notificationsEnabled: false }))
                        // }
                    } else {
                        const result = await requestUserPermission()
                        if (result !== JSON.parse(alreadyEnabled)) {
                            firestore()
                                .collection('user-info')
                                .doc(_user.uid)
                                .set({ notificationsEnabled: result }, { merge: true })
                            await AsyncStorage.setItem('@notifs_enabled', JSON.stringify(result))
                            setGlobalVars(val => ({ ...val, notificationsEnabled: result }))
                            messaging()
                                .getToken()
                                .then(token => {
                                    setUserMessagingInfo(token)
                                })
                        }
                    }
                },
                checkHasPermission: async () => {
                    const _user = auth().currentUser
                    const alreadyEnabled = await AsyncStorage.getItem('@notifs_enabled')
                    if (alreadyEnabled == null) {
                        const result = await checkUserPermission()
                        firestore()
                            .collection('user-info')
                            .doc(_user.uid)
                            .set({ notificationsEnabled: result }, { merge: true })
                        await AsyncStorage.setItem('@notifs_enabled', JSON.stringify(result))
                        setGlobalVars(val => ({ ...val, notificationsEnabled: result }))
                        if (result) {
                            messaging()
                                .getToken()
                                .then(token => {
                                    setUserMessagingInfo(token)
                                })
                        }
                    } else {
                        const result = await checkUserPermission()
                        if (result !== JSON.parse(alreadyEnabled)) {
                            firestore()
                                .collection('user-info')
                                .doc(_user.uid)
                                .set({ notificationsEnabled: result }, { merge: true })
                            await AsyncStorage.setItem('@notifs_enabled', JSON.stringify(result))
                            setGlobalVars(val => ({ ...val, notificationsEnabled: result }))
                            messaging()
                                .getToken()
                                .then(token => {
                                    setUserMessagingInfo(token)
                                })
                        }
                    }
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
            {globalVars.loggingIn &&
            <View style={{ position: 'absolute', width: windowWidth, height: windowHeight, backgroundColor: 'rgba(32,32,96,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size={60} color="#BDB9DB" />
            </View>}
            {/* <Recaptcha 
                ref={recaptcha}
                lang='en'
                loadingComponent = { !globalVars.loggingIn &&
                    <View style={{ position: 'absolute', width: windowWidth, height: windowHeight, backgroundColor: 'rgba(32,32,96,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size={60} color="#BDB9DB" />
                    </View>
                }
                siteKey=''
                baseUrl=''
                size='normal'
                onLoad={() => console.log('Captcha loaded')}
                onClose={() => console.log('Captcha closed')}
                onError={(err) => {
                    console.warn(err)
                }}
                onExpire={() => console.log('Captcha expired')}
                onVerify={(token) => {
                    setGlobalVars(val => ({...val, captchaToken: token}))
                }}
            /> */}
        </AuthContext.Provider>
    )
}
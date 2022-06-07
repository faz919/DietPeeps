import React, { useState, useContext, useEffect, useRef, useCallback } from 'react'
import { KeyboardAvoidingView, SafeAreaView, View, Text, StyleSheet, TouchableOpacity, TextInput, Image, FlatList, ActivityIndicator, ImageBackground, Alert, Platform, Keyboard, Linking, Pressable, Share, Vibration } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Icon from 'react-native-vector-icons/Ionicons'
import Modal from 'react-native-modal'
import AsyncStorage from "@react-native-async-storage/async-storage"

import storage from '@react-native-firebase/storage'
import firestore from '@react-native-firebase/firestore'
import ImagePicker from 'react-native-image-crop-picker'
import { AuthContext } from '../navigation/AuthProvider'

import { windowHeight, windowWidth } from '../utils/Dimensions.js'
import moment from 'moment'
import messaging from '@react-native-firebase/messaging'
import analytics from '@react-native-firebase/analytics'
import ChatImage from '../components/ChatImage'
import ProfilePic from '../components/ProfilePic'
import { AnimatePresence, MotiView } from 'moti'

import badge from '../assets/badge.png'
import CourseData from '../courses/CourseData.json'
import CourseLinkImage from '../components/CourseLinkImage'
import crashlytics from '@react-native-firebase/crashlytics'
import DeviceInfo from 'react-native-device-info'
import Purchases from 'react-native-purchases'
import { ENTITLEMENT_ID } from '../constants/constants'
import { Easing } from 'react-native-reanimated'
import { BlurView } from "@react-native-community/blur"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import StreakGif from '../components/StreakGif'
import TrialPeriodFinishedScreen from './TrialPeriodFinishedScreen'
import UserFlaggedScreen from './UserFlaggedScreen'
import ShareMenu from 'react-native-share-menu'
import MessageOptions from '../components/MessageOptions'
import ImageResizer from 'react-native-image-resizer'
import RNFS from 'react-native-fs'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import ChatMessage from '../components/ChatMessage'

const Chat = ({ navigation, route }) => {

    const { imageInfo, hasSubscribed } = route.params

    const insets = useSafeAreaInsets()
    const bottomBarHeight = useBottomTabBarHeight()
    const messageInputRef = useRef()

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            navigation.setParams({ imageInfo: null })
        })
        return unsubscribe
    }, [navigation])

    const { user, updateInfo, globalVars, setGlobalVars, requestPermission, checkHasPermission, mixpanel } = useContext(AuthContext)

    const [online, setOnline] = useState(true)
    const [messageInput, setMessageInput] = useState('')
    const [images, setImages] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [sendingMessage, setSendingMessage] = useState(false)
    const [attachingImage, setAttachingImage] = useState({})
    const [messageBatches, setMessageBatches] = useState(1)
    const [messagesEndReached, setMessagesEndReached] = useState(false)
    const [scrollToLatestButton, showScrollToLatestButton] = useState(false)
    const [scrollButtonLeft, setScrollButtonLeft] = useState(0)
    const [imgCountUpdated, setUpdated] = useState(false)
    // const [wizardRedirected, setWizardRedirected] = useState(false)
    const [subscribed, setSubscribed] = useState(null)
    const [trialPeriodFinished, setTrialPeriodFinished] = useState(false)
    const [showExtraDaysButton, setShowExtraDaysButton] = useState(false)
    const [showWeighInButton, setShowWeighIn] = useState(false)
    const [redirected, setRedirected] = useState(false)
    const [userFlagged, setUserFlagged] = useState(false)

    useEffect(() => {
        if (subscribed) {
            setTrialPeriodFinished(false)
        }
    }, [subscribed])

    useEffect(() => {
        if (hasSubscribed) {
            navigation.navigate('Congrats', { congratsType: 'subscribed' })
        }
    }, [hasSubscribed])

    useEffect(() => {
        if (globalVars.hasWeighedIn) {
            setTimeout(() => {
                setGlobalVars(val => ({ ...val, hasWeighedIn: false }))
                navigation.navigate('Congrats', { congratsType: 'weighedIn' })
            }, 500)
        }
    }, [globalVars.hasWeighedIn])

    const messagesList = useRef()

    const scrollToLatest = () => {
        messagesList && messagesList.current.scrollToIndex({ index: 0, viewOffset: replyingToMessage ? 100 : 80 })
    }

    const loadMoreMessages = () => {
        !messagesEndReached && setMessageBatches(messageBatches + 1)
    }

    const detectScrollPos = (event) => {
        showScrollToLatestButton(event.nativeEvent.contentOffset.y > 1300)
    }

    const createImageData = async (item) => {
        const imageData = []
        // if platform is ios, push each item in item.data to imageData, else push item.data to imageData
        try {
            if (Platform.OS === 'ios') {
                item.data.forEach(async (image) => {
                    try {
                        const newImage = await ImageResizer.createResizedImage(image.data, 2000, 512, 'JPEG', 100)
                        // const base64 = await RNFS.readFile(newImage.uri, 'base64')
                        // console.log('base64 is: ', typeof base64)
                        imageData.push({ uri: newImage.uri, mime: image.mimeType, 
                            // base64, 
                            fileSize: newImage.size })
                    } catch (e) {
                        console.error('yo ', e)
                    }
                })
            } else if (Platform.OS === 'android') {
                if (item.data.startsWith('content://')) {
                    // do some magic to convert from data uri to file path
                    const urlComponents = item.data.split('/')
                    const fileNameAndExtension = urlComponents[urlComponents.length - 1]
                    const destPath = `${RNFS.TemporaryDirectoryPath}/${fileNameAndExtension}`
                    await RNFS.copyFile(item.data, destPath)
                    // image resizer
                    const newImage = await ImageResizer.createResizedImage('file://' + destPath, 2000, 512, 'JPEG', 100)
                    // const base64 = await RNFS.readFile(newImage.uri, 'base64')
                    // console.log('base64 is: ', typeof base64)
                    imageData.push({ uri: newImage.uri, mime: item.mimeType, 
                        // base64, 
                        fileSize: newImage.size })
                } else {
                    const newImage = await ImageResizer.createResizedImage(item.data, 2000, 512, 'JPEG', 100)
                    // const base64 = await RNFS.readFile(newImage.uri, 'base64')
                    // console.log('base64 is: ', typeof base64)
                    imageData.push({ uri: newImage.uri, mime: item.mimeType, 
                        // base64, 
                        fileSize: newImage.size })
                }
            } else {
                Alert.alert(
                    'Error',
                    'Image sharing from camera roll is not supported on this device.',
                )
                return
            }
            console.log(imageData)
            setImages(imageData)
        } catch (e) {
            console.error('error while creating image data: ', e)
        }
    }

    const handleShare = useCallback((item) => {
        if (Platform.OS === 'android' && !item) {
            return
        }

        if (Platform.OS === 'ios' && (!item || item?.data?.length === 0 || item?.data == null)) {
            return
        }

        console.log(item)
        createImageData(item)
    }, [])

    // if app opens from closed state
    useEffect(() => {
        ShareMenu.getInitialShare(handleShare)
    }, [])

    // if app opens from background state
    useEffect(() => {
        const listener = ShareMenu.addNewShareListener(handleShare)

        return () => {
            listener.remove()
        }
    }, [])

    const takePhotoFromCamera = () => {
        analytics().logEvent('opened_camera', {
            userID: user.uid,
            timestamp: new Date()
        })
        setAttachingImage(val => ({ ...val, loading: true }))
        ImagePicker.openCamera({
            cropping: false,
            includeExif: true,
            compressImageMaxHeight: 512,
            forceJpg: true,
            // includeBase64: true
        }).then((i) => {
            setImages([{
                uri: i.path,
                width: i.width,
                height: i.height,
                // mime: i.mime,
                // base64: i.data,
                fileSize: i.size
            }])
            setAttachingImage(val => ({ ...val, visible: false }))
            setAttachingImage(val => ({ ...val, loading: false }))
            setGlobalVars(val => ({ ...val, autoSend: true }))
        }).catch((e) => {
            if (e.code !== 'E_PICKER_CANCELLED') {
                crashlytics().recordError(e)
                console.error('error while taking photo: ', e.message)
            }
            if (e.code === 'E_NO_CAMERA_PERMISSION') {
                Alert.alert(
                    'We need your permission',
                    'Please allow camera access in your app settings.',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => Alert.alert(
                                'Are you sure?',
                                'This app requires you to send photos of your meals.',
                                [
                                    {
                                        text: 'Cancel',
                                        style: 'cancel'
                                    },
                                    {
                                        text: 'Go to Settings',
                                        onPress: () => Linking.openSettings()
                                    }
                                ]
                            ),
                            style: 'cancel'
                        },
                        {
                            text: 'Go to Settings',
                            onPress: () => Linking.openSettings()
                        }
                    ]
                )
            }
            setAttachingImage(val => ({ ...val, loading: false }))
        })
    }

    const choosePhotosFromLibrary = () => {
        analytics().logEvent('opened_camera', {
            userID: user.uid,
            timestamp: new Date()
        })
        setAttachingImage(val => ({ ...val, loading: true }))
        ImagePicker.openPicker({
            multiple: true,
            includeExif: true,
            compressImageMaxHeight: 512,
            forceJpg: true,
            // includeBase64: true
        }).then((imageData) => {
            setImages(imageData.map((i) => {
                return {
                    uri: i.path,
                    width: i.width,
                    height: i.height,
                    mime: i.mime,
                    // base64: i.data,
                    fileSize: i.size
                }
            }))
            setAttachingImage(val => ({ ...val, visible: false }))
            setAttachingImage(val => ({ ...val, loading: false }))
        }).catch((e) => {
            if (e.code !== 'E_PICKER_CANCELLED') {
                crashlytics().recordError(e)
                console.error('error while choosing photos from library: ', e.message)
            }
            if (e.code === 'E_NO_LIBRARY_PERMISSION') {
                Alert.alert(
                    'We need your permission',
                    'Please allow photo library access in your app settings.',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => Alert.alert(
                                'Are you sure?',
                                'This app requires you to send photos of your meals.',
                                [
                                    {
                                        text: 'Cancel',
                                        style: 'cancel'
                                    },
                                    {
                                        text: 'Go to Settings',
                                        onPress: () => Linking.openSettings()
                                    }
                                ]
                            ),
                            style: 'cancel'
                        },
                        {
                            text: 'Go to Settings',
                            onPress: () => Linking.openSettings()
                        }
                    ]
                )
            }
            setAttachingImage(val => ({ ...val, loading: false }))
        })
    }

    function age(birthDate) {
        var ageInMilliseconds = new Date() - new Date(birthDate)
        return Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24 * 365))
    }

    useEffect(() => {
        if (user) {
            checkHasPermission()
            mixpanel.identify(user.uid)
            mixpanel.getPeople().set('Display Name', user.displayName)
            mixpanel.getPeople().set('Email', user.email)
            firestore()
                .collection('user-info')
                .doc(user.uid)
                .onSnapshot(async (userData) => {
                    if (userData.exists) {
                        setGlobalVars(val => ({ ...val, userData: userData.data() }))
                        const usr = userData.data()
                        if (usr.userBioData != null) {
                            const dob = new Date(usr.userBioData.dob instanceof firestore.Timestamp ? usr.userBioData.dob.toDate() : usr.userBioData.dob)
                            if (age(dob) < 18) {
                                setUserFlagged(true)
                                // set globalvar of userflagged to true
                                setGlobalVars(val => ({ ...val, userFlagged: true }))
                            }
                            try {
                                const subscribedToMealTimes = await AsyncStorage.getItem('subscribed_user_meal_times')
                                // subscribe user to messaging topic
                                if (subscribedToMealTimes == null) {
                                    for (let mealTime of usr.userBioData.mealTimes) {
                                        console.log(mealTime)
                                        const globalHour = new Date(mealTime instanceof firestore.Timestamp ? mealTime.toDate() : mealTime).getUTCHours()
                                        messaging().subscribeToTopic(`MealReminderAt${globalHour}`).then(() => {
                                            console.log('Subscribed user to messaging topic: MealReminderAt' + globalHour)
                                        }).catch((e) => {
                                            console.error('error while subscribing user to meal reminder: ', e)
                                        })
                                    }
                                    messaging().subscribeToTopic('subscribed')
                                    AsyncStorage.setItem('subscribed_user_meal_times', 'true')
                                }
                            } catch (e) {
                                console.error(e)
                            }
                        }
                        const deviceInfo = {
                            deviceOS: Platform.OS,
                            deviceModel: DeviceInfo.getModel(),
                            deviceID: DeviceInfo.getUniqueId()
                        }
                        const appInfo = {
                            versionName: '1.04',
                            versionCode: 16
                        }
                        // check if user has null display name, photo url, or email
                        usr.displayName !== user.displayName && updateInfo({ displayName: user.displayName })
                        usr.photoURL !== user.photoURL && updateInfo({ photoURL: user.photoURL })
                        usr.email !== user.email && updateInfo({ email: user.email })
                        // check if user has null chat id
                        usr.chatID == null && globalVars.chatID != null && updateInfo({ chatID: globalVars.chatID })
                        // check if user has null settings or device info
                        usr.settings == null && updateInfo({
                            settings: {
                                notificationTypes: ['chatMessage', 'imageGrade', 'courseLink', 'statSummary', 'mealReminder']
                            }
                        })
                        usr.deviceInfo == null && updateInfo({ deviceInfo })
                        usr.appInfo !== appInfo && updateInfo({ appInfo })
                        // check user streak
                        if (!yesterday(usr.lastImageSent?.toDate()) && !sameDay(new Date(), usr.lastImageSent?.toDate()) && !sameDay(new Date(), usr.streakUpdated?.toDate())) {
                            updateInfo({
                                streak: 0,
                                streakUpdated: firestore.Timestamp.now()
                            })
                        }
                        // check last weigh in
                        let localDayStart = new Date()
                        localDayStart.setHours(0)
                        localDayStart.setMinutes(0)
                        localDayStart.setSeconds(0)
                        localDayStart.setMilliseconds(0)
                        if (usr.lastWeighIn?.toDate() < localDayStart || usr.lastWeighIn == null) {
                            setShowWeighIn(true)
                        } else {
                            setShowWeighIn(false)
                        }
                        // check course completions
                        const c = usr.courseData
                        if (c.courseDayCompleted && localDayStart > c.courseCompletedAt?.toDate()) {
                            updateInfo({
                                courseData: {
                                    latestCourseCompleted: c.latestCourseCompleted,
                                    courseCompletedAt: c.courseCompletedAt,
                                    courseDay: c.courseDay + 1,
                                    courseDayCompleted: false
                                }
                            })
                        }
                        // check user subscription status
                        Purchases.addPurchaserInfoUpdateListener(info => {
                            checkUserMembership(usr)
                        })
                        // if user isn't subscribed, check how long it's been since they joined
                        try {
                            if (!usr.subscribed) {
                                mixpanel.getPeople().set('Currently Paying', false)
                                const joinDate = new Date(user.metadata.creationTime)
                                const oneDay = 60 * 60 * 1000 * 24
                                const daysSinceJoin = Math.floor((new Date() - joinDate) / oneDay)
                                const daysReminded = JSON.parse(await AsyncStorage.getItem('days_reminded'))
                                const extraTrialDays = JSON.parse(await AsyncStorage.getItem('extra_days'))
                                if (extraTrialDays != null && typeof extraTrialDays === 'number') {
                                    setShowExtraDaysButton(false)
                                    daysSinceJoin >= extraTrialDays + 3 && !usr.manuallyExtendedTrialPeriod && setTrialPeriodFinished(true)
                                } else {
                                    setShowExtraDaysButton(true)
                                }
                                // console.log('days since user joined: ', daysSinceJoin)
                                daysSinceJoin >= 14 && !extraTrialDays && !usr.manuallyExtendedTrialPeriod && setTrialPeriodFinished(true)
                                if (!redirected && usr.userBioData != null) {
                                    if (daysReminded == null || !daysReminded?.includes(daysSinceJoin)) {
                                        setRedirected(true)
                                        daysSinceJoin === 14 ? navigation.navigate('Subscription', { trialReminder: daysSinceJoin }) :
                                            daysSinceJoin === 12 ? navigation.navigate('Subscription', { trialReminder: daysSinceJoin }) :
                                                daysSinceJoin === 7 && navigation.navigate('Subscription', { trialReminder: daysSinceJoin })
                                    }
                                }
                            } else {
                                mixpanel.getPeople().set('Currently Paying', true)
                            }
                        } catch (e) {
                            console.error(e)
                        }
                    }
                })
        }
    }, [user])

    useEffect(() => {
        // check if user has completed onboarding
        if (globalVars.userData != null && globalVars.userData?.userBioData == null && globalVars.userBioData == null) {
            // setWizardRedirected(true)
            return navigation.replace('Onboarding Wizard')
        }
    }, [globalVars.userData])

    useEffect(() => {
        if (trialPeriodFinished != null && globalVars.userData != null && globalVars.userData.trialPeriod !== !trialPeriodFinished) {
            updateInfo({
                trialPeriod: !trialPeriodFinished
            })
        }
        mixpanel.getPeople().set('Trial Period Finished', trialPeriodFinished)
        if (trialPeriodFinished) {
            setImages(null)
            setMessageInput('')
        }
    }, [trialPeriodFinished, globalVars.userData])

    const checkUserMembership = async (usr) => {
        try {
            const purchaserInfo = await Purchases.getPurchaserInfo()
            if (typeof purchaserInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined') {
                if (!usr.subscribed) {
                    updateInfo({ subscribed: true })
                    setSubscribed(true)
                }
                setSubscribed(true)
            } else {
                updateInfo({ subscribed: false })
                setSubscribed(false)
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (globalVars.autoSend && images?.length > 0) {
            setSendingMessage(true)
            newMessage(messageInput)
            setGlobalVars(val => ({ ...val, autoSend: false }))
        }
    }, [images, globalVars.autoSend])

    useEffect(() => {
        if (imageInfo != null) {
            setImages(imageInfo)
        }
    }, [imageInfo])

    function yesterday(date) {
        var yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return yesterday.toDateString() === date.toDateString()
    }

    function sameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
    }

    const newMessage = async (message) => {
        setMessageInput('')
        let imageInfo = await imageUploader()
        console.log("image info: ", imageInfo, new Date())
        if (message === '') {
            if (imageInfo == null) {
                setSendingMessage(false)
                return null
            } else if (imageInfo.length === 0) {
                setSendingMessage(false)
                return null
            }
        }

        let tempLastImageSent

        if (imageInfo != null) {
            if (imageInfo.length === 0) {
                imageInfo = null
                return null
            } else if (imageInfo.length > 0) {
                tempLastImageSent = globalVars.userData.lastImageSent?.toDate()
                updateInfo({
                    lastImageSent: firestore.Timestamp.now(),
                    totalImageCount: firestore.FieldValue.increment(imageInfo.length)
                })
                for (let image of imageInfo) {
                    mixpanel.track('Image Sent', { 'Image': image.url })
                    await analytics().logEvent('image', {
                        img: image,
                        timeSent: firestore.Timestamp.now(),
                        userID: user.uid,
                    }).catch((e) => {
                        console.error('error while uploading image data to analytics: ', e)
                    })
                }
            }
        }

        setSendingMessage(true)
        mixpanel.track('Message Sent', { 'Message': message })
        updateInfo({
            lastMessageSent: firestore.Timestamp.now()
        })

        await analytics().logEvent('message', {
            msg: message,
            img: imageInfo,
            timeSent: firestore.Timestamp.now(),
            userID: user.uid,
            repliesTo: replyingToMessage ? messageBeingRepliedTo.id : null,
        }).catch((e) => {
            console.error('error while uploading message data to analytics: ', e)
        })

        await firestore()
            .collection('chat-rooms')
            .doc(globalVars.chatID)
            .collection('chat-messages')
            .add({
                msg: message,
                img: imageInfo,
                timeSent: firestore.Timestamp.now(),
                userID: user.uid,
                senderType: 'client',
                repliesTo: replyingToMessage ? messageBeingRepliedTo.id : null,
            })
            .catch((e) => {
                console.error("error while adding chat message: ", e)
                Alert.alert(
                    'Error sending message',
                    'There was an error while sending your message. Please try again.',
                )
                setSendingMessage(false)
                return null
            })

        // await firestore()
        //     .collection('chat-rooms')
        //     .doc(globalVars.chatID)
        //     .set({
        //         latestMessageTime: firestore.Timestamp.now(),
        //         latestMessage: message === '' ? '[Image]' : message,
        //         unreadCount: firestore.FieldValue.increment(1),
        //         latestMessageSender: user.uid,
        //         ungradedImageCount: imageInfo != null && imageInfo.length > 0 ? firestore.FieldValue.increment(imageInfo.length) : firestore.FieldValue.increment(0)
        //     }, { merge: true })
        //     .catch((e) => {
        //         console.error("error while updating chat room info: ", e)
        //     })

        setImages(null)
        setMessageInput('')
        setReplyingToMessage(false)
        setMessageBeingRepliedTo(null)
        setSendingMessage(false)

        let localDayStart = new Date()
        localDayStart.setHours(0)
        localDayStart.setMinutes(0)
        localDayStart.setSeconds(0)
        localDayStart.setMilliseconds(0)
        if (tempLastImageSent != null) {
            if (localDayStart > tempLastImageSent) {
                mixpanel.track('Streak Updated', { 'Streak': globalVars.userData.streak + 1 })
                navigation.navigate('Congrats', { congratsType: 'imageSent' })
                await firestore()
                    .collection('chat-rooms')
                    .doc(globalVars.chatID)
                    .collection('chat-messages')
                    .add({
                        msg: `Congratulations! You've just extended your streak to ${globalVars.userData.streak === 0 ? `1 day!` : `${globalVars.userData.streak + 1} days!`}`,
                        img: null,
                        timeSent: firestore.Timestamp.now(),
                        userID: globalVars.coachID,
                        msgType: 'streakCongrats',
                        streakDay: globalVars.userData.streak + 1,
                        senderType: 'non-client'
                    })
                    .catch((e) => {
                        console.error("error while adding chat streak message: ", e)
                    })

                // await firestore()
                //     .collection('chat-rooms')
                //     .doc(globalVars.chatID)
                //     .set({
                //         latestMessageTime: firestore.Timestamp.now(),
                //         latestMessage: `Congratulations! You've just extended your streak to ${globalVars.userData.streak === 0 ? `1 day!` : `${globalVars.userData.streak + 1} days!`}`,
                //         latestMessageSender: globalVars.coachID,
                //     }, { merge: true })
                //     .catch((e) => {
                //         console.error("error while updating chat room info: ", e)
                //     })
                updateInfo({
                    streak: firestore.FieldValue.increment(1),
                    streakUpdated: firestore.Timestamp.now()
                })
            }
        }
    }

    const imageUploader = async () => {
        const list = []
        // If you want to allow uploads without images...
        if (images == null) {
            return null
        }

        const checkImages = async () => {
            let totalSize = 0
            for (let item of images) {
                totalSize += item.fileSize
                const uploadURI = item.uri
                let fileName = uploadURI.substring(uploadURI.lastIndexOf('/') + 1)
                const extension = fileName.split('.').pop()
                if (extension === 'HEIC') {
                    Alert.alert(
                        'File type not supported',
                        'One or more of your images is of an unsupported (HEIC) file type. Please modify this file and try again.'
                    )
                    return false
                }
            }
            if (totalSize >= 1000000) {
                Alert.alert(
                    'Images too large',
                    'One or more of your images is too large. Please modify your image selection and try again.'
                )
                return false
            }
            return true
        }

        const imagesPassed = await checkImages()
        if (imagesPassed) {
            for (let item of images) {
                const uploadURI = item.uri
                let fileName = uploadURI.substring(uploadURI.lastIndexOf('/') + 1)
                let thumbnailName

                const extension = fileName.split('.').pop()
                const name = fileName.split('.').slice(0, -1).join('.')
                fileName = name + Date.now() + '.' + extension
                thumbnailName = fileName.split('.').slice(0, -1).join('.') + "_200x200." + extension

                const storageRef = storage().ref(`chat-pictures/${fileName}`)
                const task = storageRef.putFile(uploadURI)

                try {
                    await task

                    const url = await storageRef.getDownloadURL()

                    list.push({
                        url: url,
                        mime: item.mime,
                        // base64: item.base64,
                        thumbnail: thumbnailName,
                        graded: false,
                        uploadedAt: firestore.Timestamp.now()
                    })
                } catch (e) {
                    console.error('error while uploading images to firebase cloud storage: ', e)
                    await storageRef.delete()
                    Alert.alert(
                        'Error uploading images',
                        'There was an error while uploading your images. Please try again.',
                    )
                    return null
                }
            }
            return list
        } else {
            setSendingMessage(false)
            return null
        }
    }

    function updateUserToken(token) {
        updateInfo({ fcmToken: token, notificationsEnabled: true })
    }

    useEffect(() => {
        return messaging().onTokenRefresh(token => {
            updateUserToken(token)
        })
    }, [])

    useEffect(() => {
        const unsub = firestore()
            .collection('chat-rooms')
            .doc(globalVars.chatID)
            .collection('chat-messages')
            .orderBy('timeSent', 'desc')
            .limit(25 * messageBatches)
            .onSnapshot((snapshot) => {
                setMessages(snapshot.docs.map(doc => {
                    const data = doc.data()
                    const id = doc.id
                    return { id, ...data }
                }))
                if (loading) {
                    setTimeout(() => {
                        setLoading(false)
                    }, 2000)
                }
                if (snapshot.docs.length < 25 * messageBatches) {
                    setMessagesEndReached(true)
                }
            }, (e) => {
                console.error('error while fetching messages: ', e)
            })
        return () => unsub()
    }, [globalVars.chatID, messageBatches])

    useEffect(() => {
        if (globalVars.chatID != null) {
            let imageList = []
            return firestore()
                .collection('chat-rooms')
                .doc(globalVars.chatID)
                .collection('chat-messages')
                .where('userID', '==', user.uid)
                .orderBy('timeSent', 'desc')
                .onSnapshot((querySnapshot) => {
                    querySnapshot.docs.forEach((doc) => {
                        if (doc.data().img != null) {
                            for (let image of doc.data().img) {
                                imageList.push({ ...image, timeSent: doc.data().timeSent })
                            }
                        }
                    })
                    setGlobalVars(val => ({ ...val, images: imageList }))
                    if (globalVars.userData != null && !imgCountUpdated && globalVars.userData?.totalImageCount !== imageList.length) {
                        updateInfo({
                            totalImageCount: imageList.length
                        })
                        setUpdated(true)
                    }
                    imageList = []
                    if (loading) {
                        setLoading(false)
                    }
                }, (e) => {
                    console.error('error while fetching chat images: ', e)
                })
        }
    }, [globalVars.chatID])

    function sameDay(d1, d2) {
        if (d1?.getFullYear() != null && d2?.getFullYear() != null) {
            return d1.getFullYear() === d2.getFullYear() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getDate() === d2.getDate()
        }
    }

    function sevenDays(d1, d2) {
        return Math.abs(d1 - d2) <= 60 * 60 * 24 * 1000 * 7
    }

    const SevenDayAvg = () => {
        if (globalVars.images != null && globalVars.images?.length !== 0) {
            const mealGrades = globalVars.images?.filter(val => sevenDays(val.timeSent?.toDate(), new Date()) && val.graded)
            if (mealGrades.length === 0) {
                return '-'
            }
            let totals = { red: 0, yellow: 0, green: 0 }
            mealGrades.forEach((meal, index) => {
                totals.red += meal.red
                totals.yellow += meal.yellow
                totals.green += meal.green
            })
            return Math.round((((totals.green - totals.red) / (totals.green + totals.yellow + totals.red)) + 1) * 50)
        }
    }

    useEffect(() => {
        const unsub = firestore()
            .collection('chat-rooms')
            .where("userIDs", "array-contains", user.uid)
            .onSnapshot((querySnapshot) => {
                querySnapshot?.forEach((doc) => {
                    setGlobalVars(val => ({ ...val, chatID: doc.id }))
                    updateInfo({ chatID: doc.id })
                    let otherUser = ''
                    const { userIDs } = doc.data()
                    for (let otherUserID of userIDs) {
                        if (otherUserID !== user.uid) {
                            otherUser = otherUserID
                        }
                    }
                    firestore()
                        .collection('user-info')
                        .doc(otherUser)
                        .get()
                        .then((doc) => {
                            if (doc.exists) {
                                setGlobalVars(val => ({ ...val, coachData: doc.data(), coachID: doc.id }))
                                updateInfo({ coachID: doc.id })
                            }
                        })
                })
            })
        return () => unsub()
    }, [globalVars.userData?.coachID])

    const [isFirstLogin, setIsFirstLogin] = useState(false)

    useEffect(() => {
        AsyncStorage.getItem('alreadyLoggedIn').then((value) => {
            if (value == null) {
                AsyncStorage.mergeItem('alreadyLoggedIn', 'true')
                if (globalVars.newAccount === true || globalVars.newAccount == null) {
                    setIsFirstLogin(true)
                } else {
                    setIsFirstLogin(false)
                }
            } else {
                setIsFirstLogin(false)
            }
        })
    }, [])

    useEffect(() => {
        if (globalVars.userData) {
            checkUserMembership(globalVars.userData)
            if (!globalVars.userData.notificationsEnabled) {
                promptUserNotifications(globalVars.userData.dateJoined)
            }
        }
    }, [globalVars.userData])

    const promptUserNotifications = async (dateJoined) => {
        if (dateJoined && !globalVars.userData.notificationsEnabled) {
            const now = new Date()
            const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000))
            const tenDaysAgo = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000))
            const secondReminder = await AsyncStorage.getItem('@notifs_second_reminder')
            const thirdReminder = await AsyncStorage.getItem('@notifs_third_reminder')
            if (fiveDaysAgo > dateJoined && secondReminder == null) {
                navigation.navigate('Enable Notifs')
                AsyncStorage.setItem('@notifs_second_reminder', 'true')
            } else if (tenDaysAgo > dateJoined && secondReminder == 'true' && thirdReminder == null) {
                navigation.navigate('Enable Notifs')
                AsyncStorage.setItem('@notifs_third_reminder', 'true')
            }
        }
    }

    useEffect(() => {
        AsyncStorage.getItem('@notifs_enabled').then((value) => {
            if (isFirstLogin === null) {
                return null
            } else if (isFirstLogin == true && globalVars.notificationsEnabled == null && value == null) {
                Platform.OS === 'ios' ? navigation.navigate('Enable Notifs') : navigation.navigate('Welcome')
            } else if (!isFirstLogin) {
                setGlobalVars(val => ({ ...val, notificationsEnabled: JSON.parse(value) }))
            }
        })
    }, [isFirstLogin])

    const cancelImage = (img) => {
        var result = images.filter(function (ele) {
            return ele != img
        })
        setImages(result)
    }

    const giveExtraTrialDays = async () => {
        const joinDate = new Date(user.metadata.creationTime)
        const oneDay = 60 * 60 * 1000 * 24
        const daysSinceJoin = Math.floor((new Date() - joinDate) / oneDay)
        await AsyncStorage.setItem('extra_days', JSON.stringify(daysSinceJoin))
        setTrialPeriodFinished(false)
    }

    const openChatCameraPicker = async () => {
        setAttachingImage(val => ({ ...val, visible: true }))
        await analytics().logScreenView({
            screen_name: 'CameraModalChatButton',
            screen_class: 'CameraModalChatButton'
        })
        mixpanel.track('Screen View', { 'Screen': 'CameraModalChatButton' })
    }

    const handleStatSummaryPress = () => {
        mixpanel.track('Button Press', { 'Button': 'GalleryImage' })
        navigation.navigate('Main Menu', { screen: 'Your Stats' })
    }

    const handleLongPress = (item) => {
        // figure out how to decrease vibration time on iOS before doing this
        // Platform.OS === 'ios' ? 
        //     Vibration.vibrate() :
        //     Vibration.vibrate(100)
        // const msgIndex = messages.findIndex((message) => message.id === item.id)
        // msgIndex === -1 ? Alert.alert(
        //     'Message not found.'
        // ) : messagesList.current.scrollToIndex({ animated: true, index: msgIndex, viewOffset: item.msg != null && item.msg?.length > 0 ? 179 : 142 })
        setGlobalVars(val => ({ ...val, selectedMessage: item }))
        mixpanel.track('Button Press', { 'Button': 'LongPressChatMessage' })
    }

    const handleBadgePress = () => {
        mixpanel.track('Clicked Badge', { 'Screen': 'Coach' })
        navigation.navigate('Subscription', { trialReminder: 'none' })
    }

    const [replyingToMessage, setReplyingToMessage] = useState(false)
    const [messageBeingRepliedTo, setMessageBeingRepliedTo] = useState(null)
    const handleReply = (message) => {
        setMessageBeingRepliedTo(message)
        setReplyingToMessage(true)
        setGlobalVars(val => ({ ...val, selectedMessage: null }))
        messageInputRef.current.focus()
        mixpanel.track('Button Press', { 'Button': 'ReplyChatMessage' })
        console.log(message.msg)
    }

    const cancelReply = () => {
        setReplyingToMessage(false)
        setMessageBeingRepliedTo(null)
    }

    const scrollToOriginal = (item) => {
        const msgIndex = messages.findIndex((message) => message.id === item.repliesTo)
        msgIndex === -1 ? Alert.alert(
            'Message not found.'
        ) : messagesList.current.scrollToIndex({ animated: true, index: msgIndex, viewOffset: replyingToMessage ? 100 : 80 })
    }

    return (
        <>
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1 }}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' && 'position'}
                        keyboardVerticalOffset={45}
                        // contentContainerStyle={{ flex: 1 }}
                        enabled={Platform.OS === 'ios'}
                        style={{ flex: 1 }}
                    >
                        <FlatList
                            ref={messagesList}
                            onScroll={detectScrollPos}
                            onEndReached={!messagesEndReached && loadMoreMessages}
                            onEndReachedThreshold={0.1}
                            overScrollMode={'never'}
                            inverted
                            initialNumToRender={9}
                            keyboardDismissMode='on-drag'
                            ListEmptyComponent={(
                                loading ?
                                    <View>
                                        <Text style={{ position: 'absolute', bottom: 0, right: 20, color: "#BDB9DB" }}>loading messages...</Text>
                                        <ActivityIndicator style={{ position: 'absolute', bottom: 20, right: 20 }} size={35} color="#BDB9DB" />
                                    </View>
                                    : <View style={{ flex: 1, alignItems: 'center' }}>
                                        <Text style={{ color: "#BBBBC5" }}>You have no messages with this person.</Text>
                                    </View>
                            )}
                            ListHeaderComponent={(
                                <View style={{ margin: replyingToMessage ? 50 : 40 }} />
                            )}
                            ListFooterComponent={(
                                <View style={{ margin: 50 }} />
                            )}
                            contentContainerStyle={{ minHeight: '100%', zIndex: 69 }}
                            showsVerticalScrollIndicator={false}
                            data={messages}
                            renderItem={({ item }) => (
                                <ChatMessage 
                                    item={item} 
                                    handleLongPress={() => handleLongPress(item)}
                                    handleStatSummaryPress={handleStatSummaryPress}
                                    scrollToOriginal={() => scrollToOriginal(item)}
                                    SevenDayAvg={SevenDayAvg}
                                    outgoingMessage={item.userID === user.uid}
                                    user={user}
                                    navigation={navigation} 
                                    userCourseData={globalVars.userData?.courseData}
                                    courseInfo={CourseData.find(course => item.courseInfo?.UniqueCourseNumber === NaN || item.courseInfo?.UniqueCourseNumber == null ? globalVars.userData?.courseData?.latestCourseCompleted == null ? course.UniqueCourseNumber === 1 : course.UniqueCourseNumber === globalVars.userData?.courseData?.latestCourseCompleted + 1 : course.UniqueCourseNumber === item.courseInfo?.UniqueCourseNumber)}
                                    msgTimeText={item.timeSent == null ? moment(item.timeSent).calendar() : moment(item.timeSent.toDate()).calendar()}
                                    repliesToText={messages.find((message) => message.id === item.repliesTo)?.msg || '(Click to view)'}
                                />
                            )}
                            keyExtractor={(item) => item.id}
                            extraData={globalVars.selectedMessage}
                        />
                        <MotiView from={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 300 }} style={styles.sendMsgContainer}>
                            <View style={styles.addImgContainer} onLayout={(event) => {
                                const { x } = event.nativeEvent.layout
                                setScrollButtonLeft(x)
                            }}>
                                <TouchableOpacity onPress={openChatCameraPicker}>
                                    <Ionicons
                                        name="camera"
                                        size={30}
                                        color='#BDB9DB'
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.msgInputContainer}>
                                {replyingToMessage &&
                                    <TouchableOpacity style={{ padding: 5, justifyContent: 'center' }} onPress={() => { const msgIndex = messages.findIndex((message) => message.id === messageBeingRepliedTo.id); messagesList.current.scrollToIndex({ animated: true, index: msgIndex, viewOffset: 100 }) }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', maxWidth: '60%' }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#BDB9DB' }}>Replying to: </Text>
                                            <Text numberOfLines={1} ellipsizeMode={'tail'} style={{ fontSize: 14, color: '#BDB9DB' }}>{messageBeingRepliedTo.msg || '[Image]'}</Text>
                                        </View>
                                        {!sendingMessage && <TouchableOpacity style={[styles.cancelImage, { width: 20, height: 20, borderRadius: 10 }]} onPress={cancelReply}>
                                            <Icon
                                                name='ios-close'
                                                size={16}
                                                color='black'
                                            />
                                        </TouchableOpacity>}
                                    </TouchableOpacity>
                                }
                                {images?.length > 0 &&
                                    <FlatList
                                        horizontal={true}
                                        showsHorizontalScrollIndicator={true}
                                        overScrollMode={'never'}
                                        data={images}
                                        ListHeaderComponent={(
                                            <View style={{ margin: 5 }} />
                                        )}
                                        ListFooterComponent={(
                                            <View style={{ margin: 5 }} />
                                        )}
                                        renderItem={({ item }) => (
                                            <View key={item.uri} style={{ paddingHorizontal: 10, paddingVertical: 20 }}>
                                                <ImageBackground style={{ height: 200, width: 200 }} imageStyle={{ borderRadius: 10 }} source={{ uri: item.uri }}>
                                                    {!sendingMessage &&
                                                        <TouchableOpacity style={styles.cancelImage} onPress={() => cancelImage(item)}>
                                                            <Icon
                                                                name='ios-close'
                                                                size={20}
                                                                color='black'
                                                            />
                                                        </TouchableOpacity>
                                                    }
                                                </ImageBackground>
                                            </View>
                                        )}
                                        keyExtractor={(item) => item.uri}
                                    />
                                }
                                <View style={styles.msgInputWrapper}>
                                    <TextInput
                                        ref={messageInputRef}
                                        placeholder={!sendingMessage ? 'Write your message here...' : ''}
                                        placeholderTextColor={'#E6E7FA'}
                                        style={styles.msgInputText}
                                        value={messageInput}
                                        multiline={true}
                                        maxLength={2000}
                                        onChangeText={(text) => setMessageInput(text)}
                                        autoCapitalize="none"
                                        blurOnSubmit={false}
                                        numberOfLines={1}
                                        onSubmitEditing={() => {
                                            if (messageInput || images?.length > 0) {
                                                setSendingMessage(true)
                                                messages.length > 0 && scrollToLatest()
                                                newMessage(messageInput)
                                            }
                                        }}
                                        editable={!sendingMessage}
                                    />
                                    <AnimatePresence>
                                        {sendingMessage ?
                                            <MotiView key='loading' style={{ position: 'absolute', right: 15, bottom: 11.5 }} from={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 100 }}>
                                                <ActivityIndicator size={25} color="#4D43BD" />
                                            </MotiView> :
                                            !messageInput && (images?.length === 0 || !images) ?
                                                <MotiView key='weighin' from={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 100 }} style={{ position: 'absolute', right: 15, bottom: 12.5 }}>
                                                    {showWeighInButton && globalVars.userData.userBioData && <TouchableOpacity onPress={() => navigation.navigate('WeighInModal')}>
                                                        <MaterialCommunityIcons
                                                            name="scale-bathroom"
                                                            size={25}
                                                            color='#BDB9DB'
                                                        />
                                                    </TouchableOpacity>}
                                                </MotiView> :
                                                <MotiView key='text' from={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 100 }} style={{ position: 'absolute', right: 15, bottom: 11.5 }}>
                                                    <TouchableOpacity disabled={!messageInput && (images?.length === 0 || !images)} onPress={() => {
                                                        setSendingMessage(true)
                                                        messages.length > 0 && scrollToLatest()
                                                        newMessage(messageInput)
                                                    }}>
                                                        <Ionicons
                                                            name="send"
                                                            size={25}
                                                            color='#4D43BD'
                                                        />
                                                    </TouchableOpacity>
                                                </MotiView>
                                        }
                                    </AnimatePresence>
                                </View>
                            </View>
                        </MotiView>
                        <AnimatePresence>
                            {scrollToLatestButton && <MotiView from={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} style={[styles.scrollToLatestButton, { left: scrollButtonLeft + 5 }]}>
                                <TouchableOpacity onPress={() => scrollToLatest()}>
                                    <Ionicons
                                        name="ios-chevron-down"
                                        size={30}
                                        color='#BDB9DB'
                                    />
                                </TouchableOpacity>
                            </MotiView>}
                        </AnimatePresence>
                    </KeyboardAvoidingView>
                    <MotiView from={{ height: 0 }} animate={{ height: 180 }} delay={850} transition={{ type: 'timing' }} style={styles.scrollViewMask} />
                    <MotiView from={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} delay={500} style={styles.HUDWrapper}>
                        <View style={styles.headerWrapper}>
                            <TouchableOpacity style={{ position: 'absolute', top: 15, left: 15 }} onPress={globalVars.coachData ? () => navigation.navigate('Coach Profile') : null}>
                                <ProfilePic size={50} source={{ uri: globalVars.coachData?.photoURL }} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={globalVars.coachData ? () => navigation.navigate('Coach Profile') : null}>
                                <Text style={styles.displayName}>{globalVars.coachData?.displayName}</Text>
                            </TouchableOpacity>
                            {loading ? null :
                                <View>
                                    <Text style={styles.onlineStatus}>{online ? 'Online' : 'Offline'}</Text>
                                    <View style={[styles.statusIcon, { backgroundColor: online ? '#3DA560' : '#747F8D' }]} />
                                </View>
                            }
                            {!subscribed &&
                                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} delay={1200} transition={{ duration: 350 }} style={{ alignSelf: 'flex-end', justifyContent: 'flex-end' }}>
                                    <TouchableOpacity onPress={handleBadgePress} style={styles.subBadgeContainer}>
                                        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} delay={1700} transition={{ translateY: { type: 'timing', duration: 400, easing: Easing.bezier(.56, -0.01, 0, .98) }, opacity: { type: 'timing', delay: 1850 } }} style={{ justifyContent: 'center', alignItems: 'center', width: 50, height: 50 }} >
                                            <ImageBackground source={badge} style={{ width: 50, height: 50, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }} imageStyle={{ width: 50, height: 50, resizeMode: 'contain' }}>
                                                <MotiView from={{ translateX: 250, translateY: 250, rotateZ: '-45deg' }} animate={{ translateX: -250, translateY: -250, rotateZ: '-45deg' }} delay={3000} transition={{ loop: true, repeatReverse: false, duration: 5000, type: 'timing' }} style={{ opacity: 0.5, backgroundColor: '#fff', width: 100, height: 20, transform: [{ rotateZ: '-45deg' }] }} />
                                            </ImageBackground>
                                        </MotiView>
                                    </TouchableOpacity>
                                </MotiView>}
                        </View>
                    </MotiView>
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
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.panelTitle}>Choose Photos</Text>
                                <Text style={styles.panelSubtitle}>Take one photo, or choose up to five from camera roll.</Text>
                            </View>
                            <TouchableOpacity style={styles.panelButton} onPress={takePhotoFromCamera}>
                                <Text style={styles.panelButtonTitle}>Take Photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.panelButton} onPress={choosePhotosFromLibrary}>
                                <Text style={styles.panelButtonTitle}>Choose Photos From Library</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.panelButton}
                                onPress={() => setAttachingImage(val => ({ ...val, visible: false, loading: false }))}>
                                <Text style={styles.panelButtonTitle}>Cancel</Text>
                            </TouchableOpacity>
                            {attachingImage.loading ?
                                <View style={styles.modalLoading}>
                                    <ActivityIndicator size={35} color="#BDB9DB" />
                                </View>
                                : null}
                        </View>
                    </Modal>
                </View>
            </SafeAreaView>
            <AnimatePresence>
                {globalVars.selectedMessage &&
                    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, height: windowHeight, width: windowWidth, position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: 68 }}>
                        <BlurView
                            style={{ flex: 1, height: windowHeight, width: windowWidth, position: 'absolute', zIndex: 68 }}
                            blurType="dark"
                            blurAmount={10}
                            reducedTransparencyFallbackColor="white"
                            onTouchStart={() => setGlobalVars(val => ({ ...val, selectedMessage: null }))}
                        />
                        <ChatMessage
                            style={{ zIndex: 69, width: windowWidth }}
                            item={globalVars.selectedMessage}
                            handleLongPress={() => {}}
                            handleStatSummaryPress={() => {}}
                            scrollToOriginal={() => {}}
                            SevenDayAvg={SevenDayAvg}
                            outgoingMessage={globalVars.selectedMessage.userID === user.uid}
                            user={user}
                            navigation={navigation}
                            userCourseData={globalVars.userData?.courseData}
                            disablePress
                            disableItemReplyIndicator
                            courseInfo={CourseData.find(course => globalVars.selectedMessage.courseInfo?.UniqueCourseNumber === NaN || globalVars.selectedMessage.courseInfo?.UniqueCourseNumber == null ? globalVars.userData?.courseData?.latestCourseCompleted == null ? course.UniqueCourseNumber === 1 : course.UniqueCourseNumber === globalVars.userData?.courseData?.latestCourseCompleted + 1 : course.UniqueCourseNumber === globalVars.selectedMessage.courseInfo?.UniqueCourseNumber)}
                        />
                        <MessageOptions message={globalVars.selectedMessage} handleReply={(message) => handleReply(message)} style={{ zIndex: 69, alignSelf: globalVars.selectedMessage?.userID === user.uid ? 'flex-end' : 'flex-start', paddingHorizontal: 20 }} />
                    </MotiView>
                }
            </AnimatePresence>
            <AnimatePresence>
                {userFlagged || globalVars.userFlagged ?
                    <UserFlaggedScreen navigation={navigation} />
                    : trialPeriodFinished &&
                    <TrialPeriodFinishedScreen navigation={navigation} showExtraDaysButton={showExtraDaysButton} giveExtraTrialDays={giveExtraTrialDays} />
                }
            </AnimatePresence>
        </>
    )
}

export default Chat

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6E7FA',
    },
    outgoingMsg: {
        justifyContent: 'center',
        backgroundColor: '#202060',
        borderRadius: 10,
        padding: 10,
        alignItems: 'flex-end',
        paddingHorizontal: 15,
        margin: 20,
        marginVertical: 10,
        marginLeft: '20%',
    },
    outgoingMsgText: {
        fontSize: 14,
        color: '#fff',
    },
    incomingMsg: {
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        alignItems: 'flex-start',
        paddingHorizontal: 15,
        margin: 20,
        marginVertical: 10,
        marginRight: '20%',
    },
    incomingMsgText: {
        fontSize: 14,
        color: '#312A60',
    },
    textImage: {
        minHeight: windowWidth * 0.65,
        width: windowWidth * 0.65,
        marginVertical: 10,
    },
    sendMsgContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'flex-end',
        bottom: 20,
        width: '100%',
        minHeight: 50,
        position: 'absolute',
    },
    addImgContainer: {
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: 50,
        backgroundColor: '#fff',
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 5,
        shadowOpacity: 0.3,
    },
    msgInputContainer: {
        marginLeft: '5%',
        borderRadius: 10,
        justifyContent: 'center',
        width: windowWidth * 0.71,
        minHeight: 50,
        backgroundColor: 'white',
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 5,
        shadowOpacity: 0.3,
    },
    msgInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 50,
        paddingVertical: 10
    },
    msgInputText: {
        // position: 'absolute',
        color: '#686286',
        borderRadius: 10,
        // minHeight: 50,
        width: windowWidth * 0.56,
        paddingLeft: 20,
        borderWidth: 0,
        marginRight: 25,
        paddingTop: 0
    },
    msgTimeText: {
        fontSize: 12,
        color: '#BBBBC5',
        paddingHorizontal: 25,
        marginTop: -10,
        alignSelf: 'flex-end',
    },
    scrollViewMask: {
        position: 'absolute',
        top: -90,
        width: '100%',
        backgroundColor: '#E6E7FA'
    },
    HUDWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
        height: 130,
    },
    headerWrapper: {
        position: 'absolute',
        margin: 10,
        backgroundColor: '#fff',
        width: '100%',
        height: 80,
        elevation: 10,
        borderRadius: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 5,
        shadowOpacity: 0.3,
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    displayName: {
        position: 'absolute',
        top: 15,
        left: 75,
        fontSize: 22,
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        color: '#202060',
        width: windowWidth
    },
    onlineStatus: {
        position: 'absolute',
        top: 42,
        left: 75,
        fontSize: 16,
        color: '#BBBBC5',
    },
    statusIcon: {
        position: 'absolute',
        top: 50,
        left: 50,
        height: 14,
        width: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: '#747F8D',
    },
    headerIconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 15,
        right: 70,
        backgroundColor: '#fff',
        elevation: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 5,
        shadowOpacity: 0.3,
    },
    headerIconWrapperAlt: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        right: 0,
        width: 40,
        height: 40,
    },
    actionButtonWrapper: {
        alignItems: 'center',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        position: 'absolute',
        margin: -20,
        bottom: 0,
        height: 156,
        width: windowWidth,
        backgroundColor: '#4C44D4',
    },
    actionButton: {
        flexDirection: 'row',
        backgroundColor: '#4C44D4',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 50,
        width: windowWidth,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    actionButtonText: {
        color: '#D0D4FF',
        fontSize: 15,
        marginLeft: 15,
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
        height: 320
    },
    panelTitle: {
        fontSize: 27,
        height: 35,
        color: '#202060'
    },
    panelSubtitle: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'center',
        marginBottom: 10,
    },
    panelButton: {
        height: windowHeight / 17,
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#4C44D4',
        alignItems: 'center',
        marginVertical: 7,
    },
    panelButtonTitle: {
        fontSize: 17,
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        color: 'white',
        textAlign: 'center',
        width: '100%'
    },
    pieChartContainer: {
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 5,
        shadowOpacity: 0.4,
    },
    cancelImage: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(180,180,180,0.7)',
        position: 'absolute',
        top: 5,
        right: 5,
        width: 25,
        height: 25,
        borderRadius: 12.5
    },
    modalLoading: {
        position: 'absolute',
        width: windowWidth,
        height: 320,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: 'rgba(32,32,96,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    scrollToLatestButton: {
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 85,
        left: 27,
        height: 40,
        width: 40,
        backgroundColor: 'rgba(0,0,0,0.7)',
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 5,
        shadowOpacity: 0.3,
    },
    subBadgeContainer: {
        backgroundColor: '#fff',
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 5,
        shadowOpacity: 0.3,
        width: 60,
        height: 60,
        borderRadius: 10,
        top: 10,
        right: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
})

import React, { useState, useContext, useEffect, useRef } from 'react'
import { KeyboardAvoidingView, SafeAreaView, View, Text, StyleSheet, TouchableOpacity, TextInput, Image, FlatList, ActivityIndicator, ImageBackground, Alert, Platform, Keyboard, Linking } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Icon from 'react-native-vector-icons/Ionicons'
import Modal from 'react-native-modal'
import AsyncStorage from "@react-native-async-storage/async-storage"

import storage from '@react-native-firebase/storage'
import firestore from '@react-native-firebase/firestore'
import ImagePicker from 'react-native-image-crop-picker'
import { AuthContext } from '../navigation/AuthProvider'

import { windowWidth } from '../utils/Dimensions.js'
import moment from 'moment'
import messaging from '@react-native-firebase/messaging'
import analytics from '@react-native-firebase/analytics'
import ChatImage from '../components/ChatImage'
import ProfilePic from '../components/ProfilePic'
import { AnimatePresence, MotiView } from 'moti'

import CourseData from '../courses/CourseData.json'
import CourseLinkImage from '../components/CourseLinkImage'

const Chat = ({ navigation, route }) => {

    const { imageInfo } = route.params
    
    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            navigation.setParams({ imageInfo: null })
        })
        return unsubscribe
    }, [navigation])

    const { user, updateInfo, globalVars, setGlobalVars, requestPermission } = useContext(AuthContext)

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

    const messagesList = useRef()

    const scrollToLatest = () => { 
        messagesList && messagesList.current.scrollToIndex({ index: 0, viewOffset: 80 })
    }

    const loadMoreMessages = () => {
        !messagesEndReached && setMessageBatches(messageBatches + 1)
    }

    const detectScrollPos = (event) => {
        showScrollToLatestButton(event.nativeEvent.contentOffset.y > 1300)
    }

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
        }).then((i) => {
            setImages([{
                uri: i.path,
                width: i.width,
                height: i.height,
                mime: i.mime,
            }])
            setAttachingImage(val => ({ ...val, visible: false }))
            setAttachingImage(val => ({ ...val, loading: false }))
            setGlobalVars(val => ({ ...val, autoSend: true }))
        }).catch((e) => {
            console.log('error while taking photo: ', e.code)
            if (e.code === 'E_NO_CAMERA_PERMISSION') {
                Alert.alert(
                    'Access denied',
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
            forceJpg: true
        }).then((imageData) => {
            setImages(imageData.map((i) => {
                return {
                    uri: i.path,
                    width: i.width,
                    height: i.height,
                    mime: i.mime,
                };
            }))
            setAttachingImage(val => ({ ...val, visible: false }))
            setAttachingImage(val => ({ ...val, loading: false }))
        }).catch((e) => {
            console.log('error while choosing photos from library: ', e.code)
            if (e.code === 'E_NO_LIBRARY_PERMISSION') {
                Alert.alert(
                    'Access denied',
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

    useEffect(() => {
        if (user) {
            requestPermission()
            firestore()
                .collection('user-info')
                .doc(user.uid)
                .get()
                .then((userData) => {
                    setGlobalVars(val => ({ ...val, userData: userData.data() }))
                    const usr = userData.data()
                    if (usr.userBioData == null && globalVars.userBioData == null) {
                        navigation.replace('Onboarding Wizard')
                    }
                    if (usr.displayName == null || usr.photoURL == null) {
                        updateInfo({
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                        })
                    }
                    if (usr.chatID == null && globalVars.chatID != null) {
                        updateInfo({
                            chatID: globalVars.chatID
                        })
                    }
                })
        }
    }, [user])

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

    const newMessage = async (message) => {
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

        if (imageInfo != null) {
            if (imageInfo.length === 0) {
                imageInfo = null
                return null
            } else if (imageInfo.length > 0) {
                updateInfo({ 
                    lastImageSent: firestore.Timestamp.fromDate(new Date()),
                    totalImageCount: firestore.FieldValue.increment(imageInfo.length)
                })
                for (let image of imageInfo) {
                    await analytics().logEvent('image', {
                        img: image,
                        timeSent: firestore.Timestamp.fromDate(new Date()),
                        userID: user.uid,
                    }).catch((e) => {
                        console.log('error while uploading image data to analytics: ', e)
                    })
                }
            }
        }

        setSendingMessage(true)

        await analytics().logEvent('message', {
            msg: message,
            img: imageInfo,
            timeSent: firestore.Timestamp.fromDate(new Date()),
            userID: user.uid
        }).catch((e) => {
            console.log('error while uploading message data to analytics: ', e)
        })

        await firestore()
            .collection('chat-rooms')
            .doc(globalVars.chatID)
            .collection('chat-messages')
            .add({
                msg: message,
                img: imageInfo,
                timeSent: firestore.Timestamp.fromDate(new Date()),
                userID: user.uid,
            })
            .catch((e) => {
                console.log("firestore error: ", e)
            })

        await firestore()
            .collection('chat-rooms')
            .doc(globalVars.chatID)
            .set({ 
                latestMessageTime: firestore.Timestamp.fromDate(new Date()), 
                latestMessage: message === '' ? '[Image]' : message, 
                unreadCount: firestore.FieldValue.increment(1),
                latestMessageSender: user.uid,
                ungradedImageCount: imageInfo != null && imageInfo.length > 0 ? firestore.FieldValue.increment(1) : firestore.FieldValue.increment(0)
            }, { merge: true })
            .catch((e) => {
                console.log("latest message log: ", e)
            })

        setImages(null)
        setMessageInput('')
        setSendingMessage(false)
    }

    const imageUploader = async () => {
        const list = []
        // If you want to allow uploads without images...
        if (images == null) {
            return null
        }

        const checkImages = async () => {
            for (let item of images) {
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
                        thumbnail: thumbnailName,
                        graded: false,
                        uploadedAt: firestore.Timestamp.fromDate(new Date())
                    })
                } catch (e) {
                    console.log('error while uploading images to firebase cloud storage: ', e)
                    return null
                }
            }
            return list
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
                console.log('error while fetching messages: ', e)
            })
        return () => unsub()
    }, [globalVars.chatID, messageBatches])

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
    }, [])

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
        if (isFirstLogin && globalVars.notificationsEnabled != null && globalVars.coachID != null) {
            if (messages.length > 0) {
                AsyncStorage.setItem('@tutorial_finished', 'true')
                AsyncStorage.setItem('@tutorial_started', 'true')
            } else {
                AsyncStorage.setItem('@tutorial_started', 'true')
                firestore()
                    .collection('chat-rooms')
                    .doc(globalVars.chatID)
                    .collection('chat-messages')
                    .add({
                        img: null,
                        msg: user.displayName == null ? 'Hey there, and welcome to DietPeeps! 🙂' : `Hi ${user.displayName}, and welcome to DietPeeps! 🙂`,
                        userID: globalVars.coachID,
                        timeSent: firestore.Timestamp.fromDate(new Date())
                    })
                setTimeout(() => {
                    firestore()
                        .collection('chat-rooms')
                        .doc(globalVars.chatID)
                        .collection('chat-messages')
                        .add({
                            img: null,
                            msg: `My name is ${globalVars.coachData?.displayName}, and I'll be your personal coach. My goal is to help you succeed by making small steps every single day.`,
                            userID: globalVars.coachID,
                            timeSent: firestore.Timestamp.fromDate(new Date())
                        })
                }, 3000)
                setTimeout(() => {
                    firestore()
                        .collection('chat-rooms')
                        .doc(globalVars.chatID)
                        .collection('chat-messages')
                        .add({
                            img: null,
                            msg: `To do this, you'll need to send me a photo of every meal that you eat.`,
                            userID: globalVars.coachID,
                            timeSent: firestore.Timestamp.fromDate(new Date())
                        })
                }, 8000)
                setTimeout(() => {
                    firestore()
                        .collection('chat-rooms')
                        .doc(globalVars.chatID)
                        .collection('chat-messages')
                        .add({
                            img: null,
                            msg: `My job as coach is to look at these photos and score them based on how healthy they are.`,
                            userID: globalVars.coachID,
                            timeSent: firestore.Timestamp.fromDate(new Date())
                        })
                }, 13000)
                setTimeout(() => {
                    firestore()
                        .collection('chat-rooms')
                        .doc(globalVars.chatID)
                        .collection('chat-messages')
                        .add({
                            img: null,
                            msg: `First, a couple of questions for you: `,
                            userID: globalVars.coachID,
                            timeSent: firestore.Timestamp.fromDate(new Date())
                        })
                }, 17000)
                setTimeout(() => {
                    firestore()
                        .collection('chat-rooms')
                        .doc(globalVars.chatID)
                        .collection('chat-messages')
                        .add({
                            img: null,
                            msg: `1) Do you have a nickname that you prefer?`,
                            userID: globalVars.coachID,
                            timeSent: firestore.Timestamp.fromDate(new Date())
                        })
                }, 20000)
                setTimeout(() => {
                    AsyncStorage.setItem('@tutorial_finished', 'true')
                    firestore()
                        .collection('chat-rooms')
                        .doc(globalVars.chatID)
                        .collection('chat-messages')
                        .add({
                            img: null,
                            msg: `2) Any questions for me so far?`,
                            userID: globalVars.coachID,
                            timeSent: firestore.Timestamp.fromDate(new Date())
                        })
                }, 23000)
            }
        }
    }, [isFirstLogin, globalVars.notificationsEnabled, globalVars.coachID])

    useEffect(() => {
        const checkTutorial = async () => {
            let started = await AsyncStorage.getItem('@tutorial_started')
            let finished = await AsyncStorage.getItem('@tutorial_finished')
            if (JSON.parse(started) && !JSON.parse(finished) && globalVars.chatID != null && globalVars.coachID != null) {
                await firestore()
                    .collection('chat-rooms')
                    .doc(globalVars.chatID)
                    .collection('chat-messages')
                    .get()
                    .then((querySnapshot) => {
                        const batch = firestore().batch()
                        querySnapshot.forEach((doc) => {
                            batch.delete(doc.ref)
                        })
                        batch.commit()
                    })
                firestore()
                    .collection('chat-rooms')
                    .doc(globalVars.chatID)
                    .collection('chat-messages')
                    .add({
                        img: null,
                        msg: user.displayName == null ? 'Hey there, and welcome to DietPeeps! 🙂' : `Hi ${user.displayName}, and welcome to DietPeeps! 🙂`,
                        userID: globalVars.coachID,
                        timeSent: firestore.Timestamp.fromDate(new Date())
                    })
                firestore()
                    .collection('chat-rooms')
                    .doc(globalVars.chatID)
                    .collection('chat-messages')
                    .add({
                        img: null,
                        msg: `My name is ${globalVars.coachData?.displayName}, and I'll be your personal coach. My goal is to help you succeed by making small steps every single day.`,
                        userID: globalVars.coachID,
                        timeSent: firestore.Timestamp.fromDate(new Date())
                    })
                firestore()
                    .collection('chat-rooms')
                    .doc(globalVars.chatID)
                    .collection('chat-messages')
                    .add({
                        img: null,
                        msg: `To do this, you'll need to send me a photo of every meal that you eat.`,
                        userID: globalVars.coachID,
                        timeSent: firestore.Timestamp.fromDate(new Date())
                    })
                firestore()
                    .collection('chat-rooms')
                    .doc(globalVars.chatID)
                    .collection('chat-messages')
                    .add({
                        img: null,
                        msg: `My job as coach is to look at these photos and score them based on how healthy they are.`,
                        userID: globalVars.coachID,
                        timeSent: firestore.Timestamp.fromDate(new Date())
                    })
                firestore()
                    .collection('chat-rooms')
                    .doc(globalVars.chatID)
                    .collection('chat-messages')
                    .add({
                        img: null,
                        msg: `First, a couple of questions for you: `,
                        userID: globalVars.coachID,
                        timeSent: firestore.Timestamp.fromDate(new Date())
                    })
                firestore()
                    .collection('chat-rooms')
                    .doc(globalVars.chatID)
                    .collection('chat-messages')
                    .add({
                        img: null,
                        msg: `1) Do you have a nickname that you prefer?`,
                        userID: globalVars.coachID,
                        timeSent: firestore.Timestamp.fromDate(new Date())
                    })
                firestore()
                    .collection('chat-rooms')
                    .doc(globalVars.chatID)
                    .collection('chat-messages')
                    .add({
                        img: null,
                        msg: `2) Any questions for me so far?`,
                        userID: globalVars.coachID,
                        timeSent: firestore.Timestamp.fromDate(new Date())
                    })
                AsyncStorage.setItem('@tutorial_finished', 'true')
            }
        }

        return () => checkTutorial()
    }, [globalVars.chatID])

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

    return (
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
                            <View style={{ margin: 40 }} />
                        )}
                        ListFooterComponent={(
                            <View style={{ margin: 50 }} />
                        )}
                        showsVerticalScrollIndicator={false}
                        data={messages}
                        renderItem={({ item }) => (
                            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} key={item.timeSent} style={{ alignItems: item.userID === user.uid ? 'flex-end' : 'flex-start' }}>
                                <View style={item.userID === user.uid ? styles.outgoingMsg : styles.incomingMsg}>
                                    {item.img != null &&
                                        item.img.map((i) => (
                                            <ChatImage key={i.url} user={user} item={item} i={i} navigation={navigation} />
                                        ))
                                    }
                                    {item.msgType === 'courseLink' && 
                                        <CourseLinkImage key={item.id} user={user} messageData={item} userCourseData={globalVars.userData?.courseData} courseInfo={CourseData.find(course => course.UniqueCourseNumber === item.courseInfo.UniqueCourseNumber)} navigation={navigation} />
                                    }
                                    <Text selectable style={item.userID === user.uid ? styles.outgoingMsgText : styles.incomingMsgText}>{item.msg}</Text>
                                </View>
                                <Text style={[styles.msgTimeText, { alignSelf: item.userID === user.uid ? 'flex-end' : 'flex-start' }]}>
                                    {item.timeSent == undefined ? moment(item.timeSent).calendar() : moment(item.timeSent.toDate()).calendar()}
                                </Text>
                            </MotiView>
                        )}
                        keyExtractor={(item) => item.id}
                    />
                    <MotiView from={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 300 }} style={styles.sendMsgContainer}>
                        <View style={styles.addImgContainer} onLayout={(event) => {
                            const { x } = event.nativeEvent.layout
                            setScrollButtonLeft(x)
                        }}>
                            <TouchableOpacity onPress={() => setAttachingImage(val => ({ ...val, visible: true }))}>
                                <Ionicons
                                    name="camera"
                                    size={30}
                                    color='#BDB9DB'
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.msgInputContainer}>
                            {images === [] ? null :
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
                                                {sendingMessage ? null :
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
                                    placeholder='Write your message here...'
                                    placeholderTextColor={'#E6E7FA'}
                                    style={styles.msgInputText}
                                    value={messageInput}
                                    maxLength={1000}
                                    onChangeText={(text) => setMessageInput(text)}
                                    autoCapitalize="none"
                                    blurOnSubmit={false}
                                    numberOfLines={1}
                                    onSubmitEditing={() => {
                                        if (messageInput || images?.length > 0) {
                                            setSendingMessage(true)
                                            scrollToLatest()
                                            newMessage(messageInput)
                                        }
                                    }}
                                />
                                <AnimatePresence>
                                {sendingMessage ?
                                <MotiView key='loading' style={{ position: 'absolute', right: 15, top: 2 }} from={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 100 }}>
                                    <ActivityIndicator size={25} color="#4D43BD" />
                                </MotiView> :
                                    !messageInput && (images?.length === 0 || !images ) ? 
                                    <MotiView key='emoji' from={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 100 }} style={{ position: 'absolute', right: 15, top: 2 }}>
                                        {/* <TouchableOpacity onPress={() => {}}>
                                            <Ionicons
                                                name="happy"
                                                size={25}
                                                color='#BDB9DB'
                                            />
                                        </TouchableOpacity> */}
                                    </MotiView> :
                                    <MotiView key='text' from={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 100 }} style={{ position: 'absolute', right: 15, top: 2 }}>
                                        <TouchableOpacity disabled={!messageInput && (images?.length === 0 || !images )} onPress={() => {setSendingMessage(true); scrollToLatest(); newMessage(messageInput)}}>
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
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    msgInputText: {
        position: 'absolute',
        color: '#686286',
        borderRadius: 10,
        minHeight: 50,
        width: windowWidth * 0.56,
        paddingLeft: 20,
        borderWidth: 0,
        marginRight: 25,
        bottom: 0
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
        fontWeight: 'bold',
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
        padding: 13,
        borderRadius: 10,
        backgroundColor: '#4C44D4',
        alignItems: 'center',
        marginVertical: 7,
    },
    panelButtonTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white',
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
    }
})

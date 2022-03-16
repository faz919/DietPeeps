import React, { useContext, useEffect, useState, useRef } from 'react'
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, SafeAreaView, Image, Platform } from 'react-native'
import { AuthContext } from '../navigation/AuthProvider'
import { windowWidth, windowHeight } from '../utils/Dimensions'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Chart, Line, Area, HorizontalAxis, VerticalAxis, Tooltip } from 'react-native-responsive-linechart'
import firestore from '@react-native-firebase/firestore'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ProfilePic from '../components/ProfilePic'

const Stats = ({ navigation }) => {

    const { updateInfo, user, globalVars, setGlobalVars } = useContext(AuthContext)

    const [userInfo, setUserInfo] = useState({})
    const [loading, setLoading] = useState(true)

    const imageFilter = globalVars.images?.filter(image => image.graded === true)
    const insets = useSafeAreaInsets()

    // double view trick
    const scrolling = useRef(new Animated.Value(0)).current;
    const translation = scrolling.interpolate({
        inputRange: [0, windowHeight],
        outputRange: [0, -windowHeight],
        extrapolate: 'clamp',
    })

    useEffect(() => {
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
                        Array.prototype.push.apply(imageList, doc.data().img)
                    }
                })
                console.log('snapshot received at: ', new Date())
                setGlobalVars(val => ({ ...val, images: imageList }))
                imageList = []
                if (loading) {
                    setLoading(false)
                }
            }, (e) => {
                console.log('error while fetching chat images: ', e)
            })
    }, [])

    useEffect(() => {
        const checkStreak = async () => {
            await firestore()
                .collection("user-info")
                .doc(user.uid)
                .get()
                .then((doc) => {
                    let now = new Date()
                    let lastImage = doc.data().lastImageSent?.toDate()
                    let streakUpdated = doc.data().streakUpdated?.toDate()
                    const oneDay = 60 * 60 * 24 * 1000
                    if (now - streakUpdated > oneDay) {
                        if (now - lastImage <= oneDay) {
                            updateInfo({
                                streak: firestore.FieldValue.increment(1),
                                streakUpdated: firestore.Timestamp.fromDate(new Date())
                            })
                        } else if (now - lastImage > oneDay) {
                            updateInfo({
                                streak: 0,
                                streakUpdated: firestore.Timestamp.fromDate(new Date())
                            })
                        }
                    }
                })
                .catch((e) => {
                    console.log('error while checking streak: ', e)
                })
        }
        return () => checkStreak()
    }, [])

    useEffect(() => {
        firestore()
            .collection('user-info')
            .doc(user.uid)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    return setUserInfo(doc.data())
                }
            })
    }, [])

    const tempPfp = () => {
        if (user.providerData[0].providerId === "apple.com") {
            return `https://avatars.dicebear.com/api/bottts/${user.displayName.substring(user.displayName.indexOf(" ") + 1)}.png?dataUri=true`
        } else {
            return `https://avatars.dicebear.com/api/bottts/${user.displayName}.png?dataUri=true`
        }
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#E6E7FA'}}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{top: 80}}>
            {loading ? 
                <View style={{ flex: 1, width: windowWidth, height: windowHeight, backgroundColor: '#E6E7FA' }}>
                    <ActivityIndicator style={{ alignSelf: 'center', top: 100 }} size={35} color="#202060" />
                </View>: 
                <View>
                    {imageFilter.length === 0 ?
                        <>
                            <View style={{ opacity: 0.3 }} pointerEvents='none'>
                                <Chart
                                    style={{ height: windowHeight * 0.3, width: windowWidth }}
                                    data={[{ x: -2, y: 15 },
                                    { x: -1, y: 10 },
                                    { x: 0, y: 12 },
                                    { x: 1, y: 7 },
                                    { x: 2, y: 6 },
                                    { x: 3, y: 3 },
                                    { x: 4, y: 5 },
                                    { x: 5, y: 8 },
                                    { x: 6, y: 12 },
                                    { x: 7, y: 14 },
                                    { x: 8, y: 12 },
                                    { x: 9, y: 13.5 },
                                    { x: 10, y: 18 },]}
                                    padding={{ left: 25, bottom: 20, right: 15, top: 20 }}
                                    xDomain={{ min: 0, max: 10 }}
                                    yDomain={{ min: 0, max: 20 }}
                                >
                                    <VerticalAxis tickCount={11} />
                                    <HorizontalAxis tickCount={11} />
                                    <Area smoothing='cubic-spline'
                                        tension={0.3}
                                        theme={{
                                            gradient: {
                                                from: { color: '#3ead2d' },
                                                to: { color: '#fff', opacity: 0.4 }
                                            }
                                        }} />
                                    <Line smoothing='cubic-spline'
                                        tension={0.3}
                                        theme={{
                                            stroke: { color: '#3ead2d', width: 3 },
                                            scatter: {
                                                default: { width: 10, height: 10, rx: 7.5, color: '#fff' },
                                                selected: { width: 20, height: 20, rx: 12.5, color: '#fff' }
                                            }
                                        }}
                                        tooltipComponent={<Tooltip />} />
                                </Chart>
                            </View>
                            <Text style={{ position: 'absolute', fontSize: 26, alignSelf: 'center', top: windowHeight * 0.14, color: '#202060' }}>
                                {'No graded photo data'}
                            </Text>
                            <Text style={{ position: 'absolute', fontSize: 18, alignSelf: 'center', top: windowHeight * 0.14 + 30, color: '#202060' }}>
                                {'Send in your first photo today!'}
                            </Text>
                        </> :
                        <Chart
                            style={{ height: windowHeight * 0.35, width: windowWidth * 0.95, alignSelf: 'center' }}
                            data={imageFilter.reverse().map((value, index) => {
                                return { x: index + 1, y: value.grade == null ? 0 : value.grade  }
                            })}
                            padding={{ left: 30, bottom: 30, right: 30, top: 40 }}
                            xDomain={{ min: 1, max: imageFilter.length }}
                            yDomain={{ min: 0, max: 100 }}
                            viewport={{ size: { width: imageFilter.length >= 6 ? 6 : imageFilter.length <= 1 ? 1 : imageFilter.length - 1 } }}
                        >
                            <VerticalAxis tickCount={11} />
                            <HorizontalAxis tickCount={imageFilter.length} />
                            <Area smoothing='cubic-spline'
                                tension={0.3}
                                theme={{
                                    gradient: {
                                        from: { color: '#3ead2d' },
                                        to: { color: '#fff', opacity: 0.4 }
                                    }
                                }} />
                            <Line smoothing='cubic-spline'
                                tension={0.3}
                                theme={{
                                    stroke: { color: '#3ead2d', width: 3 },
                                    scatter: {
                                        default: { width: 10, height: 10, rx: 7.5, color: '#fff' },
                                        selected: { width: 20, height: 20, rx: 12.5, color: '#fff' }
                                    }
                                }}
                                tooltipComponent={<Tooltip />} />
                        </Chart>}
                    <Text style={{ fontSize: 26, color: '#202060', marginLeft: 25 }}>
                        Current Streak: {userInfo.streak} {userInfo.streak !== 1 ? 'days' : 'day'}
                    </Text>
                </View>
            }
            </ScrollView>
            <View style={[styles.HUDWrapper, { top: Platform.OS === 'ios' ? insets.top : 0}]}>
                <View style={styles.headerWrapper}>
                    <TouchableOpacity style={{ left: 15 }} onPress={() => navigation.navigate('User Profile')}>
                        <ProfilePic size={50} source={{ uri: user.photoURL == null ? tempPfp() : user.photoURL }} />
                    </TouchableOpacity>
                    <Text style={styles.displayName}>{user.displayName}</Text>
                    <TouchableOpacity onPress={() => { navigation.navigate('Settings') }} style={[styles.headerIconWrapperAlt, { top: 20, right: 15 }]}>
                        <Ionicons
                            name='ios-settings-outline'
                            size={30}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    Textp6: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 24,
        letterSpacing: 0,
        lineHeight: 34,
        marginTop: 10,
    },
    HUDWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
        height: 80,
        width: windowWidth,
        backgroundColor: '#e6e7fa',
    },
    headerWrapper: {
        position: 'absolute',
        margin: 10,
        backgroundColor: '#e6e7fa',
        width: '100%',
        height: 80,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center'
        // elevation: 10,
        // shadowColor: '#000000',
        // shadowOffset: { width: 0, height: 10 },
        // shadowRadius: 5,
        // shadowOpacity: 0.3,
    },
    displayName: {
        left: 25,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#202060',
        width: windowWidth 
    },
    onlineStatus: {
        position: 'absolute',
        top: 42,
        left: 70,
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
})

export default Stats 
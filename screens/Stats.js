import React, { useContext, useEffect, useState, useRef } from 'react'
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, SafeAreaView, Image, Platform } from 'react-native'
import { AuthContext } from '../navigation/AuthProvider'
import { windowWidth, windowHeight } from '../utils/Dimensions'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Chart, Line, Area, HorizontalAxis, VerticalAxis, Tooltip } from 'react-native-responsive-linechart'
import firestore from '@react-native-firebase/firestore'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ProfilePic from '../components/ProfilePic'
import { Calendar } from 'react-native-calendars'
import moment from 'moment'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { AnimatePresence, MotiView } from 'moti'

const Stats = ({ navigation }) => {

    const { updateInfo, user, globalVars, setGlobalVars } = useContext(AuthContext)

    const [userInfo, setUserInfo] = useState({})
    const [loading, setLoading] = useState(true)
    const [calendarInfoIcon, setCalendarInfoIcon] = useState()
    const [calendarInfoModal, setShowCalendarInfo] = useState(false)

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
                        for (let image of doc.data().img) {
                            imageList.push({ ...image, timeSent: doc.data().timeSent })
                        }
                        // Array.prototype.push.apply(imageList, doc.data().img)
                    }
                })
                console.log('snapshot received at: ', new Date())
                setGlobalVars(val => ({ ...val, images: imageList }))
                imageList = []
                if (loading) {
                    setLoading(false)
                }
            }, (e) => {
                console.error('error while fetching chat images: ', e)
            })
    }, [])

    useEffect(() => {
        firestore()
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
                console.error('error while checking streak: ', e)
            })
    }, [])

    // useEffect(() => {
    //     firestore()
    //         .collection('user-info')
    //         .doc(user.uid)
    //         .get()
    //         .then((doc) => {
    //             if (doc.exists) {
    //                 return setUserInfo(doc.data())
    //             }
    //         })
    // }, [])

    const tempPfp = () => {
        if (user.providerData[0].providerId === "apple.com") {
            return `https://avatars.dicebear.com/api/bottts/${user.displayName.substring(user.displayName.indexOf(" ") + 1)}.png?dataUri=true`
        } else {
            return `https://avatars.dicebear.com/api/bottts/${user.displayName}.png?dataUri=true`
        }
    }

    function sameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
    }

    function sevenDays(d1, d2) {
        return Math.abs(d1 - d2) <= 60 * 60 * 24 * 1000 * 7
    }

    function thirtyDays(d1, d2) {
        return Math.abs(d1 - d2) <= 60 * 60 * 24 * 1000 * 30
    }

    let streakCalendarDays = {}
    let graphDays = []
    let SevenDayAvg = 0, ThirtyDayAvg = 0
    globalVars.images && globalVars.images?.forEach((v, index) => { 
        let dayColor = ''
        switch (globalVars.images?.filter(val => sameDay(val.timeSent?.toDate(), globalVars.images[index]?.timeSent?.toDate())).length) {
            case 1:
                dayColor = '#c1efc0'
                break
            case 2:
                dayColor = '#81de7e'
                break
            default:
                dayColor = '#43CD3F'
                break
        }
        streakCalendarDays[moment(v.timeSent?.toDate()).format('YYYY[-]MM[-]DD')] = { startingDay: true, endingDay: true, color: dayColor } 

        if (graphDays.length === 0 || graphDays.filter(val => sameDay(val?.toDate(), globalVars.images[index]?.timeSent?.toDate())).length === 0) {
            if (v.graded) {
                graphDays.push(v.timeSent)
            }
        }
    })

    SevenDayAvg = graphDays.map((day, index) => {
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
    })

    ThirtyDayAvg = graphDays.map((day, index) => {
        const mealGrades = globalVars.images?.filter(val => thirtyDays(val.timeSent?.toDate(), new Date()) && val.graded)
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
    })

    // imageFilter.reverse().map((value, index) => {
    //     return { x: index + 1, y: value.grade == null ? 0 : value.grade  }
    // })
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#E6E7FA'}}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ top: 80 }}>
            {loading ? 
                <View style={{ flex: 1, width: windowWidth, height: windowHeight, backgroundColor: '#E6E7FA' }}>
                    <ActivityIndicator style={{ alignSelf: 'center', top: 100 }} size={35} color="#202060" />
                </View>: 
                <View>
                    <View style={{ backgroundColor: '#fff', borderRadius: 20, width: windowWidth - 30, height: windowHeight / 8, marginTop: 20, alignSelf: 'center', alignItems: 'center', justifyContent: 'space-around', flexDirection: 'row' }}>
                        <View style={{ backgroundColor: '#BDB9DB', borderRadius: 20, width: windowHeight / 10, height: windowHeight / 10, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: windowWidth / 10, color: '#202060' }}>{globalVars.userData?.streak}</Text>
                            <Text style={{ fontWeight: 'bold', fontSize: windowWidth / 30, color: '#202060', textAlign: 'center' }}>Streak</Text>
                        </View>
                        <View style={{ backgroundColor: '#BDB9DB', borderRadius: 20, width: windowHeight / 10, height: windowHeight / 10, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: windowWidth / 10, color: '#202060' }}>{SevenDayAvg}</Text>
                            <Text style={{ fontWeight: 'bold', fontSize: windowWidth / 30, color: '#202060', textAlign: 'center' }}>7 Day Avg</Text>
                        </View>
                        <View style={{ backgroundColor: '#BDB9DB', borderRadius: 20, width: windowHeight / 10, height: windowHeight / 10, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: windowWidth / 10, color: '#202060' }}>{ThirtyDayAvg}</Text>
                            <Text style={{ fontWeight: 'bold', fontSize: windowWidth / 30, color: '#202060', textAlign: 'center' }}>30 Day Avg</Text>
                        </View>
                    </View>
                    <Text style={{ fontSize: 26, color: '#202060', fontWeight: 'bold', alignSelf: 'center', marginTop: 20 }}>
                        Daily Scores
                    </Text>
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
                                                from: { color: '#43CD3F' },
                                                to: { color: '#fff', opacity: 0.4 }
                                            }
                                        }} />
                                    <Line smoothing='cubic-spline'
                                        tension={0.3}
                                        theme={{
                                            stroke: { color: '#43CD3F', width: 3 },
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
                            data={graphDays.reverse().map((day, index) => {
                                const mealGrades = globalVars.images?.filter(val => sameDay(val.timeSent.toDate(), day?.toDate()) && val.graded)
                                let totals = { red: 0, yellow: 0, green: 0 }
                                mealGrades.forEach((meal, index) => {
                                    totals.red += meal.red
                                    totals.yellow += meal.yellow
                                    totals.green += meal.green
                                })
                                return { y: Math.round((((totals.green - totals.red) / (totals.green + totals.yellow + totals.red)) + 1) * 50), x: index + 1 }
                            })}
                            padding={{ left: 30, bottom: 30, right: 30, top: 40 }}
                            xDomain={{ min: 1, max: graphDays.length <= 1 ? 2 : graphDays.length }}
                            yDomain={{ min: 0, max: 100 }}
                            viewport={{ size: { width: graphDays.length >= 6 ? 6 : graphDays.length <= 1 ? 1 : graphDays.length - 1 } }}
                        >
                            <VerticalAxis tickCount={11} />
                            <HorizontalAxis tickCount={graphDays.length <= 1 ? 2 : graphDays.length} />
                            <Area smoothing='cubic-spline'
                                tension={0.3}
                                theme={{
                                    gradient: {
                                        from: { color: '#43CD3F' },
                                        to: { color: '#fff', opacity: 0.4 }
                                    }
                                }} />
                            <Line smoothing='cubic-spline'
                                tension={0.3}
                                theme={{
                                    stroke: { color: '#43CD3F', width: 3 },
                                    scatter: {
                                        default: { width: 10, height: 10, rx: 7.5, color: '#fff' },
                                        selected: { width: 20, height: 20, rx: 12.5, color: '#fff' }
                                    }
                                }}
                                tooltipComponent={<Tooltip />} />
                        </Chart>}
                    <Text onLayout={(event) => { const { y } = event.nativeEvent.layout; setCalendarInfoIcon(y) }} style={{ fontSize: 26, color: '#202060', fontWeight: 'bold', alignSelf: 'center' }}>
                        Meal Photo Calendar
                    </Text>
                    <Calendar
                        minDate={user.metadata.creationTime}
                        maxDate={(new Date()).toDateString()}
                        hideExtraDays
                        showSixWeeks={false}
                        style={{ 
                            backgroundColor: 'transparent',
                            height: windowHeight * (450 / 844)
                        }}
                        markingType={'period'}
                        markedDates={streakCalendarDays}
                        theme={{ 
                            backgroundColor: 'transparent', 
                            calendarBackground: 'transparent',
                            textMonthFontWeight: 'bold',
                            arrowColor: '#4D43BD',
                            monthTextColor: '#202060',
                            textSectionTitleColor: '#BDB9DB',
                            textSectionTitleDisabledColor: '#BDB9DB',
                            textDisabledColor: '#BDB9DB',
                            indicatorColor: '#202060',
                            selectedDayTextColor: '#202060',
                            todayTextColor: '#202060',
                            selectedDayBackgroundColor: '#BDB9DB',
                            dayTextColor: '#202060'
                        }}
                    />
                    <View style={{position: 'absolute', top: calendarInfoIcon ? calendarInfoIcon + 2 : 2, right: 15}}>
                        <TouchableOpacity style={{position: 'absolute', top: 0, right: 0}} onPress={() => setShowCalendarInfo(true)}>
                            <MaterialCommunityIcons
                                name="information-outline"
                                size={28}
                                color="#202060"
                            />
                        </TouchableOpacity>
                        <AnimatePresence>
                            {calendarInfoModal &&
                                <MotiView
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 250 }}
                                    style={styles.explanationModal}
                                >
                                    <TouchableOpacity activeOpacity={1} onPress={() => setShowCalendarInfo(false)}>
                                        {/* <TouchableOpacity style={styles.cancelImage}>
                                                            <Icon
                                                                name='ios-close'
                                                                size={20}
                                                                color='black'
                                                            />
                                                        </TouchableOpacity> */}
                                        <Text adjustsFontSizeToFit={true} style={{ color: '#202060' }}>{'This calendar displays the number of photos sent on each day.'}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
                                            <View style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: '#c1efc0' }} />
                                            <Text style={{ color: '#202060', textAlign: 'right', maxWidth: '75%' }}>
                                                Indicates 1 meal photo was sent
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
                                            <View style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: '#81de7e' }} />
                                            <Text style={{ color: '#202060', textAlign: 'right', maxWidth: '75%' }}>
                                                Indicates 2 meal photos were sent
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
                                            <View style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: '#43CD3F' }} />
                                            <Text style={{ color: '#202060', textAlign: 'right', maxWidth: '75%' }}>
                                                Indicates 3+ meal photos were sent
                                            </Text>
                                        </View>
                                        <Text adjustsFontSizeToFit={true} style={{ color: '#202060', fontSize: 12, alignSelf: 'center', marginTop: 5 }}>{'(Hide)'}</Text>
                                    </TouchableOpacity>
                                </MotiView>}
                        </AnimatePresence>
                    </View>
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
    explanationModal: {
        width: windowWidth * 0.5,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 5,
        shadowOpacity: 0.3,
        padding: 10,
    },
})

export default Stats 
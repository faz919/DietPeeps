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
import { AnimatePresence, MotiText, MotiView } from 'moti'
import { Easing } from 'react-native-reanimated'

const Stats = ({ navigation }) => {

    const { user, globalVars } = useContext(AuthContext)

    const [loading, setLoading] = useState(false)
    const [calendarInfoIcon, setCalendarInfoIcon] = useState()
    const [calendarInfoModal, setShowCalendarInfo] = useState(false)
    // const [selectedGraph, setSelectedGraph] = useState('dailyScores')

    const [lastXDays, setLastXDays] = useState(7)
    const [graphPage, setGraphPage] = useState(1)
    const [lastXDaysModal, showLastXDaysModal] = useState(false)

    const insets = useSafeAreaInsets()

    // useEffect(() => {
    //     let imageList = []
    //     return firestore()
    //         .collection('chat-rooms')
    //         .doc(globalVars.chatID)
    //         .collection('chat-messages')
    //         .where('userID', '==', user.uid)
    //         .orderBy('timeSent', 'desc')
    //         .onSnapshot((querySnapshot) => {
    //             for (let i = 0; i < querySnapshot.size; i++) {
    //                 let doc = querySnapshot.docs[i]
    //                 if (doc.data().img != null) {
    //                     for (let image of doc.data().img) {
    //                         imageList.push({ ...image, timeSent: doc.data().timeSent })
    //                     }
    //                     // Array.prototype.push.apply(imageList, doc.data().img)
    //                 }
    //             }
    //             // console.log('snapshot received at: ', new Date())
    //             setGlobalVars(val => ({ ...val, images: imageList }))
    //             imageList = []
    //             if (loading) {
    //                 setLoading(false)
    //             }
    //         }, (e) => {
    //             console.error('error while fetching chat images: ', e)
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
        if (d1?.getFullYear() != null && d2?.getFullYear() != null) {
            return d1.getFullYear() === d2.getFullYear() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getDate() === d2.getDate()
        }
    }

    function sevenDays(d1, d2) {
        return Math.abs(d1 - d2) <= 60 * 60 * 24 * 1000 * 7
    }

    // function thirtyDays(d1, d2) {
    //     return Math.abs(d1 - d2) <= 60 * 60 * 24 * 1000 * 30
    // }

    function inDateRange(date, min, max) {
        return date >= min && date <= max
    }

    let streakCalendarDays = {}
    let graphDays = []

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

    const SevenDayAvg = () => {
        const mealGrades = globalVars.images?.filter(val => sevenDays(val.timeSent?.toDate(), new Date()) && val.graded)
        if (mealGrades == null || mealGrades.length === 0) {
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

    const SevenDayWeightAvg = () => {
        const sevenDayWeightHistory = globalVars.userData.weightHistory?.filter(val => sevenDays(val.time?.toDate(), new Date()))
        if (sevenDayWeightHistory == null || sevenDayWeightHistory.length === 0) {
            return '-'
        }
        let weightSum = 0
        sevenDayWeightHistory.forEach((weighIn, index) => {
            weightSum += globalVars.userData.usesImperial ? weighIn.weight.lbs : weighIn.weight.kgs
        })
        return Math.round(weightSum / sevenDayWeightHistory.length)
    }

    const DailyScoresGraph = () => {
        const data = graphDays?.filter(val => inDateRange(val.toDate(), new Date(new Date() - 60 * 60 * 24 * 1000 * lastXDays * graphPage), new Date(new Date() - 60 * 60 * 24 * 1000 * lastXDays * (graphPage - 1)))).reverse()
        if (graphDays.length === 0 || data.length === 0 || globalVars.images?.length === 0 || globalVars.images == null || graphDays == null || globalVars.images?.filter(val => val.graded)?.length === 0) {
            return (
                <View style={{ height: 260, width: windowWidth, paddingHorizontal: 30, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ opacity: 0.3, position: 'absolute' }} pointerEvents='none'>
                        <Chart
                            style={{ height: 260, width: windowWidth }}
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
                            padding={{ left: 30, bottom: 30, right: 30, top: 30 }}
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
                    <Text style={{ fontSize: 26, alignSelf: 'center', color: '#202060', textAlign: 'center' }}>
                        {'No graded photo data'}
                    </Text>
                    <Text style={{ fontSize: 18, alignSelf: 'center', color: '#202060', textAlign: 'center' }}>
                        {graphPage === 1 && 'Send in your first photo today!'}
                    </Text>
                </View>
            )
        }
        return (
            <Chart
                style={{ height: 260, width: windowWidth, alignSelf: 'center' }}
                data={data.map((day, index) => {
                    const mealGrades = globalVars.images?.filter(val => sameDay(val.timeSent?.toDate(), day?.toDate()) && val.graded)
                    let totals = { red: 0, yellow: 0, green: 0 }
                    mealGrades.forEach((meal, index) => {
                        totals.red += meal.red
                        totals.yellow += meal.yellow
                        totals.green += meal.green
                    })
                    return { y: Math.round((((totals.green - totals.red) / (totals.green + totals.yellow + totals.red)) + 1) * 50), x: index + 1 }
                })}
                padding={{ left: 30, bottom: 30, right: 30, top: 30 }}
                // xDomain={{ min: 1, max: graphDays.length <= 1 ? 2 : graphDays.length }}
                xDomain={{ min: 1, max: data.length < lastXDays ? data.length < 2 ? 2 : data.length : lastXDays }}
                yDomain={{ min: 0, max: 100 }}
                // viewport={{ initialOrigin: { x: graphDays.length >= 6 ? graphDays.length - 5 : 0, y: 0 }, size: { width: graphDays.length >= 6 ? 5 : graphDays.length <= 1 ? 1 : graphDays.length - 1 } }}
                disableGestures
            >
                <VerticalAxis tickCount={11} />
                <HorizontalAxis tickCount={lastXDays === 30 ? null : data.length < lastXDays ? data.length < 2 ? 2 : data.length : lastXDays} />
                {/* <HorizontalAxis tickCount={graphDays.length <= 1 ? 2 : graphDays.length} /> */}
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
        )
    }

    const WeightHistoryGraph = () => {
        const data = globalVars.userData.weightHistory?.filter(data => inDateRange(data.time.toDate(), new Date(new Date() - 60 * 60 * 24 * 1000 * lastXDays * graphPage), new Date(new Date() - 60 * 60 * 24 * 1000 * lastXDays * (graphPage - 1))))
        if (globalVars.userData.weightHistory == null || globalVars.userData.weightHistory.length === 0 || data.length === 0) {
            return (
                <View style={{ height: 260, width: windowWidth, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
                    <View style={{ opacity: 0.3, position: 'absolute' }} pointerEvents='none'>
                        <Chart
                            style={{ height: 260, width: windowWidth }}
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
                            padding={{ left: 30, bottom: 30, right: 30, top: 30 }}
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
                    <Text style={{ fontSize: 26, alignSelf: 'center', color: '#202060', textAlign: 'center' }}>
                        {'No weight history'}
                    </Text>
                    <Text style={{ fontSize: 18, alignSelf: 'center', color: '#202060', textAlign: 'center' }}>
                        {graphPage === 1 && 'Tap the scale icon in the chat box to weigh yourself today!'}
                    </Text>
                </View>
            )
        }
        const chartMin = Math.min(...globalVars.userData.weightHistory.map(weighIn => globalVars.userData.usesImperial ? weighIn.weight.lbs : weighIn.weight.kgs))
        const chartMax = Math.max(...globalVars.userData.weightHistory.map(weighIn => globalVars.userData.usesImperial ? weighIn.weight.lbs : weighIn.weight.kgs))
        const rangeMin = globalVars.userData.usesImperial ? 20 * Math.floor(chartMin / 20) : 10 * Math.floor(chartMin / 10)
        const rangeMax = globalVars.userData.usesImperial ? 20 * Math.ceil(chartMax / 20) : 10 * Math.ceil(chartMax / 10)
        return (
            <Chart
                style={{ height: 260, width: windowWidth, alignSelf: 'center' }}
                data={data.map((weighIn, index) => {
                    return { y: globalVars.userData.usesImperial ? weighIn.weight.lbs : weighIn.weight.kgs, x: index + 1 }
                })}
                padding={{ left: 30, bottom: 30, right: 30, top: 30 }}
                xDomain={{ min: 1, max: data.length < lastXDays ? data.length < 2 ? 2 : data.length : lastXDays }}
                // xDomain={{ min: 1, max: globalVars.userData.weightHistory.length <= 1 ? 2 : globalVars.userData.weightHistory.length }}
                yDomain={{ min: rangeMin, max: rangeMax }}
                // viewport={{ initialOrigin: { x: globalVars.userData.weightHistory.length >= 6 ? globalVars.userData.weightHistory.length - 5 : 0 }, size: { width: globalVars.userData.weightHistory.length >= 6 ? 5 : globalVars.userData.weightHistory.length <= 1 ? 1 : globalVars.userData.weightHistory.length - 1 } }}
                disableGestures
            >
                <VerticalAxis tickCount={Math.floor((rangeMax - rangeMin) / 5) + 1} />
                <HorizontalAxis tickCount={lastXDays === 30 ? null : data.length < lastXDays ? data.length < 2 ? 2 : data.length : lastXDays} />
                {/* <HorizontalAxis tickCount={globalVars.userData.weightHistory.length <= 1 ? 2 : globalVars.userData.weightHistory.length} /> */}
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
        )
    }

    const handleLastXModalSelection = (numDays) => {
        setLastXDays(numDays)
        showLastXDaysModal(false)
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#E6E7FA' }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ top: 80 }}>
                {loading ?
                    <View style={{ flex: 1, width: windowWidth, height: windowHeight, backgroundColor: '#E6E7FA' }}>
                        <ActivityIndicator style={{ alignSelf: 'center', top: 100 }} size={35} color="#202060" />
                    </View> :
                    <View>
                        <View style={{ backgroundColor: '#fff', borderRadius: 20, width: windowWidth - 30, minHeight: windowHeight / 8, marginTop: 20, alignSelf: 'center', alignItems: 'center', justifyContent: 'space-evenly', flexDirection: 'row', paddingVertical: (windowHeight / 8 - windowHeight / 10) / 2 }}>
                            <View style={{ backgroundColor: '#BDB9DB', borderRadius: 20, width: windowWidth / 4, minHeight: windowHeight / 10, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', fontSize: windowWidth / 10, color: '#202060' }}>{globalVars.userData?.streak}</Text>
                                <Text style={{ fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', fontSize: windowWidth / 30, color: '#202060', textAlign: 'center' }}>Streak</Text>
                            </View>
                            <View style={{ backgroundColor: '#BDB9DB', borderRadius: 20, width: windowWidth / 4, minHeight: windowHeight / 10, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', fontSize: windowWidth / 10, color: '#202060' }}>{SevenDayAvg()}</Text>
                                <Text style={{ fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', fontSize: windowWidth / 30, color: '#202060', textAlign: 'center' }}>7 Day Meal Score Avg</Text>
                            </View>
                            <View style={{ backgroundColor: '#BDB9DB', borderRadius: 20, width: windowWidth / 4, minHeight: windowHeight / 10, alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                    <Text style={{ fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', fontSize: windowWidth / 10, color: '#202060' }}>{SevenDayWeightAvg()}</Text>
                                    <Text style={{ fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', fontSize: windowWidth / 30, color: '#202060' }}>{SevenDayWeightAvg() !== '-' ? globalVars.userData.usesImperial ? 'lbs' : 'kgs' : ''}</Text>
                                </View>
                                <Text style={{ fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', fontSize: windowWidth / 30, color: '#202060', textAlign: 'center' }}>7 Day Weight Avg</Text>
                            </View>
                        </View>
                        {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginTop: 20 }}>
                            <AnimatePresence exitBeforeEnter>
                                {selectedGraph === 'weightHistory' ?
                                    <MotiView key='weightHistoryChevron' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <TouchableOpacity onPress={() => setSelectedGraph('dailyScores')}>
                                            <MaterialCommunityIcons
                                                name="chevron-left"
                                                size={28}
                                                color="#202060"
                                            />
                                        </TouchableOpacity>
                                    </MotiView> :
                                    <MotiView key='weightHistoryChevronPlaceholder' style={{ opacity: 0 }}>
                                        <MaterialCommunityIcons
                                            name="chevron-left"
                                            size={28}
                                            color="#202060"
                                        />
                                    </MotiView>}
                            </AnimatePresence>
                            <AnimatePresence>
                                {selectedGraph === 'dailyScores' ?
                                <MotiView 
                                    from={{ translateX: -(windowWidth / 2), opacity: 0 }} animate={{ translateX: 0, opacity: 1 }} exit={{ translateX: -(windowWidth / 2), opacity: 0 }} 
                                    transition={{ type: 'timing', easing: Easing.bezier(.8,-0.01,.1,.99), translateX: { duration: 350 }, opacity: { duration: 200 } }} key='dailyScoresText' 
                                    style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', width: windowWidth, flexDirection: 'column' }} pointerEvents='box-none'
                                >
                                    <Text style={{ fontSize: 26, color: '#202060', fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', alignSelf: 'center', textAlign: 'center' }}>
                                        Daily Scores
                                    </Text>
                                    {graphDays.length >= 6 && <Text style={{ fontSize: 12, color: '#202060', fontWeight: '500', alignSelf: 'center', textAlign: 'center' }}>
                                        Swipe to view older data!
                                    </Text>}
                                </MotiView> :
                                <MotiView 
                                    from={{ translateX: (windowWidth / 2), opacity: 0 }} animate={{ translateX: 0, opacity: 1 }} exit={{ translateX: (windowWidth / 2), opacity: 0 }} 
                                    transition={{ type: 'timing', easing: Easing.bezier(.8,-0.01,.1,.99), translateX: { duration: 350 }, opacity: { duration: 200 } }} key='weightHistoryText' 
                                    style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', width: windowWidth, flexDirection: 'column' }} pointerEvents='box-none'
                                >
                                    <Text style={{ fontSize: 26, color: '#202060', fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', alignSelf: 'center', textAlign: 'center' }}>
                                        Weight History
                                    </Text>
                                    {globalVars.userData.weightHistory.length >= 6 && <Text style={{ fontSize: 12, color: '#202060', fontWeight: '500', alignSelf: 'center', textAlign: 'center' }}>
                                        Swipe to view older data!
                                    </Text>}
                                </MotiView>
                                }
                            </AnimatePresence>
                            <Text style={{ fontSize: 26, fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', opacity: 0 }}>Daily Scores</Text>
                            <AnimatePresence exitBeforeEnter>
                                {selectedGraph === 'dailyScores' ?
                                    <MotiView key='dailyScoresChevron' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <TouchableOpacity onPress={() => setSelectedGraph('weightHistory')}>
                                            <MaterialCommunityIcons
                                                name="chevron-right"
                                                size={28}
                                                color="#202060"
                                            />
                                        </TouchableOpacity>
                                    </MotiView> :
                                    <MotiView key='dailyScoresChevronPlaceholder' style={{ opacity: 0 }}>
                                        <MaterialCommunityIcons
                                            name="chevron-left"
                                            size={28}
                                            color="#202060"
                                        />
                                    </MotiView>}
                            </AnimatePresence>
                        </View>
                        <AnimatePresence>
                            <View style={{ flex: 1, flexDirection: 'row', width: windowWidth * 2, height: 260 }}>
                                {selectedGraph === 'dailyScores' ?
                                    <MotiView key='dailyScores' from={{ translateX: -windowWidth }} animate={{ translateX: 0 }} exit={{ translateX: -windowWidth }} pointerEvents='box-none'>
                                        <DailyScoresGraph />
                                    </MotiView>
                                    :
                                    <MotiView key='weightHistory' from={{ translateX: windowWidth }} animate={{ translateX: 0 }} exit={{ translateX: windowWidth }} pointerEvents='box-none'>
                                        <WeightHistoryGraph />
                                    </MotiView>
                                }
                            </View>
                        </AnimatePresence> */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginTop: 20, zIndex: 1 }}>
                            <TouchableOpacity onPress={() => setGraphPage(val => val + 1)}>
                                <MaterialCommunityIcons
                                    name="chevron-left"
                                    size={28}
                                    color="#202060"
                                />
                            </TouchableOpacity>
                            {graphPage !== 1 ?
                            <View style={{ height: 45, padding: 5, justifyContent: 'center', alignItems: 'center' }}>
                                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{ maxWidth: windowWidth - 120, fontSize: 26, color: '#202060', fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', alignSelf: 'center', textAlign: 'center' }}>
                                    {moment(new Date(new Date() - 60 * 60 * 24 * 1000 * lastXDays * graphPage)).format('l')} - {moment(new Date(new Date() - 60 * 60 * 24 * 1000 * lastXDays * (graphPage - 1))).format('l')}
                                </Text>
                            </View>
                            :
                            <View>
                                <AnimatePresence>
                                    {lastXDaysModal &&
                                        <MotiView key='yo' from={{ translateY: 0, borderTopLeftRadius: 10, borderTopRightRadius: 10 }} animate={{ translateY: 45, borderTopLeftRadius: 0, borderTopRightRadius: 0 }} exit={{ translateY: 0, borderTopLeftRadius: 10, borderTopRightRadius: 10 }} transition={{ type: 'timing', duration: 300 }} style={styles.lastXDaysModal}>
                                            <TouchableOpacity onPress={() => lastXDays === 7 ? handleLastXModalSelection(30) : handleLastXModalSelection(7)} style={{ width: windowWidth * 0.6 }}>
                                                <Text style={{ fontSize: 26, color: '#202060', fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', alignSelf: 'center', textAlign: 'center' }}>
                                                    Last {lastXDays === 7 ? '30' : '7'} Days
                                                </Text>
                                            </TouchableOpacity>
                                        </MotiView>
                                    }
                                </AnimatePresence>
                                <MotiView from={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }} animate={{ borderBottomLeftRadius: lastXDaysModal ? 0 : 10, borderBottomRightRadius: lastXDaysModal ? 0 : 10 }} transition={{ type: 'timing', duration: 100 }} style={{ width: windowWidth * 0.6, minHeight: 45, padding: 5, backgroundColor: '#fff', borderRadius: 10, justifyContent: 'center' }} >
                                    <TouchableOpacity style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-evenly' }} onPress={() => lastXDaysModal ? showLastXDaysModal(false) : showLastXDaysModal(true)}>
                                        <Text style={{ fontSize: 26, color: '#202060', fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', alignSelf: 'center', textAlign: 'center' }}>
                                            Last {lastXDays} Days
                                        </Text>
                                        <View>
                                            <Ionicons
                                                name='caret-down'
                                                size={15}
                                                color='#202060'
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </MotiView>
                            </View>}
                                {graphPage > 1 ?
                                    <MotiView key='rightChevron'>
                                        <TouchableOpacity onPress={() => graphPage > 1 && setGraphPage(val => val - 1)}>
                                            <MaterialCommunityIcons
                                                name="chevron-right"
                                                size={28}
                                                color="#202060"
                                            />
                                        </TouchableOpacity>
                                    </MotiView> :
                                    <MotiView key='rightChevronPlaceholder' style={{ opacity: 0 }}>
                                        <MaterialCommunityIcons
                                            name="chevron-right"
                                            size={28}
                                            color="#202060"
                                        />
                                    </MotiView>}
                        </View>
                        <Text style={{ marginTop: 20, fontSize: 26, color: '#202060', fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', alignSelf: 'center', textAlign: 'center', zIndex: 0 }}>
                            Meal Scores
                        </Text>
                        <DailyScoresGraph />
                        <Text style={{ fontSize: 26, color: '#202060', fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', alignSelf: 'center', textAlign: 'center' }}>
                            Weight History
                        </Text>
                        <WeightHistoryGraph />
                        <Text onLayout={(event) => { const { y } = event.nativeEvent.layout; setCalendarInfoIcon(y) }} style={{ fontSize: 26, color: '#202060', fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', alignSelf: 'center' }}>
                            Meal Photo Calendar
                        </Text>
                        <Calendar
                            minDate={user.metadata.creationTime}
                            maxDate={(new Date()).toDateString()}
                            hideExtraDays
                            showSixWeeks={false}
                            style={{
                                backgroundColor: 'transparent',
                                height: 450,
                            }}
                            markingType={'period'}
                            markedDates={streakCalendarDays}
                            theme={{
                                backgroundColor: 'transparent',
                                calendarBackground: 'transparent',
                                textMonthFontWeight: 'bold',
                                arrowColor: '#202060',
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
                        <View style={{ position: 'absolute', top: calendarInfoIcon ? calendarInfoIcon + 2 : 2, right: 15 }}>
                            <TouchableOpacity style={{ position: 'absolute', top: 0, right: 0 }} onPress={() => setShowCalendarInfo(true)}>
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
                                            {/* <TouchableOpacity style={styles.hideInfoModal} onPress={() => setShowCalendarInfo(false)}>
                                            <Ionicons
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
            <View style={[styles.HUDWrapper, { top: Platform.OS === 'ios' ? insets.top : 0 }]}>
                <View style={styles.headerWrapper}>
                    <TouchableOpacity style={{ left: 15, flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('User Profile')}>
                        <ProfilePic size={50} source={{ uri: user.photoURL == null ? tempPfp() : user.photoURL }} />
                        <Text style={styles.displayName}>{user.displayName}</Text>
                    </TouchableOpacity>
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
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
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
        left: 15,
        fontSize: 22,
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
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
        padding: 10
    },
    hideInfoModal: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(180,180,180,0.7)',
        position: 'absolute',
        top: 0,
        right: 0,
        width: 25,
        height: 25,
        borderRadius: 12.5
    },
    lastXDaysModal: {
        position: 'absolute',
        width: windowWidth * 0.6,
        minHeight: 45, 
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderColor: '#202060',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    }
})

export default Stats 
import React, { useEffect, useState, useContext } from 'react'
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput, Platform } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { windowHeight, windowWidth } from '../utils/Dimensions.js'
import { AuthContext } from '../navigation/AuthProvider.js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import DatePicker from 'react-native-date-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Picker } from '@react-native-picker/picker'
import { MotiView, MotiText, AnimatePresence, MotiImage } from 'moti'
import { Easing } from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/Ionicons'
import { 
    DateOfBirthSelectorPage,
    GenderSelectorPage, 
    HeightSelector, 
    MealCountSelectorPage, 
    MealTimesSelectorPage, 
    OtherGoalSelectorPage, 
    WeightGoalSelectorPage,
    WeightSelector
} from '../components/OnboardingComponents.js'

const OnboardingWizard = ({ navigation }) => {

    const { user, updateInfo, setGlobalVars } = useContext(AuthContext)
    // set default values. based on intl avg height and weight metrics
    const [formResponses, setFormResponses] = useState({
        mealTimes: [],
        goals: [],
        height: {
            ft: 5, in: 7,
            cm: 170, mm: 2
        },
        weight: {
            lbs: 137,
            kgs: 62
        },
        targetWeight: {
            lbs: 137,
            kgs: 62
        },
        dob: new Date(2000, 0, 1),
        mealCount: 3,
        timezoneOffset: (new Date()).getTimezoneOffset() / 60
    })
    // how many pages in the form
    const formLength = 9
    // on what page does the user pick meal times. important because the functionality of the continue button is different on this page
    const mealPickerScreen = 8
    const [formPage, setFormPage] = useState(1)
    // is current wizard synced with responses fetched from asyncstorage
    const [synced, setSynced] = useState(false)
    const insets = useSafeAreaInsets()
    const [imperial, useImperial] = useState({
        height: true,
        weight: true
    })
    // which meal time is being edited
    const [editingMealTime, setEditingMealTime] = useState(1)
    // which 'loading screen' is being displayed
    const [loadingScreen, setLoadingScreen] = useState(1)

    const toggleSelectGoal = (goal) => {
        if (formResponses.goals.includes(goal)) {
            let oldArr = formResponses.goals
            let newArr = oldArr.filter(val => val != goal)
            setFormResponses(val => ({ ...val, goals: newArr }))
            
        } else {
            let newArr = formResponses.goals
            newArr.push(goal)
            setFormResponses(val => ({ ...val, goals: newArr }))
        }
    }

    // takes the values that the user has already answered on a previous session and syncs them with the current session
    useEffect(() => {
        if (!synced) {
            AsyncStorage.getItem('@onboarding_responses').then((value) => {
                if (value == null) {
                    setSynced(true)
                } else {
                    setFormResponses(val => ({...val, ...JSON.parse(value)}))
                    AsyncStorage.getItem('@onboarding_page').then((value) => {
                        if (value == null) {
                            setSynced(true)
                        } else {
                            setFormPage(JSON.parse(value))
                            setSynced(true)
                        }
                    })
                }
            })
        }
        // modify data when user navigates to different form page
        synced && AsyncStorage.setItem('@onboarding_responses', JSON.stringify(formResponses)) 
        synced && AsyncStorage.setItem('@onboarding_page', JSON.stringify(formPage))
    }, [formPage])

    const finishForm = async () => {
        setGlobalVars(val => ({...val, userBioData: formResponses}))
        if (user) {
            updateInfo({ userBioData: formResponses })
        }
        // onboarding wizard is in both authstack and app stack, so attempt to navigate to either screen
        navigation.navigate('Signup') || navigation.navigate('Main Menu')
    }

    // useEffect(() => {
    //     console.log('rerender')
    // }, [])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#e6e7fa' }}>
            {formPage < formLength + 1 &&
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, marginTop: Platform.OS === 'ios' ? 0 : 10, flexDirection: 'row' }}>
                    {/* progress bar square thingies at the top of the screen */}
                    {Array.apply(null, { length: formLength }).map((i, index) =>
                        <AnimatePresence exitBeforeEnter key={index}>
                            {formPage > index ?
                                <MotiView 
                                    key='completed' 
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{ borderRadius: 10, height: 10, width: ((windowWidth - 20) / formLength) - 5, backgroundColor: '#4C44D4', marginHorizontal: 2.5 }}
                                />
                                :
                                <MotiView 
                                    key='not-completed' 
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{ borderRadius: 10, height: 10, width: ((windowWidth - 20) / formLength) - 5, backgroundColor: '#BDB9DB', marginHorizontal: 2.5 }} 
                                />}
                        </AnimatePresence>)}
                </MotiView>}
            <KeyboardAwareScrollView contentContainerStyle={{ flex: 2 }} bounces={false} overScrollMode='never'>
                <View style={styles.ViewT7}>
                    <AnimatePresence exitBeforeEnter>
                        {formPage === 1 &&
                            <WeightGoalSelectorPage
                                key={'page1'} 
                                onSelectResponse={(response) => { setFormResponses(val => ({ ...val, weightGoal: response })); setFormPage(2) }} 
                                disableAnimation={false}
                                showTitle
                            />
                        }
                        {formPage === 2 &&
                            <OtherGoalSelectorPage
                                key={'page2'}
                                selectedGoals={formResponses.goals}
                                onSelectGoal={(goal) => toggleSelectGoal(goal)}
                                customTitle={formResponses.weightGoal === 'Not Weight Related' ? 'What are some of your goals?' : 'What other goals do you have?'}
                                onContinue={() => { formPage === 2 && setFormPage(3) }}
                                disableAnimation={false}
                            />
                        }
                        {formPage === 3 &&
                            <GenderSelectorPage
                                key={'page3'}
                                onSelectResponse={(response) => { setFormResponses(val => ({ ...val, gender: response })); setFormPage(4) }}
                                disableAnimation={false}
                            />
                        }
                        {formPage === 4 &&
                            <DateOfBirthSelectorPage
                                key={'page4'}
                                prevResponse={new Date(formResponses.dob)}
                                onSelectResponse={(date) => setFormResponses(val => ({ ...val, dob: date }))}
                                onContinue={() => { formResponses.dob && formPage === 4 && setFormPage(5) }}
                                disableAnimation={false}
                                // showError={age(formResponses.dob) < 18}
                            />
                        }
                        {formPage === 5 &&
                            <MotiView key='page5' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <View style={styles.ViewD2}>
                                    <Text
                                        style={[
                                            styles.headline1,
                                            { color: '#202060' },
                                        ]}
                                    >
                                        {'What is your current height?'}
                                    </Text>
                                </View>
                                <HeightSelector
                                    usesImperial={imperial.height}
                                    prevResponse={formResponses.height}
                                    onToggleImperial={() => useImperial(val => ({ ...val, height: imperial.height ? false : true }))}
                                    onSelectLargeUnit={(value) => setFormResponses(val => ({
                                        ...val, height: {
                                            ...formResponses.height,
                                            ft: imperial.height ? value : Math.floor((value + (formResponses.height.mm * 0.1)) * 0.0328084),
                                            in: imperial.height ? formResponses.height.in : Math.round((((value + (formResponses.height.mm * 0.1)) * 0.0328084) - Math.floor((value + (formResponses.height.mm * 0.1)) * 0.0328084)) * 12),
                                            cm: imperial.height ? Math.floor((value + (formResponses.height.in / 12)) * 30.48) : value,
                                            mm: imperial.height ? Math.round((((value + (formResponses.height.in / 12)) * 30.48) - Math.floor((value + (formResponses.height.in / 12)) * 30.48)) * 10) : formResponses.height.mm
                                        }
                                    }))}
                                    onSelectSmallUnit={(value) => setFormResponses(val => ({
                                        ...val, height: {
                                            ...formResponses.height,
                                            ft: imperial.height ? formResponses.height.ft : Math.floor((formResponses.height.cm + (value * 0.1)) * 0.0328084),
                                            in: imperial.height ? value : Math.round((((formResponses.height.cm + (value * 0.1)) * 0.0328084) - Math.floor((formResponses.height.cm + (value * 0.1)) * 0.0328084)) * 12),
                                            cm: imperial.height ? Math.floor((formResponses.height.ft + (value / 12)) * 30.48) : formResponses.height.cm,
                                            mm: imperial.height ? Math.round((((formResponses.height.ft + (value / 12)) * 30.48) - Math.floor((formResponses.height.ft + (value / 12)) * 30.48)) * 10) : value
                                        }
                                    }))}
                                />
                                <View style={styles.ViewD2}>
                                    <Text
                                        style={[
                                            styles.headline1,
                                            { color: '#202060' },
                                        ]}
                                    >
                                        {'...and weight?'}
                                    </Text>
                                </View>
                                <WeightSelector
                                    usesImperial={imperial.weight}
                                    prevResponse={formResponses.weight}
                                    onToggleImperial={() => useImperial(val => ({ ...val, weight: imperial.weight ? false : true }))}
                                    onSelectResponse={(value) => setFormResponses(val => ({
                                        ...val, weight: {
                                            ...formResponses.weight,
                                            lbs: imperial.weight ? value : Math.round(value * 2.20462),
                                            kgs: imperial.weight ? Math.round(value * 0.453592) : value
                                        }
                                    }))}
                                />
                                <View style={styles.View_4v}>
                                    <TouchableOpacity
                                        onPress={() => { formResponses.weight && formResponses.height && formPage === 5 && setFormPage(6) }}
                                        style={[
                                            styles.ButtonSolidQB,
                                            { backgroundColor: '#4C44D4', marginTop: 20 },
                                        ]}
                                    >
                                        <Text style={styles.panelButtonText}>{'Continue'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </MotiView>}
                            {formPage === 6 &&
                            <MotiView key='page6' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <View style={styles.ViewD2}>
                                    <Text
                                        style={[
                                            styles.headline1,
                                            { color: '#202060' },
                                        ]}
                                    >
                                        {'What is your target weight?'}
                                    </Text>
                                </View>
                                <WeightSelector
                                    usesImperial={imperial.weight}
                                    prevResponse={formResponses.targetWeight}
                                    onToggleImperial={() => useImperial(val => ({ ...val, weight: imperial.weight ? false : true }))}
                                    onSelectResponse={(value) => setFormResponses(val => ({
                                        ...val, targetWeight: {
                                            ...formResponses.targetWeight,
                                            lbs: imperial.weight ? value : Math.round(value * 2.20462),
                                            kgs: imperial.weight ? Math.round(value * 0.453592) : value
                                        }
                                    }))}
                                />
                                <View style={styles.View_4v}>
                                    <TouchableOpacity
                                        onPress={() => { formResponses.targetWeight && formPage === 6 && setFormPage(7) }}
                                        style={[
                                            styles.ButtonSolidQB,
                                            { backgroundColor: '#4C44D4', marginTop: 20 },
                                        ]}
                                    >
                                        <Text style={styles.panelButtonText}>{'Continue'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </MotiView>}    
                        {formPage === 7 &&
                            <MealCountSelectorPage 
                                key={'page7'}
                                prevResponse={formResponses.mealCount}
                                onSelectResponse={(value) => setFormResponses(val => ({ ...val, mealCount: value }))}
                                onContinue={() => { formResponses.mealCount && formPage === 7 && setFormPage(8) }}
                                disableAnimation={false}
                            />
                        }
                        {formPage === mealPickerScreen &&
                            <MealTimesSelectorPage 
                                editingMealTime={editingMealTime}
                                mealCount={formResponses.mealCount}
                                prevResponse={formResponses.mealTimes}
                                onSelectResponse={(v, index) => { let newArr = formResponses.mealTimes || []; newArr[index] = v; setFormResponses(val => ({ ...val, mealTimes: newArr })) }}
                                onContinue={() => {
                                    // update meal times with the value at the current index
                                    if (formResponses.mealTimes[editingMealTime - 1] == null) { 
                                        let newArr = formResponses.mealTimes || []
                                        newArr[editingMealTime - 1] = new Date()
                                        setFormResponses(val => ({ ...val, mealTimes: newArr })) 
                                    }
                                    // only go to next page (loading screen) if all the meal times have been selected
                                    editingMealTime == formResponses.mealCount ? setFormPage(mealPickerScreen + 1) : editingMealTime < formResponses.mealCount && setEditingMealTime(editingMealTime + 1) 
                                }}
                                disableContainerAnimation={false}
                            />
                        }
                        {formPage === formLength &&
                            <AnimatePresence exitBeforeEnter>
                                {loadingScreen === 1 &&
                                    <MotiView 
                                        key={'loadingScreen1'}
                                        style={styles.loadingScreen}
                                        from={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        transition={{
                                            duration: 500
                                        }}
                                        exitTransition={{
                                            duration: 300
                                        }}
                                        onDidAnimate={() => {
                                            setTimeout(() => {
                                                setLoadingScreen(2)
                                            }, 3000)
                                        }}
                                    >
                                        <MotiText
                                            style={styles.loadingScreenText}
                                            from={{ translateY: -5 }}
                                            animate={{ translateY: 5 }}
                                            transition={{ duration: 500, loop: true, type: 'timing' }}
                                        >
                                            Configuring your optimal settings...
                                        </MotiText>
                                        <MotiView
                                            style={{
                                                position: 'absolute',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}
                                            from={{ rotate: '0deg' }}
                                            animate={{ rotate: '360deg' }}
                                            transition={{ loop: Platform.OS === 'ios' ? true : false, type: 'timing', easing: Easing.linear, duration: 3000, repeatReverse: false }}
                                        >
                                            <Icon 
                                                name='settings-sharp'
                                                size={windowWidth / 3}
                                                color={'#5A5A5A'}
                                            />
                                        </MotiView>
                                        <MotiView
                                            style={{
                                                position: 'absolute',
                                                bottom: windowHeight / 3.3,
                                                right: windowWidth / 5
                                            }}
                                            from={{ rotate: '0deg' }}
                                            animate={{ rotate: '-360deg' }}
                                            transition={{ loop: Platform.OS === 'ios' ? true : false, type: 'timing', easing: Easing.linear, duration: 3000, repeatReverse: false }}
                                        >
                                            <Icon 
                                                name='settings-sharp'
                                                size={windowWidth / 5}
                                                color={'#5A5A5A'}
                                            />
                                        </MotiView>
                                    </MotiView>
                                }
                                {loadingScreen === 2 &&
                                    <MotiView 
                                        key={'loadingScreen2'}
                                        style={styles.loadingScreen}
                                        from={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        transition={{
                                            duration: 500
                                        }}
                                        exitTransition={{
                                            duration: 300
                                        }}
                                        onDidAnimate={() => {
                                            setTimeout(() => {
                                                setLoadingScreen(3)
                                            }, 3000)
                                        }}
                                    >
                                        <MotiText
                                            style={styles.loadingScreenText}
                                            from={{ translateY: -5 }}
                                            animate={{ translateY: 5 }}
                                            transition={{ duration: 500, loop: true, type: 'timing' }}
                                        >
                                            Analyzing your data...
                                        </MotiText>
                                        <MotiImage 
                                            from={{ scale: 0.95 }} 
                                            animate={{ scale: 1.05 }} 
                                            transition={{ duration: 1400, delay: 500, loop: true, type: 'timing' }} 
                                            style={{ position: 'absolute', bottom: windowHeight / 5, alignSelf: 'center', width: windowWidth, height: windowHeight / 4, resizeMode: 'contain' }} 
                                            source={require('../assets/scientist.png')}
                                        />
                                    </MotiView>
                                }
                                {loadingScreen === 3 &&
                                    <MotiView 
                                        key={'loadingScreen3'}
                                        style={styles.loadingScreen}
                                        from={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        transition={{
                                            duration: 500
                                        }}
                                        exitTransition={{
                                            duration: 300
                                        }}
                                        onDidAnimate={() => {
                                            setTimeout(() => {
                                                setLoadingScreen(4)
                                            }, 3000)
                                        }}
                                    >
                                        <MotiText
                                            style={styles.loadingScreenText}
                                            from={{ translateY: -5 }}
                                            animate={{ translateY: 5 }}
                                            transition={{ duration: 500, loop: true, type: 'timing' }}
                                        >
                                            Finding the best possible coach for you...
                                        </MotiText>
                                        <View
                                            style={{
                                                position: 'absolute',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Icon 
                                                name='chatbox-outline'
                                                size={windowWidth / 5}
                                                color={'#202060'}
                                            />
                                        </View>
                                        <MotiView
                                            style={{
                                                position: 'absolute',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}
                                            from={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ loop: true, duration: 800 }}
                                        >
                                            <Icon 
                                                name='chatbox-ellipses-outline'
                                                size={windowWidth / 5}
                                                color={'#202060'}
                                            />
                                        </MotiView>
                                    </MotiView>
                                }
                                {loadingScreen === 4 &&
                                    <MotiView 
                                        key={'loadingScreen4'}
                                        style={styles.loadingScreen}
                                        from={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        transition={{
                                            duration: 500
                                        }}
                                        exitTransition={{
                                            duration: 300
                                        }}
                                    >
                                        <MotiText
                                            style={styles.loadingScreenText}
                                            from={{ scale: 0.95 }} 
                                            animate={{ scale: 1.05 }} 
                                            transition={{ duration: 1500, delay: 500, loop: true, type: 'timing' }} 
                                        >
                                            Congratulations!
                                        </MotiText>
                                        <MotiText
                                            style={[styles.loadingScreenText, { fontSize: windowHeight * (25/844), top: windowHeight / 4 }]}
                                            // from={{ scale: 0.95 }} 
                                            // animate={{ scale: 1.05 }} 
                                            // transition={{ duration: 1500, delay: 500, loop: true, type: 'timing' }} 
                                        >
                                            You're all set up!
                                        </MotiText>
                                        <MotiView
                                            style={{
                                                position: 'absolute',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}
                                            from={{ rotate: '180deg', scale: 1.05 }}
                                            animate={{ rotate: '360deg', scale: 0.95 }}
                                            transition={{ scale: { duration: 1500, delay: 500, loop: true, type: 'timing' } }} 
                                        >
                                            <Icon
                                                name='checkmark-circle-outline'
                                                size={windowWidth / 3}
                                                color='#4bb543'
                                                style={{ left: 3 }}
                                            />
                                        </MotiView>
                                        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1000, duration: 500 }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', position: 'absolute', bottom: windowWidth / 5, width: windowWidth - 64 }}>
                                            <TouchableOpacity
                                                onPress={finishForm}
                                                style={[
                                                    styles.ButtonSolidQB,
                                                    { backgroundColor: '#4C44D4', marginTop: 20 },
                                                ]}
                                            >
                                                <Text style={styles.panelButtonText}>{'Finish'}</Text>
                                            </TouchableOpacity>
                                        </MotiView>
                                    </MotiView>
                                }
                            </AnimatePresence>
                        }
                    </AnimatePresence>
                </View>
            </KeyboardAwareScrollView>
            <AnimatePresence>
                {/* back button */}
                {formPage > 1 &&
                    !(loadingScreen < 4 && formPage === formLength) &&
                    <MotiView from={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} style={{ position: 'absolute', top: Platform.OS === 'ios' ? insets.top + 20 : 20, left: 20 }}>
                        {/* either go back to previous meal time picker, or go back to previous page */}
                        <TouchableOpacity onPress={() => { formPage === mealPickerScreen && editingMealTime > 1 ? setEditingMealTime(editingMealTime - 1) : setFormPage(formPage - 1); setLoadingScreen(1) }}>
                            <Ionicons
                                name='ios-arrow-back-circle-outline'
                                size={30}
                                color={'#202060'}
                            />
                        </TouchableOpacity>
                    </MotiView>}
            </AnimatePresence>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    Imaget6: {
        width: windowWidth * 0.24,
        height: windowWidth * 0.24,
        marginLeft: -(windowWidth * 0.04)
    },
    ViewD2: {
        alignItems: 'center'
    },
    Icona8: {
        height: 34,
        width: 34,
        marginRight: 14,
    },
    ViewZZ: {
        flex: 1,
        justifyContent: 'center'
    },
    Viewvs: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        marginTop: 12
    },
    IcongB: {
        marginRight: 14,
        width: 34,
        height: 34,
    },
    Viewk7: {
        flex: 1,
    },
    Viewwb: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        marginTop: 12,
    },
    IconCl: {
        height: 34,
        width: 34,
        marginRight: 14,
    },
    View_9d: {
        flex: 1,
    },
    Viewre: {
        flexDirection: 'row',
        marginBottom: 12,
        marginTop: 12,
        alignItems: 'flex-start',
    },
    ViewsW: {
        alignItems: 'center',
        alignSelf: 'center',
    },
    ButtonSolidQB: {
        width: '100%',
        height: 50,
        marginBottom: 12,
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#4C44D4',
        alignItems: 'center',
        marginVertical: 7,
    },
    Buttonu5: {
        alignSelf: 'center',
        alignContent: 'center',
        paddingLeft: 12,
        paddingRight: 12,
    },
    View_4v: {
        alignItems: 'center',
    },
    ViewT7: {
        justifyContent: 'space-evenly',
        flex: 1,
        margin: 32,
        marginTop: 0
    },
    ScrollViewUJContent: {
        justifyContent: 'space-evenly',
        flex: 1,
    },
    headline2: {
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        fontSize: windowHeight * (40/844),
        letterSpacing: 0,
        textAlign: 'center',
        marginVertical: 20
    },
    headline1: {
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        fontSize: windowHeight * (30/844),
        letterSpacing: 0,
        textAlign: 'center',
        marginVertical: 20
    },
    title1: {
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        fontSize: windowHeight * (25/844),
        letterSpacing: 0,
        textAlign: 'center',
        color: '#202060',
    },
    subtitle1: {
        fontSize: windowHeight * (16/844),
        letterSpacing: 0,
        marginVertical: 20
    },
    panelButtonText: {
        fontSize: windowHeight * (17/844),
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        color: 'white',
    },
    largeView: {
        marginTop: 10,
        marginBottom: 20,
        borderRadius: 20,
        width: '100%',
        height: windowHeight / 8,
        backgroundColor: '#BDB9DB',
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingScreen: {
        ...StyleSheet.absoluteFill,
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center'
    },  
    loadingScreenText: {
        fontSize: windowHeight * (35/844),
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        letterSpacing: 0,
        textAlign: 'center',
        color: '#202060',
        // borderColor: '#202060',
        // shadowColor: '#202060',
        // shadowOffset: { width: 0, height: 0 },
        // shadowOpacity: 0.9,
        // shadowRadius: 1,
        top: windowHeight / 5,
        position: 'absolute'
    }
})

export default OnboardingWizard

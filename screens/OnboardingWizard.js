import React, { useEffect, useState, useContext } from 'react'
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput, Platform, Alert } from 'react-native'
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
import firestore from '@react-native-firebase/firestore'
import {
    DateOfBirthSelectorPage,
    GenderSelectorPage,
    HeightSelector,
    WeightChartInterstitial,
    MealCountSelectorPage,
    MealTimesSelectorPage,
    OtherGoalSelectorPage,
    ReferralCodePage,
    WeightGoalSelectorPage,
    CoachProfilePage,
    WeightSelector,
    WizardFinalPage,
    TestimonialInterstitial,
    IntroExplainerPage,
    TrialPricePage
} from '../components/OnboardingComponents.js'
import Purchases from 'react-native-purchases'

const OnboardingWizard = ({ navigation }) => {

    const { mixpanel, user, updateInfo, globalVars, setGlobalVars } = useContext(AuthContext)
    // get all partner data
    const [partnerInfo, setPartnerInfo] = useState([])
    // get optional trial price data
    const [optionalTrialPriceChoices, setOptionalTrialPriceChoices] = useState([])
    const fetchOfferings = async () => {
        try {
            const trialPrices = await Purchases.getOfferings()
            // console.log(trialPrices.current.availablePackages.filter((pkg) => pkg.identifier.includes('trial')))
            trialPrices.current.availablePackages.filter((pkg) => pkg.identifier.includes('trial')) && setOptionalTrialPriceChoices(trialPrices.current.availablePackages.filter((pkg) => pkg.identifier.includes('trial')))
        } catch (e) {
            console.error('error while retrieving subscriptions: ', e)
            Alert.alert(
                'Error while retrieving subscriptions',
                'Please try again later.'
            )
        }
    }
    useEffect(() => {
        fetchOfferings()
        firestore()
            .collection('partner-info')
            .get()
            .then((partnerSnapshot) => {
                partnerSnapshot.forEach((partner) => {
                    if (!partner.data().deleted) {
                        setPartnerInfo(val => [...val, { ...partner.data(), id: partner.id }])
                    }
                })
            })
    }, [])

    // loading for trial payment button
    const [trialPaymentLoading, setTrialPaymentLoading] = useState(false)
    // function that handles user attempting to pay for trial
    const handleTrialPay = (option) => {
        setTrialPaymentLoading(true)
        mixpanel.track('Attempted to Pay for Trial')
        if (option == null) {
            Alert.alert(
                'Error while making purchase',
                'Please try again later.'
            )
            return
        }
        payForTrial(option)
    }

    // function that pays for trial, if user decides to
    const payForTrial = async (option) => {
        try {
            const { purchaserInfo, productIdentifier } = await Purchases.purchasePackage(option)
            // console.log(purchaserInfo)
            if (typeof purchaserInfo.entitlements.active['Purchased Trial'] !== 'undefined') {
                mixpanel.track('Paid for Trial', { 'PaymentInfo': JSON.stringify(purchaserInfo) })
                mixpanel.getPeople().set('Paid For Trial', true)
                console.log('Success!')
                updateInfo({ paidForTrial: true, trialPaymentInfo: { purchaserInfo } })
                setTrialPaymentLoading(false)
                setFormPage(referralCodeScreen + 1)
            } 
            // else {
            //     console.error('Unable to purchase subscription, or check subscription status. Please try again.')
            //     setLoading(false)
            // }
        } catch (e) {
            console.error('error while making purchase: ', e)
            Alert.alert(
                'Error while making purchase',
                'Please try again later.'
            )
            setTrialPaymentLoading(false)
        }
    }

    useEffect(() => {
        console.log(trialPaymentLoading)
    }, [trialPaymentLoading])

    // get the user's coach info
    const [coachInfo, setCoachInfo] = useState(null)
    useEffect(() => {
        // if the user is logged in, run a snapshot listener on their user-info doc to get their coach's ID and info
        if (user) {
            firestore()
            .collection('user-info')
            .doc(user.uid)
            .onSnapshot((userDoc) => {  
                const data = userDoc.data()
                setGlobalVars(val => ({ ...val, userData: data }))
                if (data.completedNewUserProcess || data.coachID) {
                    if (coachInfo == null) {
                        firestore()
                            .collection('user-info')
                            .doc(data.coachID)
                            .get()
                            .then((coachData) => {
                                setCoachInfo({ ...coachData.data(), id: coachData.id })
                            })
                    }
                }
            })
        }
    }, [user])
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
    // const weightGoalScreen = 5
    const introScreen = 0
    const otherGoalScreen = 5
    const genderScreen = 1
    const dobScreen = 2
    const heightWeightScreen = 3
    const targetWeightScreen = 4
    const mealCountScreen = 6
    // on what page does the user pick meal times. important because the functionality of the continue button is different on this page
    const mealPickerScreen = 7
    const referralCodeScreen = 8
    const [formPage, setFormPage] = useState(0)
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

    // check if the current form page contains any letter...it is a stupid and janky workaround that's required for a stupid and janky package known as react native async storage.
    function containsAnyLetter(str) {
        return /[a-zA-Z]/.test(str)
    }

    // takes the values that the user has already answered on a previous session and syncs them with the current session
    useEffect(() => {
        console.log(formPage)
        if (!synced) {
            AsyncStorage.getItem('@onboarding_responses').then((value) => {
                console.log('onbasoidjaosij value is', value)
                if (value == null) {
                    setSynced(true)
                } else {
                    setFormResponses(val => ({ ...val, ...JSON.parse(value) }))
                    AsyncStorage.getItem('@onboarding_page').then((value) => {
                        console.log('Hello value is', value)
                        if (value == null) {
                            setSynced(true)
                        } else {
                            setFormPage(containsAnyLetter(value) ? value : JSON.parse(value))
                            setSynced(true)
                        }
                    })
                }
            })
        }
        console.log('synced?', synced)
        // modify data when user navigates to different form page
        synced && AsyncStorage.setItem('@onboarding_responses', JSON.stringify(formResponses))
        synced && AsyncStorage.setItem('@onboarding_page', typeof formPage === 'string' ? formPage : JSON.stringify(formPage))
        if (formPage === 'signup') {
            if (user) {
                setFormPage(mealPickerScreen + 0.5)
            } else {
                navigation.navigate('Signup')
            }
        } 
        // for the loading screen pages to automatically navigate to next page after 3 seconds. can't do this via onDidAnimate method of motiviews because it gets called twice
        // (also gets called on exit animation)
        if (formPage === targetWeightScreen + 0.5) {
            setTimeout(() => {
                setFormPage('interstitial1')
            }, 3000)
        }
        if (formPage === otherGoalScreen + 0.5) {
            setTimeout(() => {
                setFormPage('interstitial2')
            }, 3000)
        }
        if (formPage === mealPickerScreen + 0.5) {
            setTimeout(() => {
                setFormPage('coachProfile')
            }, 3000)
        }
    }, [formPage])

    const finishForm = async () => {
        setGlobalVars(val => ({ ...val, userBioData: formResponses }))
        if (user) {
            updateInfo({ userBioData: formResponses })
            formResponses.referralCode && mixpanel.getPeople().set('Referral Code', formResponses.referralCode)
        }
        // onboarding wizard is in both authstack and app stack, so attempt to navigate to either screen
        AsyncStorage.setItem('hasCompletedWizard', 'true')
        user ? navigation.replace('Main Menu') : navigation.replace('Signup')
    }

    const handleSubButtonPress = () => {
        mixpanel.track('Clicked Subscribe Button')
        finishForm()
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#e6e7fa' }}>
            <AnimatePresence>
                {typeof formPage === 'number' && formPage < formLength + 1 && formPage > 0 &&
                    <MotiView key={'progress-bar'} from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 10 }} exit={{ opacity: 0, height: 0 }} transition={{ type: 'timing' }} style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, marginTop: Platform.OS === 'ios' ? 0 : 10, flexDirection: 'row' }}>
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
                    </MotiView>
                }
            </AnimatePresence>
            <KeyboardAwareScrollView contentContainerStyle={{ flex: 2 }} bounces={false} overScrollMode='never'>
                <View style={styles.ViewT7}>
                    <AnimatePresence exitBeforeEnter>
                        {formPage === introScreen &&
                            <IntroExplainerPage 
                                key={`page${introScreen}`}
                                onContinue={() => setFormPage('testimonialInterstitial1')}
                            />
                        }
                        {formPage === 'testimonialInterstitial1' &&
                            <TestimonialInterstitial
                                key={'testimonialInterstitial1'}
                                batchNumber={1}
                                onContinue={() => setFormPage(genderScreen)}
                            />
                        }
                        {formPage === genderScreen &&
                            <GenderSelectorPage
                                key={`page${genderScreen}`}
                                onSelectResponse={(response) => { setFormResponses(val => ({ ...val, gender: response })); setFormPage(genderScreen + 1) }}
                                disableAnimation={false}
                                showTitle
                            />
                        }
                        {formPage === dobScreen &&
                            <DateOfBirthSelectorPage
                                key={`page${dobScreen}`}
                                prevResponse={new Date(formResponses.dob)}
                                onSelectResponse={(date) => setFormResponses(val => ({ ...val, dob: date }))}
                                onContinue={() => { formResponses.dob && formPage === dobScreen && setFormPage(dobScreen + 1) }}
                                disableAnimation={false}
                            />
                        }
                        {formPage === heightWeightScreen &&
                            <MotiView key={`page${heightWeightScreen}`} from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginHorizontal: 32 }}>
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
                                        onPress={() => { formResponses.weight && formResponses.height && formPage === heightWeightScreen && setFormPage(heightWeightScreen + 1) }}
                                        style={[
                                            styles.ButtonSolidQB,
                                            { backgroundColor: '#4C44D4', marginTop: 20 },
                                        ]}
                                    >
                                        <Text style={styles.panelButtonText}>{'Continue'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </MotiView>}
                        {formPage === targetWeightScreen &&
                            <MotiView key={`page${targetWeightScreen}`} from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginHorizontal: 32 }}>
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
                                        onPress={() => { formResponses.targetWeight && formPage === targetWeightScreen && setFormPage(targetWeightScreen + 0.5) }}
                                        style={[
                                            styles.ButtonSolidQB,
                                            { backgroundColor: '#4C44D4', marginTop: 20 },
                                        ]}
                                    >
                                        <Text style={styles.panelButtonText}>{'Continue'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </MotiView>}
                        {formPage === targetWeightScreen + 0.5 &&
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
                        {formPage === 'interstitial1' && 
                            <WeightChartInterstitial
                                key={`interstitial1`}
                                currentWeight={imperial.weight ? formResponses.weight.lbs : formResponses.weight.kgs}
                                targetWeight={imperial.weight ? formResponses.targetWeight.lbs : formResponses.targetWeight.kgs}
                                usesImperial={imperial.weight}
                                interstitialNumber={1}
                                onContinue={() => { formPage === 'interstitial1' && setFormPage(targetWeightScreen + 1) }}
                            />
                        }
                        {/* {formPage === weightGoalScreen &&
                            <WeightGoalSelectorPage
                                key={`page${weightGoalScreen}`}
                                onSelectResponse={(response) => { setFormResponses(val => ({ ...val, weightGoal: response })); setFormPage(weightGoalScreen + 1) }}
                                disableAnimation={false}
                                showTitle={false}
                            />
                        } */}
                        {formPage === otherGoalScreen &&
                            <OtherGoalSelectorPage
                                key={`page${otherGoalScreen}`}
                                selectedGoals={formResponses.goals}
                                onSelectGoal={(goal) => toggleSelectGoal(goal)}
                                onContinue={() => { formPage === otherGoalScreen && setFormPage(otherGoalScreen + 0.5) }}
                                disableAnimation={false}
                            />
                        }
                        {formPage === otherGoalScreen + 0.5 &&
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
                        {formPage === 'interstitial2' && 
                            <WeightChartInterstitial
                                key={`interstitial2`}
                                currentWeight={imperial.weight ? formResponses.weight.lbs : formResponses.weight.kgs}
                                targetWeight={imperial.weight ? formResponses.targetWeight.lbs : formResponses.targetWeight.kgs}
                                usesImperial={imperial.weight}
                                interstitialNumber={2}
                                onContinue={() => { formPage === 'interstitial2' && setFormPage(otherGoalScreen + 1) }}
                            />
                        }
                        {formPage === mealCountScreen &&
                            <MealCountSelectorPage
                                key={`page${mealCountScreen}`}
                                prevResponse={formResponses.mealCount}
                                onSelectResponse={(value) => setFormResponses(val => ({ ...val, mealCount: value }))}
                                onContinue={() => { formResponses.mealCount && formPage === mealCountScreen && setFormPage(mealCountScreen + 1) }}
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
                                    editingMealTime == formResponses.mealCount ? setFormPage('testimonialInterstitial2') : editingMealTime < formResponses.mealCount && setEditingMealTime(editingMealTime + 1)
                                }}
                                disableContainerAnimation={false}
                            />
                        }
                        {formPage === 'testimonialInterstitial2' && 
                            <TestimonialInterstitial
                                key={'testimonialInterstitial2'}
                                batchNumber={2}
                                usesImperial={imperial.weight}
                                onContinue={() => setFormPage('signup')}
                            />
                        }
                        {formPage === mealPickerScreen + 0.5 &&
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
                        {formPage === 'coachProfile' && 
                            <CoachProfilePage
                                key={`coachProfile`}
                                coachData={coachInfo}
                                disableAnimation={false}
                                onContinue={() => setFormPage(mealPickerScreen + 1)}
                            />    
                        }
                        {formPage === referralCodeScreen &&
                            <ReferralCodePage
                                key={`page${referralCodeScreen}`}
                                partnerInfo={partnerInfo}
                                onContinueWithReferral={(code) => { setFormResponses(val => ({ ...val, referralCode: code })); formPage === referralCodeScreen && setFormPage('trialPrice') }}
                                onContinueNoReferral={() => setFormPage('trialPrice')}
                                disableAnimation={false}
                            />
                        }
                        {formPage === 'trialPrice' && 
                            <TrialPricePage
                                key={'trialPrice'}
                                trialPrices={optionalTrialPriceChoices}
                                purchaseTrial={handleTrialPay}
                                paidForTrial={globalVars.userData?.paidForTrial}
                                loading={trialPaymentLoading}
                                onContinue={() => setFormPage(referralCodeScreen + 1)}
                            />
                        }
                        {formPage === formLength &&
                            <WizardFinalPage
                                key={`page${formLength}`}
                                handleSubButtonPress={handleSubButtonPress}
                                finishForm={finishForm}
                            />
                        }
                    </AnimatePresence>
                </View>
            </KeyboardAwareScrollView>
            <AnimatePresence>
                {/* back button */}
                {formPage > 0 && Number.isSafeInteger(formPage) &&
                    <MotiView from={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} style={{ position: 'absolute', top: Platform.OS === 'ios' ? insets.top + 20 : 20, left: 20 }}>
                        {/* either go back to previous meal time picker, or go back to previous page */}
                        <TouchableOpacity onPress={() => { 
                            if (formPage > 0 && Number.isSafeInteger(formPage)) {
                                if (formPage === mealPickerScreen && editingMealTime > 1) {
                                    setEditingMealTime(editingMealTime - 1)
                                } else {
                                    setFormPage(formPage - 1)
                                    setLoadingScreen(1)
                                }
                            }
                        }}>
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
        margin: 0
    },
    ScrollViewUJContent: {
        justifyContent: 'space-evenly',
        flex: 1,
    },
    headline2: {
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        fontSize: windowHeight * (40 / 844),
        letterSpacing: 0,
        textAlign: 'center',
        marginVertical: 20
    },
    headline1: {
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        fontSize: windowHeight * (30 / 844),
        letterSpacing: 0,
        textAlign: 'center',
        marginVertical: 20
    },
    title1: {
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        fontSize: windowHeight * (25 / 844),
        letterSpacing: 0,
        textAlign: 'center',
        color: '#202060',
    },
    subtitle1: {
        fontSize: windowHeight * (16 / 844),
        letterSpacing: 0,
        marginVertical: 20
    },
    panelButtonText: {
        fontSize: windowHeight * (17 / 844),
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
        alignItems: 'center',
        marginHorizontal: 32
    },
    loadingScreenText: {
        fontSize: windowHeight * (35 / 844),
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

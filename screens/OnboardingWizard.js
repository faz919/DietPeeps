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
import messaging from '@react-native-firebase/messaging'
import Icon from 'react-native-vector-icons/Ionicons'

const OnboardingWizard = ({ navigation }) => {

    const { setGlobalVars } = useContext(AuthContext)
    const [formResponses, setFormResponses] = useState({
        mealTimes: [],
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
    const formLength = 8
    const mealPickerScreen = 7
    const [formPage, setFormPage] = useState(1)
    const [synced, setSynced] = useState(false)
    const [openTimePicker, setOpenTimePicker] = useState([])
    const insets = useSafeAreaInsets()
    const [imperial, useImperial] = useState({
        height: true,
        weight: true
    })
    const [editingMealTime, setEditingMealTime] = useState(1)
    const [loadingScreen, setLoadingScreen] = useState(1)

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
                        console.log('form page: ', value)
                    })
                }
                console.log('form responses: ', value)
            })
        }
        synced && AsyncStorage.setItem('@onboarding_responses', JSON.stringify(formResponses)) 
        synced && AsyncStorage.setItem('@onboarding_page', JSON.stringify(formPage))
    }, [formPage])

    const finishForm = async () => {
        setGlobalVars(val => ({...val, userBioData: formResponses}))
        navigation.navigate('Signup') || navigation.navigate('Main Menu')
    }

    const meals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'last']

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#e6e7fa' }}>
            {formPage < formLength + 1 &&
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, flexDirection: 'row' }}>
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
                            <MotiView key='page1' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ justifyContent: 'space-around' }}>
                                <MotiView
                                    from={{ opacity: 0, scale: 0, translateY: 200 }}
                                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                                    transition={{
                                        translateY: {
                                            delay: 1000,
                                            duration: 1500,
                                            type: 'timing',
                                            easing: Easing.bezier(.69,0,.01,.98)
                                        },
                                        scale: {
                                            duration: 1000,
                                            type: 'timing',
                                            easing: Easing.bezier(.69,0,0,1.58)
                                        }
                                    }}
                                >
                                    <View style={styles.ViewD2}>
                                        <Text style={[styles.headline2, { color: '#202060', marginBottom: 20 }]}>
                                            {'Tell us about yourself!'}
                                        </Text>
                                    </View>
                                </MotiView>
                                <MotiView
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    delay={1700}
                                >
                                    <View style={styles.ViewD2}>
                                        <Text style={[styles.headline1, { color: '#202060', marginBottom: 20 }]}>
                                            {'What is your current goal?'}
                                        </Text>
                                    </View>
                                </MotiView>
                                <MotiView
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    delay={1800}
                                >
                                    <TouchableOpacity onPress={() => { setFormResponses(val => ({ ...val, weightGoal: 'Lose Weight' })); setFormPage(2) }} style={[styles.largeView, { flexDirection: 'row' }]}>
                                        <Text style={styles.title1}>Lose Weight</Text>
                                    </TouchableOpacity>
                                </MotiView>
                                <MotiView
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    delay={1900}
                                >
                                    <TouchableOpacity onPress={() => { setFormResponses(val => ({ ...val, weightGoal: 'Maintain Weight' })); setFormPage(2) }} style={[styles.largeView, { flexDirection: 'row' }]}>
                                        <Text style={styles.title1}>Maintain Weight</Text>
                                    </TouchableOpacity>
                                </MotiView>
                                <MotiView
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    delay={2000}
                                >
                                    <TouchableOpacity onPress={() => { setFormResponses(val => ({ ...val, weightGoal: 'Gain Weight' })); setFormPage(2) }} style={[styles.largeView, { flexDirection: 'row' }]}>
                                        <Text style={styles.title1}>Gain Weight</Text>
                                    </TouchableOpacity>
                                </MotiView>
                            </MotiView>}
                        {formPage === 2 &&
                            <MotiView key='page2' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <View style={styles.ViewD2}>
                                    <Text
                                        style={[
                                            styles.headline1,
                                            { color: '#202060', marginBottom: 20 },
                                        ]}
                                    >
                                        {'What is your gender?'}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => { setFormResponses(val => ({ ...val, gender: 'Female' })); setFormPage(3) }} style={[styles.largeView, { flexDirection: 'row' }]}>
                                    <Text style={styles.title1}>Female</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setFormResponses(val => ({ ...val, gender: 'Male' })); setFormPage(3) }} style={[styles.largeView, { flexDirection: 'row' }]}>
                                    <Text style={styles.title1}>Male</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setFormResponses(val => ({ ...val, gender: 'Other' })); setFormPage(3) }} style={[styles.largeView, { flexDirection: 'row' }]}>
                                    <Text style={styles.title1}>Other</Text>
                                </TouchableOpacity>
                                <Text
                                    style={[
                                        styles.headline2,
                                        { color: '#202060', marginBottom: 20 },
                                    ]}
                                >
                                    {''}
                                </Text>
                            </MotiView>}
                        {formPage === 3 &&
                            <MotiView key='page3' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <View style={styles.ViewD2}>
                                    <Text
                                        style={[
                                            styles.headline1,
                                            { color: '#202060', marginBottom: 20 },
                                        ]}
                                    >
                                        {'What is your date of birth?'}
                                    </Text>
                                </View>
                                <View overflow={'hidden'} style={styles.largeView}>
                                    <DatePicker
                                        minimumDate={new Date('1900')}
                                        maximumDate={new Date()}
                                        androidVariant={'iosClone'}
                                        mode={'date'}
                                        date={new Date(formResponses.dob) || new Date(2000, 0, 1)}
                                        onDateChange={(date) => setFormResponses(val => ({ ...val, dob: date }))}
                                    />
                                </View>
                                <View style={styles.View_4v}>
                                    <TouchableOpacity
                                        onPress={() => { formResponses.dob && formPage === 3 && setFormPage(4) }}
                                        style={[
                                            styles.ButtonSolidQB,
                                            { backgroundColor: '#4C44D4', marginTop: 20 },
                                        ]}
                                    >
                                        <Text style={styles.panelButtonText}>{'Continue'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </MotiView>}
                        {formPage === 4 &&
                            <MotiView key='page4' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                                <View overflow={'hidden'} style={[styles.largeView, { flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center' }]}>
                                    <View style={{ justifyContent: 'center', width: imperial.height ? windowHeight / 11 : windowHeight / 10, height: windowHeight / 11, borderRadius: 10 }}>
                                        <Picker style={{ margin: -(windowHeight / 50) }}
                                            itemStyle={styles.title1}
                                            selectedValue={imperial.height ? formResponses.height.ft : formResponses.height.cm}
                                            onValueChange={(value) => setFormResponses(val => ({
                                                ...val, height: {
                                                    ...formResponses.height,
                                                    ft: imperial.height ? value : Math.floor((value + (formResponses.height.mm * 0.1)) * 0.0328084),
                                                    in: imperial.height ? formResponses.height.in : Math.round((((value + (formResponses.height.mm * 0.1)) * 0.0328084) - Math.floor((value + (formResponses.height.mm * 0.1)) * 0.0328084)) * 12),
                                                    cm: imperial.height ? Math.floor((value + (formResponses.height.in / 12)) * 30.48) : value,
                                                    mm: imperial.height ? Math.round((((value + (formResponses.height.in / 12)) * 30.48) - Math.floor((value + (formResponses.height.in / 12)) * 30.48)) * 10) : formResponses.height.mm
                                                }
                                            }))}>
                                            {Array.apply(null, { length: imperial.height ? 8 : 272 }).map((i, index) =>
                                                <Picker.Item key={index} label={(index + 1).toString()} value={index + 1} />
                                            )}
                                        </Picker>
                                    </View>
                                    <Text style={[styles.title1, { height: windowHeight / 11, top: imperial.height ? 0 : windowHeight / 25 }]}>{imperial.height ? "'" : "."}</Text>
                                    <View style={{ justifyContent: 'center', width: windowHeight / 11, height: windowHeight / 11, borderRadius: 10 }}>
                                        <Picker style={{ margin: -(windowHeight / 50) }}
                                            itemStyle={styles.title1}
                                            selectedValue={imperial.height ? formResponses.height.in : formResponses.height.mm}
                                            onValueChange={(value) => setFormResponses(val => ({
                                                ...val, height: {
                                                    ...formResponses.height,
                                                    ft: imperial.height ? formResponses.height.ft : Math.floor((formResponses.height.cm + (value * 0.1)) * 0.0328084),
                                                    in: imperial.height ? value : Math.round((((formResponses.height.cm + (value * 0.1)) * 0.0328084) - Math.floor((formResponses.height.cm + (value * 0.1)) * 0.0328084)) * 12),
                                                    cm: imperial.height ? Math.floor((formResponses.height.ft + (value / 12)) * 30.48) : formResponses.height.cm,
                                                    mm: imperial.height ? Math.round((((formResponses.height.ft + (value / 12)) * 30.48) - Math.floor((formResponses.height.ft + (value / 12)) * 30.48)) * 10) : value
                                                }
                                            }))}>
                                            {Array.apply(null, { length: imperial.height ? 12 : 10 }).map((i, index) =>
                                                <Picker.Item key={index} label={index.toString()} value={index} />
                                            )}
                                        </Picker>
                                    </View>
                                    {imperial.height && <Text style={[styles.title1, { height: windowHeight / 11 }]}>''</Text>}
                                    <TouchableOpacity onPress={() => useImperial(val => ({ ...val, height: imperial.height ? false : true }))} style={{ alignItems: 'center', justifyContent: 'center', width: windowHeight / 11, height: windowHeight / 11, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000000', shadowOffset: { width: 0, height: 5 }, shadowRadius: 5, shadowOpacity: 0.4, }}>
                                        <Text style={styles.title1}>{imperial.height ? 'ft/in' : 'cm'}</Text>
                                    </TouchableOpacity>
                                </View>
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
                                <View overflow={'hidden'} style={[styles.largeView, { flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center' }]}>
                                    <View style={{ flex: 1, alignItems: 'center', marginRight: 20 }}>
                                        <View style={{ justifyContent: 'center', width: windowHeight / 8, height: windowHeight / 11, borderRadius: 10 }}>
                                            <Picker style={{ margin: -(windowHeight / 50) }}
                                                itemStyle={styles.title1}
                                                selectedValue={imperial.weight ? formResponses.weight?.lbs : formResponses.weight?.kgs}
                                                onValueChange={(value) => setFormResponses(val => ({
                                                    ...val, weight: {
                                                        ...formResponses.weight,
                                                        lbs: imperial.weight ? value : Math.round(value * 2.20462),
                                                        kgs: imperial.weight ? Math.round(value * 0.453592) : value
                                                    }
                                                }))}>
                                                {Array.apply(null, { length: imperial.weight ? 1400 : 635 }).map((i, index) =>
                                                    <Picker.Item key={index} label={(index + 1).toString()} value={index + 1} />
                                                )}
                                            </Picker>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => useImperial(val => ({ ...val, weight: imperial.weight ? false : true }))} style={{ alignItems: 'center', justifyContent: 'center', width: windowHeight / 11, height: windowHeight / 11, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000000', shadowOffset: { width: 0, height: 5 }, shadowRadius: 5, shadowOpacity: 0.4 }}>
                                        <Text style={styles.title1}>{imperial.weight ? 'lbs' : 'kgs'}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.View_4v}>
                                    <TouchableOpacity
                                        onPress={() => { formResponses.weight && formResponses.height && formPage === 4 && setFormPage(5) }}
                                        style={[
                                            styles.ButtonSolidQB,
                                            { backgroundColor: '#4C44D4', marginTop: 20 },
                                        ]}
                                    >
                                        <Text style={styles.panelButtonText}>{'Continue'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </MotiView>}
                            {formPage === 5 &&
                            <MotiView key='page5' from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                                <View overflow={'hidden'} style={[styles.largeView, { flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center' }]}>
                                    <View style={{ flex: 1, alignItems: 'center', marginRight: 20 }}>
                                        <View style={{ justifyContent: 'center', width: windowHeight / 8, height: windowHeight / 11, borderRadius: 10 }}>
                                            <Picker style={{ margin: -(windowHeight / 50) }}
                                                itemStyle={styles.title1}
                                                selectedValue={imperial.weight ? formResponses.targetWeight?.lbs : formResponses.targetWeight?.kgs}
                                                onValueChange={(value) => setFormResponses(val => ({
                                                    ...val, targetWeight: {
                                                        ...formResponses.targetWeight,
                                                        lbs: imperial.weight ? value : Math.round(value * 2.20462),
                                                        kgs: imperial.weight ? Math.round(value * 0.453592) : value
                                                    }
                                                }))}>
                                                {Array.apply(null, { length: imperial.weight ? 1400 : 635 }).map((i, index) =>
                                                    <Picker.Item key={index} label={(index + 1).toString()} value={index + 1} />
                                                )}
                                            </Picker>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => useImperial(val => ({ ...val, weight: imperial.weight ? false : true }))} style={{ alignItems: 'center', justifyContent: 'center', width: windowHeight / 11, height: windowHeight / 11, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000000', shadowOffset: { width: 0, height: 5 }, shadowRadius: 5, shadowOpacity: 0.4 }}>
                                        <Text style={styles.title1}>{imperial.weight ? 'lbs' : 'kgs'}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.View_4v}>
                                    <TouchableOpacity
                                        onPress={() => { formResponses.targetWeight && formPage === 5 && setFormPage(6) }}
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
                                        {'How many meals do you eat per day?'}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'center', marginVertical: 40 }}>
                                    <View style={[styles.largeView, { backgroundColor: 'transparent', width: windowWidth / 5, padding: 20, justifyContent: 'center', alignItems: 'center' }]}>
                                        <View style={{ justifyContent: 'center', width: windowWidth / 6 }}>
                                            <Picker style={{ margin: -(windowHeight / 100) }}
                                                itemStyle={styles.title1}
                                                selectedValue={formResponses.mealCount}
                                                onValueChange={(value) => setFormResponses(val => ({ ...val, mealCount: value }))}>
                                                {Array.apply(null, { length: 9 }).map((i, index) =>
                                                    <Picker.Item key={index} label={(index + 1).toString()} value={index + 1} />
                                                )}
                                            </Picker>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.View_4v}>
                                    <TouchableOpacity
                                        onPress={() => { formResponses.mealCount && formPage === 6 && setFormPage(7) }}
                                        style={[
                                            styles.ButtonSolidQB,
                                            { backgroundColor: '#4C44D4', marginTop: 20 },
                                        ]}
                                    >
                                        <Text style={styles.panelButtonText}>{'Continue'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </MotiView>}
                        {formPage === mealPickerScreen &&
                            <MotiView key={'page' + mealPickerScreen} from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <AnimatePresence exitBeforeEnter>
                                {Array.apply(null, { length: formResponses.mealCount }).map((i, index) =>
                                    editingMealTime - 1 === index &&
                                    <MotiView key={'editingMealTime', (index + 1)} from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <View style={styles.ViewD2}>
                                            <Text style={[styles.title1, { color: '#202060' }]}>
                                                {formResponses.mealCount == 1 ? 'What time do you usually eat your daily meal?' : `What time do you usually eat your ${index === formResponses.mealCount - 1 ? 'last' : meals[index]} meal of the day?`}
                                            </Text>
                                        </View>
                                        <View overflow={'hidden'} style={[styles.largeView, { width: windowWidth * 0.5, alignSelf: 'center' }]}>
                                            <DatePicker
                                                androidVariant={'iosClone'}
                                                mode={'time'}
                                                minuteInterval={15}
                                                date={new Date(formResponses.mealTimes[index]) || new Date()}
                                                onDateChange={(v) => { let newArr = formResponses.mealTimes || []; newArr[index] = v; setFormResponses(val => ({ ...val, mealTimes: newArr })) }}
                                            />
                                        </View>
                                    </MotiView>
                                )}
                                </AnimatePresence>
                                <View style={styles.View_4v}>
                                    <TouchableOpacity
                                        onPress={() => { if (formResponses.mealTimes[editingMealTime - 1] == null) { let newArr = formResponses.mealTimes || []; newArr[editingMealTime - 1] = new Date(); setFormResponses(val => ({ ...val, mealTimes: newArr })) }; editingMealTime == formResponses.mealCount ? setFormPage(mealPickerScreen + 1) : editingMealTime < formResponses.mealCount && setEditingMealTime(editingMealTime + 1) }}
                                        style={[styles.ButtonSolidQB, { backgroundColor: '#4C44D4', marginTop: 20 }]}>
                                        <Text style={styles.panelButtonText}>{'Continue'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </MotiView>}
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
                                            transition={{ loop: true, type: 'timing', easing: Easing.linear, duration: 3000, repeatReverse: false }}
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
                                            transition={{ loop: true, type: 'timing', easing: Easing.linear, duration: 3000, repeatReverse: false }}
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
            {formPage > 1 &&
                !(loadingScreen < 4 && formPage === formLength) &&
                <MotiView from={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} style={{ position: 'absolute', top: Platform.OS === 'ios' ? insets.top + 20 : 20, left: 20 }}>
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
        fontWeight: 'bold',
        fontSize: windowHeight * (40/844),
        letterSpacing: 0,
        textAlign: 'center',
        marginVertical: 20
    },
    headline1: {
        fontWeight: 'bold',
        fontSize: windowHeight * (30/844),
        letterSpacing: 0,
        textAlign: 'center',
        marginVertical: 20
    },
    title1: {
        fontWeight: 'bold',
        fontSize: windowHeight * (25/844),
        letterSpacing: 0,
        textAlign: 'center',
        color: '#202060',
        marginVertical: 20
    },
    subtitle1: {
        fontSize: windowHeight * (16/844),
        letterSpacing: 0,
        marginVertical: 20
    },
    panelButtonText: {
        fontSize: windowHeight * (17/844),
        fontWeight: 'bold',
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
        fontWeight: 'bold',
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

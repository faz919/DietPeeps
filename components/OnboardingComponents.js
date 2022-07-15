import { AnimatePresence, MotiImage, MotiText, MotiView } from 'moti';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Image, ImageBackground, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Easing } from 'react-native-reanimated'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import Icon from 'react-native-vector-icons/Ionicons'
import DatePicker from 'react-native-date-picker'
import { Picker } from '@react-native-picker/picker'
import ProfilePic from './ProfilePic'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Svg, { Path } from 'react-native-svg'
import theme from '../utils/theme'
import { NUM_PEOPLE_HELPED } from '../constants/constants'
import { FlatList } from 'react-native-gesture-handler'
import { testimonialsFirstBatch, testimonialsSecondBatch } from '../data/testimonials'
import LinearGradient from 'react-native-linear-gradient'
import { Area, Chart, HorizontalAxis, Line, Tooltip, VerticalAxis } from 'react-native-responsive-linechart'
import { LineChart } from 'react-native-chart-kit'
import ChatMessage from './ChatMessage';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

// image assets
import Stanford from '../assets/stanford-logo.png'
import Oxford from '../assets/oxford-logo-hmm-yes-quite.png'
import ClevelandClinic from '../assets/cleveland-clinic-logo.png'

const IntroExplainerPage = ({ onContinue }) => {

    const firstPageScrollViewRef = useRef()
    const secondPageScrollViewRef = useRef()
    
    const [animationStep, setAnimationStep] = useState(0)

    const [introPage, setIntroPage] = useState(1)

    const pageChangeDelay = 700

    useEffect(() => {
        const stepOne = setTimeout(() => {
            setAnimationStep(1)
        }, 5000)
        const stepTwo = setTimeout(() => {
            setAnimationStep(2)
        }, 7000)
        const stepThree = setTimeout(() => {
            setAnimationStep(3)
        }, 9000)
        const stepFour = setTimeout(() => {
            setAnimationStep(4)
        }, 11000)
        return () => {
            clearTimeout(stepOne)
            clearTimeout(stepTwo)
            clearTimeout(stepThree)
            clearTimeout(stepFour)
        }
    }, [])

    return (
        <MotiView from={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AnimatePresence exitBeforeEnter>
                {introPage === 1 && 
                <MotiView key={`introPage1`} from={{ opacity: 0, translateY: 0 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -20 }} transition={{ type: 'timing' }} style={{ marginHorizontal: 20 }}>
                    <MotiView
                        from={{ opacity: 0, scale: 0, translateY: 200 }}
                        animate={{ opacity: 1, scale: 1, translateY: 0 }}
                        transition={{
                            translateY: {
                                delay: 1000,
                                duration: 1500,
                                type: 'timing',
                                easing: Easing.bezier(.69, 0, .01, .98)
                            },
                            scale: {
                                duration: 1000,
                                type: 'timing',
                                easing: Easing.bezier(.69, 0, 0, 1.58)
                            }
                        }}
                    >
                        <View style={styles.ViewD2}>
                            <Text adjustsFontSizeToFit numberOfLines={2} style={[styles.headline2, { color: '#202060', marginBottom: 0, maxHeight: windowHeight / 8 }]}>
                                {'Welcome to DietPeeps!'}
                            </Text>
                        </View>
                    </MotiView>
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        delay={1800}
                    >
                        <View style={styles.ViewD2}>
                            <Text
                                adjustsFontSizeToFit
                                numberOfLines={1}
                                style={[
                                    styles.headline1,
                                    { color: '#202060', marginBottom: 0, marginTop: 5 },
                                ]}
                            >
                                {`Here's how it works.`}
                            </Text>
                        </View>
                    </MotiView>
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        delay={3800}
                    >
                        <View style={styles.ViewD2}>
                            <Text
                                adjustsFontSizeToFit
                                numberOfLines={1}
                                style={[
                                    styles.headline1,
                                    { color: '#202060', marginBottom: 20, marginTop: 5, fontSize: windowHeight * (25 / 844) },
                                ]}
                            >
                                {`Send photos of your meals`}
                            </Text>
                        </View>
                    </MotiView>
                    <ScrollView
                        ref={firstPageScrollViewRef}
                        onContentSizeChange={() => firstPageScrollViewRef.current.scrollToEnd({ duration: 1500, animated: true })}
                        overScrollMode={'never'}
                        bounces={false}
                        scrollEnabled
                        showsVerticalScrollIndicator={false}
                        style={{ overflow: 'hidden', height: windowHeight * 0.4 }}
                    >
                        {animationStep > 0 && <MotiView
                            key={`step0`}
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing' }}
                        // delay={3000}
                        >
                            <ChatMessage
                                item={{
                                    img: [
                                        {
                                            url: 'https://firebasestorage.googleapis.com/v0/b/firstproject-b3f4a.appspot.com/o/chat-pictures%2Fonboarding_sample_image.jpg?alt=media&token=21a973a9-c7f1-4b1f-9e51-07090787a6f5'
                                        }
                                    ]
                                }}
                                outgoingMessage
                                disablePress
                            />
                        </MotiView>}
                        {animationStep > 1 && <MotiView
                            key={`step1`}
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing' }}
                        // delay={4000}
                        >
                            <ChatMessage
                                item={{
                                    msg: `Hey coach! Today I had spaghetti bolognese for dinner.`
                                }}
                                outgoingMessage
                                disablePress
                            />
                        </MotiView>}
                        {animationStep > 2 && <MotiView
                            key={`step2`}
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing' }}
                        // delay={6000}
                        >
                            <ChatMessage
                                item={{
                                    img: [
                                        {
                                            url: 'https://firebasestorage.googleapis.com/v0/b/firstproject-b3f4a.appspot.com/o/chat-pictures%2Fonboarding_sample_image.jpg?alt=media&token=21a973a9-c7f1-4b1f-9e51-07090787a6f5',
                                            graded: true,
                                            grade: 82,
                                            red: 0.75,
                                            yellow: 3,
                                            green: 8.5
                                        }
                                    ],
                                    msg: `A healthy meal overall! Try to add more vegetables to your next meal.`
                                }}
                                user={{
                                    uid: '000000000000'
                                }}
                                outgoingMessage={false}
                                disablePress
                            />
                        </MotiView>}
                        {animationStep > 3 && <MotiView
                            key={`step3`}
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing' }}
                        // delay={7000}
                        >
                            <ChatMessage
                                item={{
                                    msg: `Thanks so much!`
                                }}
                                outgoingMessage
                                disablePress
                            />
                        </MotiView>}
                    </ScrollView>
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        delay={10000}
                    >
                        <View style={styles.ViewD2}>
                            <Text
                                adjustsFontSizeToFit
                                numberOfLines={2}
                                style={[
                                    styles.headline1,
                                    { color: '#202060', fontSize: windowHeight * (25 / 844) },
                                ]}
                            >
                                {`and receive feedback from your personal coach.`}
                            </Text>
                        </View>
                    </MotiView>
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing' }}
                        delay={13000}
                        style={styles.View_4v}
                    >
                        <TouchableOpacity
                            onPress={() => setIntroPage(2)}
                            style={[
                                styles.ButtonSolidQB,
                                { backgroundColor: '#4C44D4', marginTop: 0 },
                            ]}
                        >
                            <Text style={styles.panelButtonText}>{'Continue'}</Text>
                        </TouchableOpacity>
                    </MotiView>
                </MotiView>}
                {introPage === 2 && 
                <MotiView key={`introPage2`} from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: -20 }} transition={{ type: 'timing', delay: pageChangeDelay }} exitTransition={{ type: 'timing', delay: 0 }} style={{ marginHorizontal: 20 }}>
                    <View style={styles.ViewD2}>
                        <Text
                            adjustsFontSizeToFit
                            numberOfLines={2}
                            style={[
                                styles.headline1,
                                { color: '#202060', marginBottom: 20, marginTop: 5, fontSize: windowHeight * (25 / 844) },
                            ]}
                        >
                            {`Take advantage of our daily course curriculum.`}
                        </Text>
                    </View>
                    <ScrollView
                        ref={secondPageScrollViewRef}
                        overScrollMode={'never'}
                        bounces={false}
                        scrollEnabled
                        showsVerticalScrollIndicator={false}
                        style={{ overflow: 'hidden', height: windowHeight * 0.4 }}
                    >

                    </ScrollView>
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing' }}
                        delay={pageChangeDelay + 1000}
                        style={styles.View_4v}
                    >
                        <TouchableOpacity
                            onPress={onContinue}
                            style={[
                                styles.ButtonSolidQB,
                                { backgroundColor: '#4C44D4', marginTop: 0 },
                            ]}
                        >
                            <Text style={styles.panelButtonText}>{'Continue'}</Text>
                        </TouchableOpacity>
                    </MotiView>
                </MotiView>}
            </AnimatePresence>
        </MotiView>
    )
}

const WeightGoalSelectorPage = ({ containerStyle, onSelectResponse, disableAnimation, showTitle }) => {
    return (
        <MotiView from={{ opacity: disableAnimation ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: disableAnimation ? 1 : 0 }} style={[{ justifyContent: 'space-around', marginHorizontal: 32 }, containerStyle]}>
            {showTitle && <MotiView
                from={{ opacity: disableAnimation ? 1 : 0, scale: disableAnimation ? 1 : 0, translateY: disableAnimation ? 0 : 200 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{
                    translateY: {
                        delay: 1000,
                        duration: 1500,
                        type: 'timing',
                        easing: Easing.bezier(.69, 0, .01, .98)
                    },
                    scale: {
                        duration: 1000,
                        type: 'timing',
                        easing: Easing.bezier(.69, 0, 0, 1.58)
                    }
                }}
            >
                <View style={styles.ViewD2}>
                    <Text adjustsFontSizeToFit numberOfLines={2} style={[styles.headline2, { color: '#202060', marginBottom: 0 }]}>
                        {'Tell us about yourself!'}
                    </Text>
                </View>
            </MotiView>}
            {/* <MotiView
                from={{ opacity: disableAnimation ? 1 : 0 }}
                animate={{ opacity: 1 }}
                delay={1800}
            > */}
                <View style={styles.ViewD2}>
                    <Text style={[styles.headline1, { color: '#202060', marginBottom: 20 }]}>
                        {'What is your current goal?'}
                    </Text>
                </View>
            {/* </MotiView>
            <MotiView
                from={{ opacity: disableAnimation ? 1 : 0 }}
                animate={{ opacity: 1 }}
                delay={1900}
            > */}
                <TouchableOpacity onPress={() => onSelectResponse('Lose Weight')} style={[styles.largeView, { flexDirection: 'row' }]}>
                    <Text style={styles.title1}>Lose Weight</Text>
                </TouchableOpacity>
            {/* </MotiView>
            <MotiView
                from={{ opacity: disableAnimation ? 1 : 0 }}
                animate={{ opacity: 1 }}
                delay={2000}
            > */}
                <TouchableOpacity onPress={() => onSelectResponse('Maintain Weight')} style={[styles.largeView, { flexDirection: 'row' }]}>
                    <Text style={styles.title1}>Maintain Weight</Text>
                </TouchableOpacity>
            {/* </MotiView>
            <MotiView
                from={{ opacity: disableAnimation ? 1 : 0 }}
                animate={{ opacity: 1 }}
                delay={2100}
            > */}
                <TouchableOpacity onPress={() => onSelectResponse('Gain Weight')} style={[styles.largeView, { flexDirection: 'row' }]}>
                    <Text style={styles.title1}>Gain Weight</Text>
                </TouchableOpacity>
            {/* </MotiView>
            <MotiView
                from={{ opacity: disableAnimation ? 1 : 0 }}
                animate={{ opacity: 1 }}
                delay={2200}
            > */}
                <TouchableOpacity onPress={() => onSelectResponse('Not Weight Related')} style={[styles.largeView, { flexDirection: 'row' }]}>
                    <Text style={styles.title1}>Not Weight Related</Text>
                </TouchableOpacity>
            {/* </MotiView> */}
        </MotiView>
    )
}

const GoalExplainerPage = ({ onContinue }) => {
    return (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginHorizontal: 32 }}>
            <View style={styles.ViewD2}>
                <Text
                    adjustsFontSizeToFit
                    numberOfLines={2}
                    style={[
                        styles.headline1,
                        { color: '#202060', textAlign: 'left' },
                    ]}
                >
                    {'A goal without a plan is only a dream...'}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <MotiImage from={{ translateY: 20, opacity: 0 }} animate={{ translateY: 0, opacity: 1 }} transition={{ type: 'timing' }} source={Stanford} style={{ width: windowWidth / 5, height: windowWidth / 5, marginRight: 10 }} />
                <Text
                    adjustsFontSizeToFit
                    numberOfLines={6}
                    style={[
                        styles.headline1,
                        { color: '#202060', fontSize: 20, fontWeight: '500', maxWidth: windowWidth * 0.75 - 74, textAlign: 'left' },
                    ]}
                >
                    <Text style={{ fontWeight: '700' }}>Stanford University </Text>
                    reports that short-term goals serve as a great motivator when setting out to attain an ultimate goal.
                </Text>
            </View>
            <Text
                adjustsFontSizeToFit
                numberOfLines={3}
                style={[
                    styles.headline1,
                    { color: '#202060', fontSize: 22, fontWeight: '500', textAlign: 'left' },
                ]}
            >
                Small goals reinforce achievability and keep you motivated.
            </Text>
            <Text
                adjustsFontSizeToFit
                numberOfLines={2}
                style={[
                    styles.headline1,
                    { color: '#202060', fontSize: 22, fontWeight: '500', textAlign: 'left' },
                ]}
            >
                Understanding your goals helps us design a plan specific to you.
            </Text>
            <Text
                adjustsFontSizeToFit
                numberOfLines={2}
                style={[
                    styles.headline1,
                    { color: '#202060', fontSize: 22, fontWeight: '600', textAlign: 'left' },
                ]}
            >
                Are you ready to take the first step to the rest of your life?
            </Text>
            <View style={styles.View_4v}>
                <TouchableOpacity
                    onPress={onContinue}
                    style={[
                        styles.ButtonSolidQB,
                        { backgroundColor: '#4C44D4', marginTop: 20 },
                    ]}
                >
                    <Text style={styles.panelButtonText}>{'Yes!'}</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

const OtherGoalSelectorPage = ({ selectedGoals, onSelectGoal, onContinue, disableAnimation }) => {

    const goals = [
        'Eat healthy',
        'Build muscle',
        'Start a diet',
        'Gain confidence in my body',
        'Fit in my pants',
        'Prepare for a wedding',
        'Go to the gym more',
        'Tone my body',
        'Go for a 5K run',
        'Eat less junk',
        'Quit smoking',
        'Quit drinking',
        'Drink less alcohol',
        'Enjoy life',
        'Be more mindful',
        'Live in the moment',
        'Stress less',
        'Reduce anxiety',
        'Be more productive',
        'Conquer my fears',
        'Cut down on sugar',
        'Stop eating junk food',
        'Go gluten free',
        'Reduce meat consumption',
        'Reduce my carbon footprint',
        'Become comfortable doing exercise outside',
        'Help my family be more healthy',
        'Break out of my comfort zone',
        'Recover from an eating disorder',
        'Other'
    ]

    return (
        <MotiView from={{ opacity: disableAnimation ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: disableAnimation ? 1 : 0 }} style={{ justifyContent: 'space-around', marginHorizontal: 32 }}>
            <View style={styles.ViewD2}>
                <Text adjustsFontSizeToFit numberOfLines={2} style={[styles.headline1, { color: '#202060', marginBottom: 20 }]}>
                    What are some of your goals?
                </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{
                height: windowHeight * 0.5, overflow: 'hidden'
                // if you want a border box
                //  backgroundColor: '#BDB9DB', borderRadius: 20,  paddingHorizontal: 10, paddingBottom: 10
            }}>
                <View style={{ height: 'auto', width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {goals.map((goal, index) =>
                        <TouchableOpacity key={goal} onPress={() => onSelectGoal(goal)} style={{ flexDirection: 'row', alignItems: 'center', margin: 3, padding: 5, borderRadius: 10, backgroundColor: selectedGoals.includes(goal) ? '#43CD3F' : '#fff' }}>
                            <Text adjustsFontSizeToFit numberOfLines={2} style={{ maxWidth: windowWidth / 2, fontSize: windowHeight * (18 / 844), textAlign: 'center', color: selectedGoals.includes(goal) ? '#fff' : '#202060', marginRight: 5 }}>
                                {goal}
                            </Text>
                            <Icon
                                name={selectedGoals.includes(goal) ? 'checkmark-sharp' : 'add'}
                                size={windowHeight * (18 / 844)}
                                color={selectedGoals.includes(goal) ? '#fff' : '#202060'}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
            <View style={styles.View_4v}>
                <TouchableOpacity
                    onPress={onContinue}
                    style={[
                        styles.ButtonSolidQB,
                        { backgroundColor: '#4C44D4', marginTop: 20 },
                    ]}
                >
                    <Text style={styles.panelButtonText}>{'Continue'}</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

const GenderSelectorPage = ({ onSelectResponse, disableAnimation, showTitle }) => {
    return (
        <MotiView from={{ opacity: disableAnimation ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: disableAnimation ? 1 : 0 }} style={{ marginHorizontal: 32 }}>
            {showTitle && <MotiView
                from={{ opacity: disableAnimation ? 1 : 0, scale: disableAnimation ? 1 : 0, translateY: disableAnimation ? 0 : 200 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{
                    translateY: {
                        delay: 1000,
                        duration: 1500,
                        type: 'timing',
                        easing: Easing.bezier(.69, 0, .01, .98)
                    },
                    scale: {
                        duration: 1000,
                        type: 'timing',
                        easing: Easing.bezier(.69, 0, 0, 1.58)
                    }
                }}
            >
                <View style={styles.ViewD2}>
                    <Text adjustsFontSizeToFit numberOfLines={2} style={[styles.headline2, { color: '#202060', marginBottom: 0, maxHeight: windowHeight / 8 }]}>
                        {'Tell us about yourself!'}
                    </Text>
                </View>
            </MotiView>}
            <MotiView
                from={{ opacity: disableAnimation ? 1 : 0 }}
                animate={{ opacity: 1 }}
                delay={1800}
            >
                <View style={styles.ViewD2}>
                    <Text
                        adjustsFontSizeToFit
                        numberOfLines={1}
                        style={[
                            styles.headline1,
                            { color: '#202060', marginBottom: 20 },
                        ]}
                    >
                        {'What is your sex?'}
                    </Text>
                </View>
            </MotiView>
            <MotiView
                from={{ opacity: disableAnimation ? 1 : 0 }}
                animate={{ opacity: 1 }}
                delay={1900}
            >
                <TouchableOpacity onPress={() => onSelectResponse('Female')} style={[styles.largeView, { flexDirection: 'row' }]}>
                    <Text style={styles.title1}>Female</Text>
                </TouchableOpacity>
            </MotiView>
            <MotiView
                from={{ opacity: disableAnimation ? 1 : 0 }}
                animate={{ opacity: 1 }}
                delay={2000}
            >
                <TouchableOpacity onPress={() => onSelectResponse('Male')} style={[styles.largeView, { flexDirection: 'row' }]}>
                    <Text style={styles.title1}>Male</Text>
                </TouchableOpacity>
            </MotiView>
            <MotiView
                from={{ opacity: disableAnimation ? 1 : 0 }}
                animate={{ opacity: 1 }}
                delay={2100}
            >
                <TouchableOpacity onPress={() => onSelectResponse('Other')} style={[styles.largeView, { flexDirection: 'row' }]}>
                    <Text style={styles.title1}>Other</Text>
                </TouchableOpacity>
            </MotiView>
        </MotiView>
    )
}

const DateOfBirthSelectorPage = ({ prevResponse, onSelectResponse, onContinue, disableAnimation }) => {
    const [underage, setUnderage] = useState(false)

    function age(birthDate) {
        var ageInMilliseconds = new Date() - new Date(birthDate)
        return Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24 * 365))
    }

    const handleSelectResponse = (date) => {
        onSelectResponse(date)
        setUnderage(age(date) < 18)
    }

    return (
        <MotiView from={{ opacity: disableAnimation ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: disableAnimation ? 1 : 0 }} style={{ marginHorizontal: 32 }}>
            <View style={styles.ViewD2}>
                <Text
                    adjustsFontSizeToFit
                    numberOfLines={2}
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
                    date={prevResponse || new Date(2000, 0, 1)}
                    onDateChange={(date) => handleSelectResponse(date)}
                />
            </View>
            <AnimatePresence>
                {underage && 
                <MotiView from={{ opacity: 0, maxHeight: 0 }} animate={{ opacity: 1, maxHeight: 200 }} exit={{ opacity: 0, maxHeight: 0 }} transition={{ type: 'timing' }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text allowFontScaling={true} style={{ fontWeight: '700', fontSize: 18, color: '#DA302C', textAlign: 'center' }}>Unfortunately, we are unable to serve users under the age of 18. Although our coaches cannot help you, you may feel free to complete our daily courses.</Text>
                </MotiView>}
            </AnimatePresence>
            <View style={styles.View_4v}>
                <TouchableOpacity
                    onPress={onContinue}
                    style={[
                        styles.ButtonSolidQB,
                        { backgroundColor: '#4C44D4', marginTop: 20 },
                    ]}
                >
                    <Text style={styles.panelButtonText}>{'Continue'}</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

const HeightSelector = ({ usesImperial, prevResponse, onToggleImperial, onSelectLargeUnit, onSelectSmallUnit }) => {
    return (
        <View overflow={'hidden'} style={[styles.largeView, { flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ justifyContent: 'center', width: usesImperial ? windowHeight / 11 : Platform.OS === 'ios' ? windowHeight / 10 : windowHeight / 8, height: windowHeight / 11, borderRadius: 10 }}>
                <Picker style={{ margin: -(windowHeight / 50), color: '#202060' }}
                    dropdownIconColor='#202060'
                    itemStyle={styles.title1}
                    selectedValue={usesImperial ? prevResponse.ft : prevResponse.cm}
                    onValueChange={(value) => onSelectLargeUnit(value)}>
                    {Array.apply(null, { length: usesImperial ? 8 : 272 }).map((i, index) =>
                        <Picker.Item key={index} label={(index + 1).toString()} value={index + 1} />
                    )}
                </Picker>
            </View>
            <Text style={[styles.title1, { height: windowHeight / 11, top: usesImperial ? 0 : windowHeight / 25 }]}>{usesImperial ? "'" : "."}</Text>
            <View style={{ justifyContent: 'center', width: Platform.OS === 'ios' ? windowHeight / 11 : windowHeight / 9, height: windowHeight / 11, borderRadius: 10 }}>
                <Picker style={{ margin: -(windowHeight / 50), color: '#202060' }}
                    dropdownIconColor='#202060'
                    itemStyle={styles.title1}
                    selectedValue={usesImperial ? prevResponse.in : prevResponse.mm}
                    onValueChange={(value) => onSelectSmallUnit(value)}>
                    {Array.apply(null, { length: usesImperial ? 12 : 10 }).map((i, index) =>
                        <Picker.Item key={index} label={index.toString()} value={index} />
                    )}
                </Picker>
            </View>
            {usesImperial && <Text style={[styles.title1, { height: windowHeight / 11 }]}>''</Text>}
            <UnitToggler buttonText={usesImperial ? 'ft/in' : 'cm'} onToggleImperial={onToggleImperial} />
        </View>
    )
}

const WeightSelector = ({ usesImperial, prevResponse, onToggleImperial, onSelectResponse }) => {
    return (
        <View overflow={'hidden'} style={[styles.largeView, { flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flex: 1, alignItems: 'center', marginRight: 20 }}>
                <View style={{ justifyContent: 'center', width: Platform.OS === 'ios' ? windowHeight / 8 : windowHeight / 7, height: windowHeight / 11, borderRadius: 10 }}>
                    <Picker style={{ margin: -(windowHeight / 50), color: '#202060' }}
                        dropdownIconColor='#202060'
                        itemStyle={styles.title1}
                        selectedValue={usesImperial ? prevResponse.lbs : prevResponse.kgs}
                        onValueChange={(value) => onSelectResponse(value)}>
                        {Array.apply(null, { length: usesImperial ? 1400 : 635 }).map((i, index) =>
                            <Picker.Item key={index} label={(index + 1).toString()} value={index + 1} />
                        )}
                    </Picker>
                </View>
            </View>
            <UnitToggler buttonText={usesImperial ? 'lbs' : 'kgs'} onToggleImperial={onToggleImperial} />
        </View>
    )
}

const MealCountSelectorPage = ({ prevResponse, onSelectResponse, onContinue, disableAnimation }) => {
    return (
        <MotiView from={{ opacity: disableAnimation ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: disableAnimation ? 1 : 0 }} style={{ marginHorizontal: 32 }}>
            <View style={styles.ViewD2}>
                <Text
                    adjustsFontSizeToFit
                    numberOfLines={2}
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
                    <View style={{ justifyContent: 'center', width: Platform.select({ ios: windowWidth / 6, android: windowWidth / 4 }) }}>
                        <Picker 
                            style={{ margin: -(windowHeight / 100), color: '#202060' }}
                            dropdownIconColor='#202060'
                            itemStyle={styles.title1}
                            selectedValue={prevResponse}
                            onValueChange={(value) => onSelectResponse(value)}>
                            {Array.apply(null, { length: 9 }).map((i, index) =>
                                <Picker.Item key={index} label={(index + 1).toString()} value={index + 1} />
                            )}
                        </Picker>
                    </View>
                </View>
            </View>
            <View style={styles.View_4v}>
                <TouchableOpacity
                    onPress={onContinue}
                    style={[
                        styles.ButtonSolidQB,
                        { backgroundColor: '#4C44D4', marginTop: 20 },
                    ]}
                >
                    <Text style={styles.panelButtonText}>{'Continue'}</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

const MealPhotoExplainerPage = ({ onContinue }) => {
    return (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginHorizontal: 32 }}>
            <View style={styles.View_4v}>
                <TouchableOpacity
                    onPress={onContinue}
                    style={[
                        styles.ButtonSolidQB,
                        { backgroundColor: '#4C44D4', marginTop: 20 },
                    ]}
                >
                    <Text style={styles.panelButtonText}>{'Continue'}</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

const MealTimesSelectorPage = ({ editingMealTime, mealCount, prevResponse, onSelectResponse, onContinue, disableContainerAnimation }) => {

    const meals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'last']

    return (
        <MotiView from={{ opacity: disableContainerAnimation ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: disableContainerAnimation ? 1 : 0 }} style={{ marginHorizontal: 32 }}>
            <AnimatePresence exitBeforeEnter>
                {Array.apply(null, { length: mealCount }).map((i, index) =>
                    editingMealTime - 1 === index &&
                    <MotiView key={`editingMealTime${index + 1}`} from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <View style={styles.ViewD2}>
                            <Text adjustsFontSizeToFit numberOfLines={3} style={[styles.title1, { color: '#202060' }]}>
                                {mealCount == 1 ? 'What time do you usually eat your daily meal?' : `What time do you usually eat your ${index === mealCount - 1 ? 'last' : meals[index]} meal of the day?`}
                            </Text>
                        </View>
                        <View overflow={'hidden'} style={[styles.largeView, { width: windowWidth * 0.5, alignSelf: 'center' }]}>
                            <DatePicker
                                androidVariant={'iosClone'}
                                mode={'time'}
                                minuteInterval={15}
                                date={prevResponse[index] ? new Date(prevResponse[index]) : new Date()}
                                onDateChange={(v) => onSelectResponse(v, index)}
                            />
                        </View>
                    </MotiView>
                )}
            </AnimatePresence>
            <View style={styles.View_4v}>
                <TouchableOpacity
                    onPress={onContinue}
                    style={[styles.ButtonSolidQB, { backgroundColor: '#4C44D4', marginTop: 20 }]}>
                    <Text style={styles.panelButtonText}>{'Continue'}</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

const PhotoPledgePage = ({ onContinue }) => {
    return (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginHorizontal: 32 }}>
            <View style={styles.View_4v}>
                <TouchableOpacity
                    onPress={onContinue}
                    style={[
                        styles.ButtonSolidQB,
                        { backgroundColor: '#4C44D4', marginTop: 20 },
                    ]}
                >
                    <Text style={styles.panelButtonText}>{'Continue'}</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

const ReferralCodePage = ({ partnerInfo, onContinueWithReferral, onContinueNoReferral, disableAnimation }) => {

    const [code, setCode] = useState('')
    const partner = partnerInfo.find((p) => p.referralCode.toLowerCase() === code?.toLowerCase())

    const handleSocialIconSelect = (link) => {
        Linking.openURL(link)
    }

    return (
        <MotiView from={{ opacity: disableAnimation ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: disableAnimation ? 1 : 0 }} style={{ marginHorizontal: 32 }}>
            <View style={styles.ViewD2}>
                <Text
                    adjustsFontSizeToFit
                    numberOfLines={2}
                    style={[
                        styles.headline1,
                        { color: '#202060' },
                    ]}
                >
                    {partner ? `Have you been referred by ${partner.displayName}?` : 'Enter your referral code below'}
                </Text>
            </View>
            <KeyboardAvoidingView style={{ alignItems: 'center', marginVertical: 40 }}>
                <View style={[styles.largeView, { backgroundColor: 'transparent', width: windowWidth / 5, padding: 20, justifyContent: 'center', alignItems: 'center' }]}>
                <AnimatePresence>
                    {partner && 
                    <MotiView key={'profile pic'} from={{ height: 0, opacity: 0 }} animate={{ height: (windowWidth / 3) + 70, opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'timing', duration: 350 }} style={{ width: windowWidth, justifyContent: 'center', alignItems: 'center' }}>
                        <ProfilePic 
                            source={{ uri: partner?.photoURL }}
                            size={windowWidth / 3}
                            style={{ marginTop: 10, marginBottom: 10 }}
                        />
                        <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            {partner.socials.map((social, index) =>
                                <MotiView key={social.link} from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', delay: 350 + ((index + 1) * 100), duration: 200 }}>
                                    <TouchableOpacity onPress={() => handleSocialIconSelect(social.link)} style={{ marginLeft: 10, marginRight: 10 }}>
                                        <FontAwesome5
                                            name={social.logo}
                                            size={40}
                                            color={theme.socials[social.logo]}
                                        />
                                    </TouchableOpacity>
                                </MotiView>
                            )}
                        </View>
                    </MotiView>}
                </AnimatePresence>
                    <TextInput
                        style={{ 
                            backgroundColor: '#fff',
                            minHeight: 50,
                            width: windowWidth - 60,
                            textAlign: 'center',
                            fontSize: 32,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#bdb9db',
                            marginBottom: 10,
                            color: '#202060',
                            fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal'
                        }}
                        autoCapitalize='none'
                        autoComplete='off'
                        autoCorrect={false}
                        placeholderTextColor={'#E6E7FA'}
                        placeholder={'Type here...'}
                        value={code}
                        onChangeText={(text) => setCode(text)}
                    />
                </View>
            </KeyboardAvoidingView>
            {partner && 
            <MotiView style={styles.View_4v} from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TouchableOpacity
                    onPress={() => onContinueWithReferral(code)}
                    style={[
                        styles.ButtonSolidQB,
                        { backgroundColor: '#4C44D4', marginTop: 20 },
                    ]}
                >
                    <Text style={styles.panelButtonText}>{'Yes!'}</Text>
                </TouchableOpacity>
            </MotiView>}
            <View style={styles.View_4v}>
                <TouchableOpacity
                    onPress={onContinueNoReferral}
                >
                    <Text style={[styles.panelButtonText, { color: '#4C44D4', fontWeight: '400' }]}>I don't have a referral code</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

const WeightChartInterstitial = ({ currentWeight, targetWeight, usesImperial, interstitialNumber, onContinue }) => {

    const loseWeightGoal = targetWeight < currentWeight

    const numWeeks = usesImperial ? Math.floor(Math.abs(currentWeight - targetWeight) / (interstitialNumber)) : Math.floor((2 * Math.abs(currentWeight - targetWeight)) / (interstitialNumber))

    const varAmount = usesImperial ? 5 : 3

    return (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <View style={{ width: windowWidth, paddingHorizontal: 32 }}>
                <Text adjustsFontSizeToFit numberOfLines={interstitialNumber === 1 ? 3 : 2} style={[styles.loadingScreenText, { marginVertical: 20 }]}>
                    {targetWeight === currentWeight ? 
                        `You're on track to maintain your current weight!` : 
                        interstitialNumber === 1 ?
                            `You're already on track to ${loseWeightGoal ? 'lose' : 'gain'} ${Math.abs(currentWeight - targetWeight)} ${usesImperial ? 'lbs' : 'kgs'} in ${numWeeks} weeks!` :
                            `You're already making progress!`
                    }
                </Text>
                {interstitialNumber === 2 && <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.loadingScreenText, { marginTop: -15, marginBottom: 15, fontSize: 22, fontWeight: '600' }]}>
                    {`In ${numWeeks} weeks, you'll ${loseWeightGoal ? 'lose' : 'gain'} ${Math.abs(currentWeight - targetWeight)} ${usesImperial ? 'lbs' : 'kgs'}!`}
                </Text>}
            </View>
            <MotiView from={{ opacity: 0, translateY: 50 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: 50 }} transition={{ delay: 350, type: 'timing', duration: 500 }} style={{ width: windowWidth, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
                    <LineChart
                        data={{
                            labels: Array(4).fill(null).map((w, index) => {
                                return `Week ${Math.ceil((numWeeks * index) / 3)}`
                            }),
                            datasets: [
                                {
                                    data: Array(8).fill(null).map((w, index) => {
                                        const weightValue = loseWeightGoal ? currentWeight - ((currentWeight - targetWeight) * (Math.ceil((numWeeks * index) / 7) / numWeeks)) : currentWeight + ((targetWeight - currentWeight) * (Math.ceil((numWeeks * index) / 7) / numWeeks))
                                        return weightValue
                                        // return (index === 0 || index === 7 || targetWeight === currentWeight) ? weightValue : weightValue + (varAmount - (varAmount * 2 * Math.random()))
                                    }),
                                    color: (opacity = 1) => `rgba(76, 68, 212, ${opacity})`,
                                    strokeWidth: 2
                                }
                            ],
                            legend: ['Projected Weight']
                        }}
                        width={windowWidth - 64} // from react-native
                        height={220}
                        yAxisSuffix={usesImperial ? 'lbs' : 'kgs'}
                        yAxisInterval={1} // optional, defaults to 1
                        chartConfig={{
                            backgroundColor: "#F7B852",
                            backgroundGradientFrom: "#F7B852",
                            backgroundGradientTo: "#f9cd86",
                            decimalPlaces: 0, // optional, defaults to 2dp
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            style: {
                                borderRadius: 16,
                            },
                            propsForDots: {
                                r: "6",
                                strokeWidth: "2",
                                stroke: "#f9cd86",
                                fill: '#4C44D4'
                            },
                            propsForBackgroundLines: {
                                opacity: 0
                            }
                        }}
                        // bezier
                        style={{
                            alignSelf: 'center',
                            borderRadius: 16
                        }}
                    />
            </MotiView>
            {interstitialNumber === 2 &&
                <View style={{ width: windowWidth, paddingHorizontal: 32 }}>
                    <Text adjustsFontSizeToFit numberOfLines={2} style={[styles.loadingScreenText, { marginTop: 20, marginBottom: 0, fontSize: 20, fontWeight: '600' }]}>
                        Continue to reach your weight goal even sooner!
                    </Text>
                </View>
            }
            <View style={styles.View_4v}>
                <TouchableOpacity
                    onPress={onContinue}
                    style={[styles.ButtonSolidQB, { backgroundColor: '#4C44D4', marginTop: 20 }]}>
                    <Text style={styles.panelButtonText}>{'Continue'}</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

const TestimonialInterstitial = ({ batchNumber, usesImperial, onContinue }) => {

    const [visibleT, setVisibleT] = useState(0)

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        setVisibleT(viewableItems[0]?.index)
    }, [])
    
    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50
    }

    const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig, onViewableItemsChanged }])

    const batch = batchNumber === 1 ? testimonialsFirstBatch : testimonialsSecondBatch

    return (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* <View style={{ width: windowWidth, paddingHorizontal: 20 }}>
                <Text style={[styles.loadingScreenText, { marginVertical: 20 }]}>
                    See what our clients have to say!
                </Text>
            </View> */}
            <FlatList
                style={{ marginVertical: 10 }}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={windowWidth}
                decelerationRate='fast'
                viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                data={batch}
                pagingEnabled
                renderItem={({ item }) => (
                    <View key={item.displayName} style={{ overflow: 'hidden', width: windowWidth - 40, marginHorizontal: 20, borderRadius: 20, backgroundColor: '#fff', borderColor: '#202060', borderWidth: 1 }}>
                        <ImageBackground source={{ uri: item.photoURL }} style={{ width: '100%', height: windowHeight / 3, justifyContent: 'flex-end', alignItems: 'flex-start' }} imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                            <Text style={{ fontWeight: '700', fontSize: 25, color: '#fff', marginLeft: 10, marginBottom: 5 }}>{item.displayName}</Text>
                        </ImageBackground>
                        <View style={{ paddingHorizontal: 15, paddingVertical: 0 }}>
                            <ScrollView
                                showsVerticalScrollIndicator
                                style={{
                                    height: windowHeight / 3,
                                    paddingVertical: 10
                                }}
                            >
                                <Text adjustsFontSizeToFit numberOfLines={100} style={{ maxHeight: windowHeight / 3, marginTop: 5, fontWeight: '500', fontSize: 22, color: '#202060' }}>{item.testimonial}</Text>
                                {item.weightStats && <View style={{ justifyContent: 'flex-end', flex: 1, marginBottom: 20 }}>
                                    <Text adjustsFontSizeToFit numberOfLines={1} style={{ marginTop: 8, fontWeight: '500', fontSize: 14, color: '#BDB9DB' }}><Text style={{ fontWeight: '700' }}>Initial Weight: </Text>{usesImperial ? item.weightStats?.initial?.lbs : item.weightStats?.initial?.kgs}</Text>
                                    <Text adjustsFontSizeToFit numberOfLines={1} style={{ marginTop: 3, fontWeight: '500', fontSize: 14, color: '#BDB9DB' }}><Text style={{ fontWeight: '700' }}>Target Weight: </Text>{usesImperial ? item.weightStats?.target?.lbs : item.weightStats?.target?.kgs}</Text>
                                    <Text adjustsFontSizeToFit numberOfLines={1} style={{ marginTop: 3, fontWeight: '500', fontSize: 14, color: '#BDB9DB' }}><Text style={{ fontWeight: '700' }}>Weight Goal Reached: </Text>{item.weightStats?.numDays}</Text>
                                </View>}
                            </ScrollView>
                        </View>
                    </View>
                )}
                keyExtractor={(item) => item.displayName}
            />
            <View style={{ width: windowWidth, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ padding: 10, width: 110, justifyContent: 'center', flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, borderWidth: 1, borderColor: '#202060' }}>
                    {batch.map((item, index) => (
                        <MotiView from={{ scale: 0, width: 10, backgroundColor: '#BDB9DB' }} animate={{ scale: 1, width: index === visibleT ? 20 : 10, backgroundColor: index === visibleT ? '#4C44D4' : '#BDB9DB' }} transition={{ type: 'timing' }} key={index} style={{ height: 10, borderRadius: 5, marginHorizontal: 5 }} />
                    ))}
                </View>
            </View>
            <View style={styles.View_4v}>
                <TouchableOpacity
                    onPress={onContinue}
                    style={[styles.ButtonSolidQB, { backgroundColor: '#4C44D4', marginTop: 20 }]}>
                    <Text style={styles.panelButtonText}>{'Continue'}</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

const CoachProfilePage = ({ coachData, disableAnimation, onContinue }) => {
    const [loading, setLoading] = useState(true)
    return (
        <MotiView from={{ opacity: disableAnimation ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: disableAnimation ? 1 : 0 }}>
            <ScrollView overScrollMode='never' bounces={false} contentContainerStyle={{ width: windowWidth, height: windowHeight, marginTop: -20 }}>
                <View style={[styles.ViewD2, { marginHorizontal: 20 }]}>
                    <Text
                        adjustsFontSizeToFit
                        numberOfLines={1}
                        style={[
                            styles.headline1,
                            { color: '#202060', maxHeight: windowHeight / 8 },
                        ]}
                    >
                        Meet your personal coach!
                    </Text>
                </View>
                <View style={styles.ViewWi}>
                    <ImageBackground onLoad={() => setLoading(false)} style={[styles.Image_9l, { backgroundColor: '#e6e7fa' }]}
                        source={{ uri: coachData?.photoURLHighRes ? coachData?.photoURLHighRes : coachData?.photoURL }}
                    >
                        {loading &&
                            <SkeletonPlaceholder backgroundColor='#BDB9DB' highlightColor='#e6e7fa' speed={1000}>
                                <View style={styles.Image_9l} />
                            </SkeletonPlaceholder>}
                        <LinearGradient style={{ height: 50, flex: 1 }} colors={['rgba(230,231,250,1)', 'rgba(230,231,250,0)', 'rgba(230,231,250,0)', 'rgba(230,231,250,0)', 'rgba(230,231,250,1)']} />
                    </ImageBackground>
                </View>
                <View style={styles.ViewmY}>
                    <View style={styles.ViewvG}>
                        <Text style={[styles.TextOd, { color: '#202060' }]}>
                            {coachData?.displayName}
                        </Text>
                        <MaterialCommunityIcons
                            color={'#202060'}
                            size={20}
                            name='check-decagram'
                        />
                    </View>
                    <Text style={[styles.Textra, { color: '#202060' }]}>
                        {'About Me'}
                    </Text>

                    <Text style={[styles.TextBM, { color: '#202060' }]}>
                        {coachData.coachInfo?.bio || `Hey! I'm ${coachData.displayName}. Welcome to DietPeeps!`}
                    </Text>

                    {coachData.coachInfo?.interests &&
                        <>
                            <Text style={[styles.TextO5, { color: '#202060' }]}>
                                {'Interests'}
                            </Text>

                            <View style={styles.ViewuK}>
                                {coachData.coachInfo?.interests.map((interest, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.ViewIr,
                                            {
                                                backgroundColor: '#202060',
                                                borderRadius: 10,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[styles.TextG2, { color: '#fff' }]}
                                        >
                                            {interest}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </>}
                </View>
                <MotiView style={styles.View_4v} from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <TouchableOpacity
                        onPress={onContinue}
                        style={[
                            styles.ButtonSolidQB,
                            { backgroundColor: '#4C44D4', marginTop: 20 },
                        ]}
                    >
                        <Text style={styles.panelButtonText}>{'Awesome!'}</Text>
                    </TouchableOpacity>
                </MotiView>
            </ScrollView>
        </MotiView>
    )
}

const TrialPricePage = ({ trialPrices, purchaseTrial, paidForTrial, loading, onContinue }) => {
    const [selectedPrice, setSelectedPrice] = useState(null)
    return (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginHorizontal: 32 }}>
            <View style={styles.ViewD2}>
                <Text
                    adjustsFontSizeToFit
                    numberOfLines={9}
                    style={[
                        styles.headline1,
                        { color: '#202060', fontSize: 20, maxHeight: windowHeight / 3 },
                    ]}
                >
                    In light of the global health crisis, we are offering the option to try DietPeeps for only {trialPrices[0].product.price_string}.
                    Money shouldn't stand in the way of finding a plan that really works. So, choose an amount that you think is reasonable to try us out.
                    It costs us {trialPrices[3].product.price_string} to compensate our DietPeeps employees for the trial, but please choose the amount you are comfortable with.
                </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginVertical: 20 }}>
                {trialPrices?.map((option, index) => (
                    <View key={index} pointerEvents={paidForTrial ? 'none' : 'auto'} style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: paidForTrial ? 0.5 : 1 }}>
                        <MotiView
                            key={index}
                            from={{ 
                                opacity: 0, 
                                translateY: 20,
                                shadowOpacity: 0,
                                elevation: 0,
                                borderColor: '#202060'
                            }}
                            animate={{ 
                                opacity: 1, 
                                translateY: selectedPrice?.identifier === option.identifier ? -10 : 0,                             
                                shadowOpacity: selectedPrice?.identifier === option.identifier ? 0.4 : 0,
                                elevation: selectedPrice?.identifier === option.identifier ? 0.4 : 0,
                                borderColor: selectedPrice?.identifier === option.identifier ? '#4C44D4' : '#202060'
                            }}
                            transition={{ type: 'timing' }}
                            style={{
                                borderRadius: 20, borderWidth: 1, borderColor: '#202060', backgroundColor: '#fff', padding: 10, justifyContent: 'center', alignItems: 'center', width: 100, height: 100,
                                shadowColor: '#000000',
                                shadowOffset: { width: 0, height: 3 },
                                shadowRadius: 5,
                                margin: 10,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => setSelectedPrice(option)}
                                style={{ 
                                    borderRadius: 20,
                                    width: '100%',
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: '#202060', fontSize: 22 }}>{option.product.price_string}</Text>
                            </TouchableOpacity>
                        </MotiView>
                        {/* {index === trialPrices.length - 1 && 
                            <Text
                                adjustsFontSizeToFit
                                numberOfLines={2}
                                style={{ color: '#202060', fontSize: windowHeight * (16/844), maxWidth: 100, textAlign: 'center', position: 'absolute', bottom: -30 }}
                            >
                                Most popular option
                            </Text>
                        } */}
                    </View>
                ))}
                {paidForTrial && 
                <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                        <Text
                            style={[
                                styles.headline1,
                                { color: '#202060', fontSize: 20, maxWidth: windowWidth * 0.6, textAlign: 'center' },
                            ]}
                        >
                            Thanks so much for your support!
                        </Text>
                </View>}
            </View>
            <MotiView style={styles.View_4v} from={{ opacity: 0 }} animate={{ opacity: loading ? 0.7 : 1 }}>
                <TouchableOpacity
                    disabled={loading}
                    onPress={() => selectedPrice != null && purchaseTrial(selectedPrice)}
                    style={[
                        styles.ButtonSolidQB,
                        { backgroundColor: '#4C44D4', marginTop: 20 },
                    ]}
                >
                    {loading ? 
                        <ActivityIndicator color='#BDB9DB' /> :
                        <Text style={styles.panelButtonText}>{`Let's do it!`}</Text>
                    }
                </TouchableOpacity>
            </MotiView>
            <View style={styles.View_4v}>
                <TouchableOpacity
                    onPress={onContinue}
                >
                    <Text style={[styles.panelButtonText, { color: '#4C44D4', fontWeight: '400', textAlign: 'center' }]}>I'm not willing to compensate DietPeeps for my trial.</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

const WizardFinalPage = ({ handleSubButtonPress, finishForm }) => {

    const [visibleT, setVisibleT] = useState(0)

    const [dropdowns, setDropdowns] = useState({})

    function toggle(index) {
        setDropdowns(val => ({ ...val, [index]: 1 - (val[index]|0) }))
    }

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        setVisibleT(viewableItems[0]?.index)
    }, [])
    
    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50
    }

    const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig, onViewableItemsChanged }])

    const faq = [
        {
            question: 'What does my coach do?',
            answer: `With DietPeeps, you'll have a personal accountability coach. Our coaches help people comply with a clean diet, stick to a weight loss routine (or come up with one), and provide support. They have undergone a training program covering basic nutrition, research on the psychology of weight loss, accountability coaching, healthy dietary practices, and sustainable weight loss methods.`
        },
        {
            question: 'Do you track calories?',
            answer: `We do not track calories. However, we offer support to users that are counting calories by helping them clean up their diet and offer low-calorie alternatives which help them stay within their calorie limits.`
        },
        {
            question: 'How does the scoring system work?',
            answer: 'The score is based on clean eating guidelines. For every meal, you will receive a chart that shows the composition of allowed foods (green), foods allowed in moderation (yellow), and foods to avoid (white).'
        }
    ]

    const offerSheet = [
        {
            name: 'Free',
            paid: false,
            offers: [
                { offer: 'Daily mini-courses', included: true },
                { offer: '24/7 personal coach', included: false },
                { offer: 'Meal scoring', included: false },
                { offer: 'Advanced stats', included: false },
            ]
        },
        {
            name: 'Subscriber',
            paid: true,
            offers: [
                { offer: 'Daily mini-courses', included: true },
                { offer: '24/7 personal coach', included: true },
                { offer: 'Meal scoring', included: true },
                { offer: 'Advanced stats', included: true },
            ]
        }
    ]

    return (
        <>
            <ScrollView
                showsVerticalScrollIndicator={false}
                // onScroll={(event) => setAmountScrolled(event.nativeEvent.contentOffset.y)}
                // scrollEventThrottle={8}
            >
                <MotiView
                    style={styles.loadingScreen}
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 500
                    }}
                    exitTransition={{
                        duration: 300
                    }}
                >
                    <View style={{ width: windowWidth, paddingHorizontal: 20 }}>
                        <MotiText numberOfLines={1} adjustsFontSizeToFit style={[styles.loadingScreenText, { marginTop: windowHeight / 4 }]}>
                            Congratulations!
                        </MotiText>
                        <MotiText
                            style={[styles.loadingScreenText, { fontSize: windowHeight * (25 / 844) }]}
                        >
                            You're all set up!
                        </MotiText>
                        <MotiView
                            style={{
                                // position: 'absolute',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            from={{ rotate: '180deg' }}
                            animate={{ rotate: '360deg' }}
                        >
                            <Icon
                                name='checkmark-circle-outline'
                                size={windowWidth / 3}
                                color='#4bb543'
                                style={{ left: 3 }}
                            />
                        </MotiView>
                        <MotiText from={{ opacity: 0 }} animate={{ opacity: 1 }} delay={400} style={[styles.loadingScreenText, { marginBottom: 20 }]}>
                            Welcome to DietPeeps!
                        </MotiText>
                        <MotiText from={{ opacity: 0 }} animate={{ opacity: 1 }} delay={500} style={{ fontSize: 18, color: '#202060', textAlign: 'center' }}>
                            DietPeeps is a subscription-based program. After a 14-day free trial, you will be asked to subscribe for only a dollar a day. The benefits of subscribing include:
                        </MotiText>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginVertical: 20 }}>
                            {offerSheet.map((offerDetails, index) => (
                                <MotiView 
                                    key={index} 
                                    from={{ opacity: 0, translateY: 20 }} 
                                    animate={{ opacity: offerDetails.paid ? 1 : 0.7, translateY: offerDetails.paid ? -10 : 10 }} 
                                    transition={{ type: 'timing', delay: 900 + (200 * index) }} 
                                    style={{ borderRadius: 20, borderWidth: 1, borderColor: '#202060', backgroundColor: '#fff', padding: 10, justifyContent: 'center', alignItems: 'center', maxWidth: (windowWidth / 2 - 25),
                                        shadowColor: '#000000',
                                        shadowOffset: { width: 0, height: 10 },
                                        shadowRadius: 5,
                                        shadowOpacity: offerDetails.paid ? 0.4 : 0,
                                        elevation: offerDetails.paid ? 5 : 0
                                    }}
                                >
                                    <Text style={{ color: '#202060', fontSize: 18 }}>DietPeeps</Text>
                                    <Text style={{ color: '#202060', fontSize: 22 }}>{offerDetails.name}</Text>
                                    <View style={{ alignItems: 'flex-start' }}>
                                    {offerDetails.offers.map((o, index) => (
                                        <View key={index} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                            <Icon
                                                name={'checkmark'}
                                                size={20}
                                                color={o.included ? '#4C44D4' : '#BDB9DB'}
                                            />
                                            <Text
                                                numberOfLines={1}
                                                adjustsFontSizeToFit
                                                style={{ fontSize: 14, color: o.included ? '#202060' : '#BDB9DB', maxWidth: (windowWidth / 2 - 25) - 40 }}
                                            >
                                                {o.offer}
                                            </Text>
                                        </View>
                                    ))}
                                    </View>
                                </MotiView>
                            ))}
                        </View>
                        <View style={{ height: 1.5, backgroundColor: '#202060', width: '100%', borderRadius: 2, marginVertical: 5 }} />
                        <View style={{ justifyContent: 'center', marginVertical: 10, alignItems: 'center' }}>
                            <Text style={{ fontSize: 18, color: '#202060', textAlign: 'center' }}>After making an account, you have the option to either</Text>
                            <TouchableOpacity
                                onPress={handleSubButtonPress}
                                style={[styles.ButtonSolidQB, { backgroundColor: 'transparent', opacity: 1, marginVertical: 10 }]}
                            >
                                <LinearGradient start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} colors={['#f9cd86', '#F7B852']} style={{ width: '100%', height: '100%', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={styles.panelButtonTitle}>{'Subscribe'}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <Text style={{ fontSize: 18, color: '#202060', textAlign: 'center' }}>or</Text>
                            <View style={styles.View_4v}>
                                <TouchableOpacity
                                    onPress={finishForm}
                                    style={[
                                        styles.ButtonSolidQB,
                                        { backgroundColor: '#4C44D4', marginTop: 10, marginBottom: 0 },
                                    ]}
                                >
                                    <Text style={styles.panelButtonText}>{'Start a 14-day free trial'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ height: 1.5, backgroundColor: '#202060', width: '100%', borderRadius: 2, marginVertical: 5 }} />
                        <View style={{ alignItems: 'center', marginVertical: 5 }}>
                            <Text numberOfLines={1} adjustsFontSizeToFit style={styles.panelTitle}>Weight Goal Guarantee</Text>
                            <Text numberOfLines={7} adjustsFontSizeToFit style={{ color: '#202060', textAlign: 'center', fontSize: 18 }}>
                                We are committed to ensuring all of our clients reach their designated weight goal. If you complete all the steps of the program and still don't reach your weight goal, you'll receive
                                <Text style={{ fontWeight: '700' }}> full recompensation. </Text>
                                That means you'll get
                                <Text style={{ fontWeight: '700' }}> all your money back.</Text>
                            </Text>
                        </View>
                        <View style={{ height: 1.5, backgroundColor: '#202060', width: '100%', borderRadius: 2, marginVertical: 5 }} />
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 50, color: '#202060', fontWeight: '700' }}>{NUM_PEOPLE_HELPED}</Text>
                            <Text style={{ fontSize: 40, color: '#202060', fontWeight: '700' }}> people</Text>
                        </View>
                        <View style={{ justifyContent: 'center' }}>
                            <Text style={{ fontSize: 18, color: '#202060', textAlign: 'center' }}>helped with reaching their weight loss goals.</Text>
                        </View>
                        {/* <View style={{ height: 1.5, backgroundColor: '#202060', width: '100%', borderRadius: 2, marginVertical: 5 }} /> */}
                        {/* <Text adjustsFontSizeToFit numberOfLines={2} style={[styles.loadingScreenText, { marginVertical: 20 }]}>
                            But don't just take our word for it!
                        </Text> */}
                    </View>
                    {/* <FlatList
                        style={{ marginVertical: 10 }}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={windowWidth}
                        decelerationRate='fast'
                        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                        data={testimonialsSecondBatch}
                        renderItem={({ item }) => (
                            <View key={item.displayName} style={{ width: windowWidth - 40, marginHorizontal: 20, padding: 10, borderRadius: 20, backgroundColor: '#fff', borderColor: '#202060', borderWidth: 1 }}>
                                <View style={{ position: 'absolute', top: 10, left: 10, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 5 }}>
                                    <ProfilePic source={{ uri: item.photoURL || 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png' }} size={40} />
                                    <Text style={{ fontWeight: '700', fontSize: 20, color: '#202060', marginLeft: 10 }}>{item.displayName}</Text>
                                </View>
                                <Text style={{ marginTop: 45, marginLeft: 5, fontWeight: '500', fontSize: 18, color: '#202060' }}>{item.testimonial}</Text>
                            </View>
                        )}
                        keyExtractor={(item) => item.displayName}
                    /> */}
                    {/* <View style={{ width: windowWidth, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ padding: 10, width: 110, justifyContent: 'center', flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, borderWidth: 1, borderColor: '#202060' }}>
                            {testimonialsSecondBatch.map((item, index) => (
                                <MotiView key={index} from={{ scale: 0, width: 10, backgroundColor: '#BDB9DB' }} animate={{ scale: 1, width: index === visibleT ? 20 : 10, backgroundColor: index === visibleT ? '#4C44D4' : '#BDB9DB' }} transition={{ type: 'timing' }} style={{ height: 10, borderRadius: 5, marginHorizontal: 5 }} />
                            ))}
                        </View>
                    </View> */}
                    <View style={{ width: windowWidth, paddingHorizontal: 20 }}>
                        <View style={{ height: 1.5, backgroundColor: '#202060', width: '100%', borderRadius: 2, marginTop: 10, marginBottom: 5 }} />
                        <Text style={[styles.loadingScreenText, { marginVertical: 20 }]}>
                            FAQs
                        </Text>
                        <View style={{ height: 1.5, backgroundColor: '#202060', width: '100%', borderRadius: 2, marginVertical: 5 }} />
                        {faq.map((question, index) => (
                            <React.Fragment key={index}>
                                <TouchableOpacity activeOpacity={0.8} onPress={() => toggle(index)} style={{ paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
                                    <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.loadingScreenText, { marginVertical: 20, fontSize: 25, maxWidth: '80%' }]}>
                                        {question.question}
                                    </Text>
                                    <Icon 
                                        name={dropdowns[index] === 1 ? 'chevron-down' : 'add'}
                                        size={40}
                                        color={'#202060'}
                                    />
                                </TouchableOpacity>
                                <AnimatePresence>
                                    {dropdowns[index] === 1 && 
                                        <MotiView
                                            from={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 200 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{
                                                type: 'timing',
                                                opacity: {
                                                    delay: 200,
                                                    duration: 200
                                                },
                                                height: {
                                                    duration: 200
                                                }
                                            }}
                                            exitTransition={{
                                                type: 'timing',
                                                opacity: {
                                                    duration: 200
                                                },
                                                height: {
                                                    delay: 200,
                                                    duration: 200
                                                }
                                            }}
                                            style={{
                                                paddingHorizontal: 10,
                                                marginVertical: 10
                                            }}
                                        >
                                            <Text numberOfLines={10} adjustsFontSizeToFit style={{ lineHeight: 20, fontSize: 18, color: '#202060', textAlign: 'left' }}>
                                                {question.answer}
                                            </Text>
                                        </MotiView>
                                    }
                                </AnimatePresence>
                                <View style={{ height: 1.5, backgroundColor: '#202060', width: '100%', borderRadius: 2, marginVertical: 5 }} />
                            </React.Fragment>
                        ))}
                        {/* <Text style={{ fontWeight: '600', fontSize: 20, color: '#202060', alignSelf: 'flex-start', marginBottom: 5 }}>
                            Phase 1 (2 weeks)
                        </Text>
                        <MotiText from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 18, color: '#202060', textAlign: 'left' }}>
                            What you eat greatly translates to how much you weigh. For the first two weeks, all you have to do is send photos of every meal. It will only take you five seconds. We will gradually help you clean up your diet, by proving feedback on your meals and encouraging you to eat clean and healthy.
                        </MotiText>
                        <View style={{ height: 1.5, backgroundColor: '#202060', width: '100%', borderRadius: 2, marginVertical: 5 }} />
                        <Text style={{ fontWeight: '600', fontSize: 20, color: '#202060', alignSelf: 'flex-start', marginBottom: 5 }}>
                            Phase 2 (12 weeks)
                        </Text>
                        <MotiText from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 18, color: '#202060', textAlign: 'left' }}>
                            This phase will last 4 months and you will continue to share your meal photos. We will introduce our daily nutrition courses to encourage better eating habits and change your relationship with food. On top of that, we have summarized the world's best-selling nutrition books so you can continue learning and improving your knowledge of nutrition and diet. In addition, we will help you incorporate physical activity into your routine. You should expect those extra pounds to start falling off.
                        </MotiText>
                        <View style={{ height: 1.5, backgroundColor: '#202060', width: '100%', borderRadius: 2, marginVertical: 5 }} />
                        <Text style={{ fontWeight: '600', fontSize: 20, color: '#202060', alignSelf: 'flex-start', marginBottom: 5 }}>
                            Phase 3 (6 weeks)
                        </Text>
                        <MotiText from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 18, color: '#202060', textAlign: 'left' }}>
                            Our coaches will be with you every step of the way. We stick around for one and a half months after you've reached your target weight to help you maintain your goal weight for the rest of your life.
                        </MotiText> */}
                    </View>
                </MotiView>
                <View style={{ margin: 50 }} />
            </ScrollView>
            <LinearGradient style={{ height: 50, bottom: 82 }} colors={['rgba(230,231,250,0)', 'rgba(230,231,250,1)']} />
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 500 }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', position: 'absolute', bottom: 0, width: windowWidth, backgroundColor: '#e6e7fa' }}>
                <TouchableOpacity
                    onPress={finishForm}
                    style={[
                        styles.ButtonSolidQB,
                        { backgroundColor: '#4C44D4', marginTop: 20, width: windowWidth - 64 },
                    ]}
                >
                    <Text style={styles.panelButtonText}>{'Start my 14-day free trial'}</Text>
                </TouchableOpacity>
            </MotiView>
        </>
    )
}

const UnitToggler = ({ style, buttonText, onToggleImperial }) => {
    return (
        <TouchableOpacity onPress={onToggleImperial} style={[styles.unitToggler, { ...style }]}>
            <Text style={styles.title1}>{buttonText}</Text>
        </TouchableOpacity>
    )
}

export { 
    IntroExplainerPage,
    WeightGoalSelectorPage, 
    OtherGoalSelectorPage, 
    GenderSelectorPage, 
    DateOfBirthSelectorPage, 
    HeightSelector,
    WeightSelector,
    MealCountSelectorPage,
    MealTimesSelectorPage,
    ReferralCodePage,
    WeightChartInterstitial,
    CoachProfilePage,
    TrialPricePage,
    WizardFinalPage,
    TestimonialInterstitial,
    UnitToggler,
    GoalExplainerPage,
    MealPhotoExplainerPage,
    PhotoPledgePage
}

const styles = StyleSheet.create({
    Image_9l: {
        height: '100%',
        width: '100%',
    },
    ViewWi: {
        minHeight: '50%',
        maxHeight: '50%',
    },
    TextOd: {
        marginRight: 6,
        fontSize: 18,
        lineHeight: 24,
        fontFamily: 'System',
        fontWeight: '700',
    },
    ViewvG: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
    },
    Textra: {
        textTransform: 'uppercase',
        fontFamily: 'System',
        fontWeight: '400',
        fontSize: 11,
        marginTop: 18,
    },
    TextBM: {
        fontSize: 12,
        lineHeight: 18,
        marginTop: 12,
    },
    TextO5: {
        marginTop: 16,
        marginTop: 24,
        textTransform: 'uppercase',
        fontFamily: 'System',
        fontWeight: '400',
        fontSize: 11,
    },
    TextG2: {
        fontSize: 10,
        fontFamily: 'System',
        fontWeight: '700',
    },
    ViewIr: {
        marginRight: 8,
        paddingBottom: 8,
        paddingTop: 8,
        paddingRight: 16,
        paddingLeft: 16,
    },
    ViewuK: {
        flexDirection: 'row',
        marginTop: 12,
    },
    ViewmY: {
        marginLeft: 18,
        marginRight: 18,
    },
    unitToggler: {
        alignItems: 'center', 
        justifyContent: 'center', 
        minWidth: windowHeight / 11, 
        height: windowHeight / 11, 
        borderRadius: 10, 
        backgroundColor: '#fff', 
        shadowColor: '#000000', 
        shadowOffset: { width: 0, height: 5 }, 
        shadowRadius: 5, 
        shadowOpacity: 0.4
    },
    ViewD2: {
        alignItems: 'center'
    },
    panelButtonTitle: {
        fontSize: 17,
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        color: 'white',
        textAlign: 'center',
        width: '100%'
    },
    ButtonSolidQB: {
        width: windowWidth - 64,
        height: 50,
        marginBottom: 12,
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#4C44D4',
        alignItems: 'center',
        marginVertical: 7,
    },
    View_4v: {
        alignItems: 'center',
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
        // position: 'absolute'
    },
    panelTitle: {
        fontSize: 27,
        height: 35,
        color: '#202060',
        marginBottom: 5,
        fontWeight: '700'
    }
})
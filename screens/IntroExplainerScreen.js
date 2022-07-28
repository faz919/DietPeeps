import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotiImage, MotiView } from "moti"
import FirstPageBackground from '../assets/first-page-background.jpeg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import ChatMessage from '../components/ChatMessage'
import PlatePhoto from '../assets/onboarding-plate-optional.png'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import { Easing } from 'react-native-reanimated'

const IntroExplainerScreen = ({ navigation }) => {

    const firstPageScrollViewRef = useRef()
    
    const [animationStep, setAnimationStep] = useState(0)

    const [introPage, setIntroPage] = useState(0)

    const pageChangeDelay = 700

    useEffect(() => {
        if (introPage === 1) {
            const stepOne = setTimeout(() => {
                setAnimationStep(1)
            }, 2000)
            const stepTwo = setTimeout(() => {
                setAnimationStep(2)
            }, 4000)
            const stepThree = setTimeout(() => {
                setAnimationStep(3)
            }, 6000)
            const stepFour = setTimeout(() => {
                setAnimationStep(4)
            }, 8000)
            return () => {
                clearTimeout(stepOne)
                clearTimeout(stepTwo)
                clearTimeout(stepThree)
                clearTimeout(stepFour)
            }
        }
    }, [introPage])

    const insets = useSafeAreaInsets()

    const onContinue = () => {
        navigation.navigate('Onboarding Wizard')
    }

    return (
        <MotiView
            style={{ flex: 1, backgroundColor: '#E6E7FA' }} 
            from={{ opacity: 1 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
        >
            <AnimatePresence exitBeforeEnter>
                {introPage === 0 && 
                    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={`introPage0`} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <MotiImage 
                            from={{ scale: 1 }} 
                            animate={{ scale: 1.1 }} 
                            transition={{
                                scale: {
                                    duration: 1000,
                                    easing: Easing.bezier(0, 0.55, 0.45, 1),
                                    type: 'timing'
                                }
                            }}
                            source={FirstPageBackground} 
                            style={{ position: 'absolute', resizeMode: 'cover', height: windowHeight, width: windowWidth }} 
                        />
                        <MotiView
                            from={{ translateY: -125 }}
                            animate={{ translateY: 0 }}
                            transition={{ 
                                duration: 500,
                                delay: 1500,
                                type: 'timing'
                            }}
                            style={{
                                position: 'absolute',
                                top: -97,
                                left: 22,
                                width: 212,
                                height: 222,
                                borderRadius: 111,
                                backgroundColor: '#6BE29B'
                            }}
                        />
                        <MotiView
                            from={{ translateY: -204 }}
                            animate={{ translateY: 0 }}
                            transition={{ 
                                duration: 500,
                                delay: 1800,
                                type: 'timing'
                            }}
                            style={{
                                position: 'absolute',
                                top: -18,
                                left: -106,
                                width: 212,
                                height: 222,
                                borderRadius: 111,
                                backgroundColor: '#6BE29B'
                            }}
                        />
                        <View style={{ top: windowHeight / 3 }}>
                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing' }}
                                delay={1000}
                                style={styles.ViewD2}
                            >
                                <Text
                                    adjustsFontSizeToFit
                                    numberOfLines={1}
                                    style={[
                                        styles.headline1,
                                        { color: '#3F3D53', marginBottom: 20, marginTop: 5, fontSize: windowHeight * (20 / 844), maxWidth: windowWidth - 64 },
                                    ]}
                                >
                                    {`A human diet coach in your pocket.`}
                                </Text>
                            </MotiView>
                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing' }}
                                delay={2500}
                                style={styles.ViewD2}
                            >
                                <TouchableOpacity
                                    onPress={() => setIntroPage(1)}
                                    style={[
                                        styles.ButtonSolidQB,
                                        { backgroundColor: '#6BE29B', marginTop: 0 },
                                    ]}
                                >
                                    <Text style={[styles.panelButtonText, { fontSize: 20 }]}>{'Get Started'}</Text>
                                </TouchableOpacity>
                            </MotiView>
                        </View>
                    </MotiView>
                }
                {introPage === 1 &&
                    <MotiView 
                        key={`introPage1`} 
                        from={{ opacity: 0, translateY: 0 }} 
                        animate={{ opacity: 1, translateY: 0 }} 
                        exit={{ opacity: 0, translateY: -20 }} 
                        transition={{ type: 'timing' }} 
                        style={{ flex: 1 }}
                    >
                        <SafeAreaView style={{ flex: 1, marginHorizontal: 20, justifyContent: 'center', alignItems: 'center' }}>
                            <MotiView
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                delay={pageChangeDelay}
                            >
                                <View style={styles.ViewD2}>
                                    <Text
                                        adjustsFontSizeToFit
                                        numberOfLines={2}
                                        style={[
                                            styles.headline1,
                                            { color: '#202060', marginBottom: 20, marginTop: 5 },
                                        ]}
                                    >
                                        {`DietPeeps gets you in touch with real human support. `}
                                    </Text>
                                </View>
                            </MotiView>
                            {/* <MotiView
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
                            </MotiView> */}
                            <ScrollView
                                ref={firstPageScrollViewRef}
                                onContentSizeChange={() => firstPageScrollViewRef.current.scrollToEnd({ duration: 1500, animated: true })}
                                overScrollMode={'never'}
                                bounces={false}
                                scrollEnabled
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                horizontal={false}
                                style={{ overflow: 'hidden', height: windowHeight * 0.4, width: windowWidth - 40 }}
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
                                delay={6000}
                            >
                                <View style={styles.ViewD2}>
                                    <Text
                                        adjustsFontSizeToFit
                                        numberOfLines={5}
                                        style={[
                                            styles.headline1,
                                            { color: '#202060', fontSize: windowHeight * (25 / 844) },
                                        ]}
                                    >
                                        {`Your personalized coach will guide you through small gradual changes to build a sustainable healthy diet and attain your ultimate goal. `}
                                    </Text>
                                </View>
                            </MotiView>
                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing' }}
                                delay={9000}
                                style={styles.ViewD2}
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
                        </SafeAreaView>
                    </MotiView>}
                {introPage === 2 &&
                    <MotiView 
                        key={`introPage2`} 
                        from={{ opacity: 0, translateY: 20 }} 
                        animate={{ opacity: 1, translateY: 0 }} 
                        exit={{ opacity: 0, translateY: -20 }} 
                        transition={{ type: 'timing', delay: pageChangeDelay }} 
                        exitTransition={{ type: 'timing', delay: 0 }} 
                        style={{ flex: 1 }}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                top: -97,
                                left: 22,
                                width: 212,
                                height: 222,
                                borderRadius: 111,
                                backgroundColor: '#6BE29B'
                            }}
                        />
                        <View
                            style={{
                                position: 'absolute',
                                top: -18,
                                left: -106,
                                width: 212,
                                height: 222,
                                borderRadius: 111,
                                backgroundColor: '#6BE29B'
                            }}
                        />
                        <SafeAreaView style={{ flex: 1, marginHorizontal: 20 }}>
                            <View style={styles.ViewD2}>
                                <Text
                                    adjustsFontSizeToFit
                                    numberOfLines={5}
                                    style={[
                                        styles.headline1,
                                        { color: '#202060', marginBottom: 20, marginTop: 5, fontSize: 20, marginTop: Platform.OS === 'ios' ? 204 - insets.top : 204 },
                                    ]}
                                >
                                    {`We’re going to redefine your relationship with food. All you have to do is send a snap of your meal and receive real-time feedback on what’s on your plate.`}
                                </Text>
                                <MotiImage 
                                    from={{ translateY: 20, opacity: 0 }} 
                                    animate={{ translateY: 0, opacity: 1 }} 
                                    transition={{ type: 'timing' }} 
                                    source={PlatePhoto} 
                                    style={{ resizeMode: 'contain', width: windowWidth - 40, height: windowHeight / 4 }} 
                                />
                                <Text
                                    adjustsFontSizeToFit
                                    numberOfLines={2}
                                    style={[
                                        styles.headline1,
                                        { color: '#202060', marginBottom: 20, fontSize: 20 },
                                    ]}
                                >
                                    {`Wondering how to complement your diet? `}
                                </Text>
                                <Text
                                    adjustsFontSizeToFit
                                    numberOfLines={1}
                                    style={[
                                        styles.headline1,
                                        { color: '#202060', marginBottom: 20, fontSize: 20 },
                                    ]}
                                >
                                    {`Your coach is a text away! `}
                                </Text>
                            </View>
                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing' }}
                                delay={pageChangeDelay + 1000}
                                style={styles.ViewD2}
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
                        </SafeAreaView>
                    </MotiView>}
            </AnimatePresence>
        </MotiView>
    )
}

export default IntroExplainerScreen

const styles = StyleSheet.create({
    ViewD2: {
        alignItems: 'center'
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
    headline1: {
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        fontSize: windowHeight * (30 / 844),
        letterSpacing: 0,
        textAlign: 'center',
        marginVertical: 20
    },
    panelButtonText: {
        fontSize: windowHeight * (17 / 844),
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        color: 'white',
    }
})
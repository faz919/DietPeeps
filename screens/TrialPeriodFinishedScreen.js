import { BlurView } from '@react-native-community/blur'
import { MotiView } from 'moti'
import React, { useContext } from 'react'
import { ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/Ionicons'
import badge from '../assets/badge.png'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import { Easing } from 'react-native-reanimated'
import LinearGradient from 'react-native-linear-gradient'
import { AuthContext } from '../navigation/AuthProvider'

// this is the screen that pops up in front of the chat when the user's trial period is finished
const TrialPeriodFinishedScreen = ({ navigation, showExtraDaysButton, giveExtraTrialDays }) => {

    const { mixpanel } = useContext(AuthContext)

    const insets = useSafeAreaInsets()

    const handleBadgePress = () => {
        mixpanel.track('Clicked Badge', { 'Screen': 'TrialPeriodFinishedScreen' })
        navigation.navigate('Subscription', { trialReminder: 'none' })
    }

    const handleSubButtonPress = () => {
        mixpanel.track('Clicked Subscribe Button')
        navigation.navigate('Subscription', { trialReminder: 'none' })
    }

    const handleExtensionPress = () => {
        mixpanel.track('Clicked Trial Extension Button')
        giveExtraTrialDays()
    }

    return (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, height: windowHeight, width: windowWidth, position: 'absolute' }}>
            <BlurView
                style={{ flex: 1, height: windowHeight, width: windowWidth, position: 'absolute' }}
                blurType="dark"
                blurAmount={10}
                reducedTransparencyFallbackColor="white"
            />
            <View style={{ flex: 1, height: windowHeight, width: windowWidth, position: 'absolute', justifyContent: 'center', alignItems: 'center', padding: 15 }}>
                <Icon
                    name='lock-closed'
                    size={windowWidth * 0.4}
                    color='#848299'
                />
                <Text style={{ fontSize: 18, color: '#fff', textAlign: 'center' }}>Your free trial has expired. Become a Subscriber to DietPeeps to enable the chat with your personal coach.</Text>
                <TouchableOpacity
                    onPress={handleSubButtonPress}
                    style={[styles.ButtonSolidQB, { backgroundColor: 'transparent', opacity: 1 }]}
                >
                    <LinearGradient start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} colors={['#f9cd86', '#F7B852']} style={{ width: '100%', height: '100%', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.panelButtonTitle}>{'Subscribe'}</Text>
                    </LinearGradient>
                </TouchableOpacity>
                {showExtraDaysButton &&
                    <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }} onPress={handleExtensionPress}>
                        <Text style={styles.panelButtonText}>{'Give me a few extra days'}</Text>
                    </TouchableOpacity>}
            </View>
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} delay={2000} transition={{ duration: 350 }} style={{ position: 'absolute', top: Platform.OS === 'ios' ? insets.top + 10 : 10, right: 20 }}>
                <TouchableOpacity onPress={handleBadgePress} style={styles.subBadgeContainer}>
                    <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} delay={1700} transition={{ translateY: { type: 'timing', duration: 400, easing: Easing.bezier(.56, -0.01, 0, .98) }, opacity: { type: 'timing', delay: 1850 } }} style={{ justifyContent: 'center', alignItems: 'center', width: 50, height: 50 }} >
                        <ImageBackground source={badge} style={{ width: 50, height: 50, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }} imageStyle={{ width: 50, height: 50, resizeMode: 'contain' }}>
                            <MotiView from={{ translateX: 250, translateY: 250, rotateZ: '-45deg' }} animate={{ translateX: -250, translateY: -250, rotateZ: '-45deg' }} delay={3000} transition={{ loop: true, repeatReverse: false, duration: 5000, type: 'timing' }} style={{ opacity: 0.5, backgroundColor: '#fff', width: 100, height: 20, transform: [{ rotateZ: '-45deg' }] }} />
                        </ImageBackground>
                    </MotiView>
                </TouchableOpacity>
            </MotiView>
        </MotiView>
    )
}

const styles = StyleSheet.create({
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
    ButtonSolidQB: {
        width: '100%',
        height: 50,
        marginTop: 25,
        marginVertical: 12,
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#4C44D4',
        alignItems: 'center',
    },
    panelButtonText: {
        fontSize: 16,
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        color: '#fff',
        textAlign: 'center',
        width: '100%'
    }
})

export default TrialPeriodFinishedScreen
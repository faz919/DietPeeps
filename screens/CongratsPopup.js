import React, { useContext, useEffect, useState } from 'react'
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import Modal from 'react-native-modal'
import ImagePicker from 'react-native-image-crop-picker'
import { AuthContext } from '../navigation/AuthProvider'
import { AnimatePresence, MotiImage, MotiView } from 'moti'
import ConfettiCannon from 'react-native-confetti-cannon'
import { Easing } from 'react-native-reanimated'
import badge from '../assets/badge.png'

const CongratsPopup = ({ navigation, route }) => {

    const { congratsType } = route.params

    const [hideAnim, startHideAnim] = useState(false)
    let congratsTitle, congratsMessage

    // show different text depending on what kind of action happened
    switch (congratsType) {
        case 'courseDayCompletion':
            congratsTitle = 'Congratulations!'
            congratsMessage = "You completed today's courses!"
            break
        case 'imageSent':
            congratsTitle = 'Good job!'
            congratsMessage = 'Another day, another image! Keep it going!'
            break
        case 'subscribed':
            congratsTitle = 'Welcome to DietPeeps!'
            congratsMessage = "We're so glad to have you here!"
            break
        case 'weighedIn':
            congratsTitle = 'Way to go!'
            congratsMessage = 'Good job on weighing in today!'
            break
        case 'paidForTrial':
            congratsTitle = 'Thanks!'
            congratsMessage = 'Thanks so much for supporting DietPeeps!'
        default:
            congratsTitle = 'Well done!'
            congratsMessage = "Keep up the good work!"
            break
    }

    useEffect(() => {
        if (hideAnim) {
            setTimeout(() => {
                navigation.pop()
            }, 300)
        }
    }, [hideAnim])

    return (
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <AnimatePresence>
                {!hideAnim &&
                    <>
                        <MotiView key='popup' from={{ translateY: 400 }} animate={{ translateY: 0 }} exit={{ translateY: 800 }} transition={{ duration: 300 }}
                            style={{
                                width: windowWidth * 0.9, height: windowHeight * 0.55, borderRadius: 10, backgroundColor: '#fff', padding: 15, alignItems: 'center', justifyContent: 'center', elevation: 10,
                                shadowColor: '#000000',
                                shadowOffset: { width: 0, height: 0 },
                                shadowRadius: 10,
                                shadowOpacity: 0.4,
                            }}>
                            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 4 }}>
                                <MotiImage source={badge} from={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} delay={500}
                                    style={{ height: windowWidth * 0.4, resizeMode: 'contain' }}
                                />
                            </View>
                            <View style={{ justifyContent: 'flex-end', flex: 2 }}>
                                <Text style={{ color: '#202060', fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', fontSize: 26, textAlign: 'center', marginTop: windowHeight / 14 }}>{congratsTitle}</Text>
                                <Text style={{ color: '#BDB9DB', fontSize: 16, textAlign: 'center' }}>{congratsMessage}</Text>
                                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1500 }} style={styles.View_4v}>
                                    <TouchableOpacity
                                        onPress={() => startHideAnim(true)}
                                        style={[
                                            styles.ButtonSolidQB,
                                            { backgroundColor: '#4C44D4', marginTop: 20 },
                                        ]}
                                    >
                                        <Text style={styles.panelButtonText}>{'Awesome!'}</Text>
                                    </TouchableOpacity>
                                </MotiView>
                            </View>
                        </MotiView>
                        {/* show confetti only if iOS. confetti lags big time on android. need to find a different package */}
                        {Platform.OS === 'ios' && <ConfettiCannon count={200} origin={{ x: windowWidth / 2, y: 0 }} fallSpeed={1500} fadeOut explosionSpeed={450} />}
                    </>
                }
            </AnimatePresence>
        </View>
        // 
    )
}

const styles = StyleSheet.create({
    View_4v: {
        alignItems: 'center',
    },
    ButtonSolidQB: {
        width: windowWidth * 0.8,
        height: 50,
        marginBottom: 12,
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#4C44D4',
        alignItems: 'center',
        marginVertical: 7,
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 5,
        shadowOpacity: 0.4,
    },
    panelButtonText: {
        fontSize: windowHeight * (17 / 844),
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        color: 'white',
    },
})

export default CongratsPopup
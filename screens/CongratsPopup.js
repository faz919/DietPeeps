import React, { useContext, useEffect, useState } from 'react'
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import Modal from 'react-native-modal'
import ImagePicker from 'react-native-image-crop-picker'
import { AuthContext } from '../navigation/AuthProvider'
import { AnimatePresence, MotiImage, MotiView } from 'moti'
import ConfettiCannon from 'react-native-confetti-cannon'
import { Easing } from 'react-native-reanimated'
import ribbon from '../assets/ribbon.png'

const CongratsPopup = ({ navigation }) => {

    const [attachingImage, setAttachingImage] = useState({})

    const { setGlobalVars } = useContext(AuthContext)

    return (
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            {/* <AnimatePresence> */}
                <MotiView from={{ translateY: 400 }} animate={{ translateY: 0 }} exit={{ translateY: 400 }} transition={{ duration: 300 }}
                style={{
                    width: windowWidth * 0.9, height: windowHeight * 0.55, borderRadius: 10, backgroundColor: '#fff', padding: 15, alignItems: 'center', justifyContent: 'center', elevation: 10,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 10,
                    shadowOpacity: 0.4,
                }}>
                    <MotiImage source={ribbon} from={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} delay={500}
                        style={{ height: windowWidth * 0.4, resizeMode: 'contain' }}
                    />
                    <Text style={{ color: '#202060', fontWeight: 'bold', fontSize: 26, textAlign: 'center', marginTop: windowHeight / 14 }}>Congratulations!</Text>
                    <Text style={{ color: '#BDB9DB', fontSize: 16, textAlign: 'center' }}>You completed today's courses!</Text>
                    <View style={styles.View_4v}>
                        <TouchableOpacity
                            onPress={() => navigation.pop()}
                            style={[
                                styles.ButtonSolidQB,
                                { backgroundColor: '#4C44D4', marginTop: 20 },
                            ]}
                        >
                            <Text style={styles.panelButtonText}>{'Continue'}</Text>
                        </TouchableOpacity>
                    </View>
                </MotiView>
                {Platform.OS === 'ios' && <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} />}
                {/* </AnimatePresence> */}
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
        fontSize: windowHeight * (17/844),
        fontWeight: 'bold',
        color: 'white',
    },
})

export default CongratsPopup
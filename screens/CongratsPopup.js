import React, { useContext, useEffect, useState } from 'react'
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { windowWidth } from '../utils/Dimensions'
import Modal from 'react-native-modal'
import ImagePicker from 'react-native-image-crop-picker'
import { AuthContext } from '../navigation/AuthProvider'
import { MotiView } from 'moti'
import ConfettiCannon from 'react-native-confetti-cannon'

const CongratsPopup = ({ navigation }) => {

    const [attachingImage, setAttachingImage] = useState({})

    const { setGlobalVars } = useContext(AuthContext)

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            const screenTimer = setTimeout(() => {
                navigation.pop()
            }, 5000)
        })
        return unsubscribe
    }, [navigation])

    return (
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color:'#202060' }}>good job brodie</Text>
            <ConfettiCannon count={200} origin={{x: -10, y: 0}} />
        </View>
    )
}

const styles = StyleSheet.create({

})

export default CongratsPopup
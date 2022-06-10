import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { View, TouchableOpacity, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// back button that hangs in the top left corner of the screen, with respect to iOS safe area context. allow customization of color, size, and style
const BackButton = ({navigation , color, size, style}) => {

    const insets = useSafeAreaInsets()

    return (
        <View style={[{position: 'absolute', top: Platform.OS === 'ios' ? insets.top + 30 : 30, left: 30} ,{...style}]}>
            <TouchableOpacity onPress={() => navigation.pop()}>
                <Ionicons 
                    name='ios-arrow-back-circle-outline'
                    size={size || 30}
                    color={color || '#202060'}
                />
            </TouchableOpacity>
        </View>
    )
}

export default BackButton
import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { View, TouchableOpacity, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
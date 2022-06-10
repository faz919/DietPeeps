import { BlurView } from '@react-native-community/blur'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { MotiView } from 'moti'
import React from 'react'
import { View, Text } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { windowHeight, windowWidth } from '../utils/Dimensions'

// this is the screen that pops up when the user is flagged (for being under 18, or manually)
export default function UserFlaggedScreen() {

    const bottomBarHeight = useBottomTabBarHeight()

    return (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, height: windowHeight, width: windowWidth, position: 'absolute' }}>
            <BlurView
                style={{ flex: 1, height: windowHeight, width: windowWidth, position: 'absolute' }}
                blurType="dark"
                blurAmount={10}
                reducedTransparencyFallbackColor="white"
            />
            <View style={{ flex: 1, height: windowHeight - bottomBarHeight, width: windowWidth, position: 'absolute', justifyContent: 'center', alignItems: 'center', padding: 15 }}>
                <Icon
                    name='lock-closed'
                    size={windowWidth * 0.4}
                    color='#848299'
                />
                <Text style={{ fontSize: 18, color: '#fff', textAlign: 'center' }}>Unfortunately, we are unable to serve users under the age of 18. Although our coaches cannot help you, you may feel free to complete our daily courses.</Text>
            </View>
        </MotiView>
    )
}


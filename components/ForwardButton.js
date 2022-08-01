import React from 'react'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { windowHeight } from '../utils/Dimensions'

export default ForwardButton = ({ onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                width: windowHeight * (70 / 844),
                height: windowHeight * (70 / 844),
                backgroundColor: '#202060',
                borderColor: '#fff',
                borderWidth: 3,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: windowHeight * (35 / 844),
                elevation: 5,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 5 },
                shadowRadius: 5,
                shadowOpacity: 0.3
            }}
        >
            <Icon
                name={'md-arrow-forward-sharp'}
                size={windowHeight * (35 / 844)}
                color={'#fff'}
            />
        </TouchableOpacity>
    )
}
import React from 'react'
import { Share, Text, TouchableOpacity, View } from 'react-native'

// create a menu MessageOptions with options Reply, Copy, and Share. export default MessageOptions
export default function MessageOptions({ message }) {
    return (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => {
                
            }}>
                <Text style={{ fontSize: 18, color: '#848299' }}>Reply</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                
            }}>
                <Text style={{ fontSize: 18, color: '#848299' }}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                Share.share({ message: message.msg })
            }}>
                <Text style={{ fontSize: 18, color: '#848299' }}>Share</Text>
            </TouchableOpacity>
        </View>
    )
}

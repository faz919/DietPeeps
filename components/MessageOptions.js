import React, { useContext, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Share from 'react-native-share'
import Clipboard from '@react-native-clipboard/clipboard'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { AuthContext } from '../navigation/AuthProvider'

export default function MessageOptions({ message, handleReply, style }) {

    const { user, setGlobalVars, mixpanel } = useContext(AuthContext)

    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        Clipboard.setString(message.msg)
        setCopied(true)
        mixpanel.track('Button Press', { 'Button': 'CopyChatMessage' })
        setTimeout(() => {
            setGlobalVars(val => ({ ...val, selectedMessage: null }))
        }, 700)
    }

    async function getBase64(url) {
        const data = await fetch(url)
        const blob = await data.blob()
        return new Promise(resolve => {
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onloadend = () => {
                const base64data = reader.result
                resolve(base64data)
            }
        })
    }

    const [urlList, setUrlList] = useState([])
    const handleShare = () => {
        setUrlList([])
        mixpanel.track('Button Press', { 'Button': 'ShareChatMessage' })
        if (message.img != null && message.img?.length > 0) {
            for (let image of message.img) {
                getBase64(image.url).then((base64) => {
                    setUrlList(val => [...val, base64])
                }).catch((e) => console.error(e))
            }
        }
        const shareOptions = { 
            message: message.msg ? `Check out this message from DietPeeps: ${message.msg}` : (message.img[0].graded ? `Check this out! My DietPeeps coach scored my meal and my score was ${message.img[0].grade}!` : message.userID === user.uid ? message.img?.length > 1 ? 'Check out these images from DietPeeps!' : 'Check out this image from DietPeeps!' : 'Check out this image from my DietPeeps coach!'), 
            urls: urlList
        }
        Share.open(shareOptions)
    }

    return (
        <View style={[styles.container, { ...style }]}>
            <TouchableOpacity style={[styles.option, styles.reply]} onPress={() => handleReply(message)}>
                <MaterialCommunityIcons name="reply" size={24} color="#202060" />
                <View style={{ justifyContent: 'flex-start', width: 70 }}>
                    <Text style={{ fontSize: 18, color: '#202060' }}>Reply</Text>
                </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            {message.msg != null && message.msg?.length > 0 && <>
                <TouchableOpacity style={[styles.option, styles.copy]} onPress={handleCopy}>
                    {copied ?
                        <Ionicons name="checkmark-circle" size={20} color='#32ad32' /> :
                        <MaterialCommunityIcons name="content-copy" size={24} color="#202060" />}
                    <View style={{ justifyContent: 'flex-start', width: 70 }}>
                        <Text style={{ fontSize: 18, color: copied ? '#32ad32' : '#202060' }}>{copied ? 'Copied!' : 'Copy'}</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.divider} />
            </>}
            <TouchableOpacity style={[styles.option, styles.share]} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="#202060" />
                <View style={{ justifyContent: 'flex-start', width: 70 }}>
                    <Text style={{ fontSize: 18, color: '#202060' }}>Share</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center', 
        alignItems: 'center'
    },
    option: {
        backgroundColor: '#E6E7FA',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row',
        minHeight: 35,
        padding: 5,
        width: 120,
    },
    reply: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    divider: {
        backgroundColor: '#202060',
        height: 2,
        width: 120
    },
    copy: {

    },
    share: {
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    }
})

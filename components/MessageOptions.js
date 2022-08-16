import React, { useContext, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Share from 'react-native-share'
import Clipboard from '@react-native-clipboard/clipboard'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { AuthContext } from '../navigation/AuthProvider'
import { MotiView } from 'moti'

export default function MessageOptions({ message, handleReply, style, outgoing }) {

    const { user, setGlobalVars, mixpanel } = useContext(AuthContext)

    const [copied, setCopied] = useState(false)

    // copy the message to clipboard, and then autohide the message options screen
    const handleCopy = () => {
        Clipboard.setString(message.msg)
        setCopied(true)
        mixpanel.track('Button Press', { 'Button': 'CopyChatMessage' })
        setTimeout(() => {
            setGlobalVars(val => ({ ...val, selectedMessage: null }))
        }, 700)
    }

    // get base64 of the image so that user can share it to other apps. MUST be done here because string is usually too large to store in firestore
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

    const [loadingShare, setLoadingShare] = useState(false)

    const [urlList, setUrlList] = useState([])
    const handleShare = async () => {
        setLoadingShare(true)
        setUrlList([])
        mixpanel.track('Button Press', { 'Button': 'ShareChatMessage' })
        // get the base64 of each image
        if (message.img != null && message.img?.length > 0) {
            for (let image of message.img) {
                const base64 = await getBase64(image.url)
                console.log(base64.length)
                setUrlList(val => [...val, base64])
            }
        }
        // set share options with custom messages if there are none
        const shareOptions = { 
            message: message.msg ? `Check out this message from Personal Diet Coach: ${message.msg}` : (message.img[0].graded ? `Check this out! My Personal Diet Coach scored my meal and my score was ${message.img[0].grade}!` : message.userID === user.uid ? message.img?.length > 1 ? 'Check out these images from Personal Diet Coach!' : 'Check out this image from Personal Diet Coach!' : 'Check out this image from my Personal Diet Coach!'), 
            urls: urlList
        }
        // share data
        Share.open(shareOptions)
        // console.log(urlList)
        setLoadingShare(false)
    }

    return (
        <MotiView style={[styles.container, { ...style }]}>
            <TouchableOpacity style={[styles.option, styles.reply]} onPress={() => handleReply(message)}>
                <MaterialCommunityIcons name="reply" size={24} color="#202060" />
                <View style={{ justifyContent: 'flex-start', width: 70 }}>
                    <Text style={{ fontSize: 18, color: '#202060' }}>Reply</Text>
                </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            {/* if there's no text in the message, don't show the 'Copy' option, since there's nothing to copy. */}
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
            <TouchableOpacity disabled={loadingShare} style={[styles.option, styles.share, { opacity: loadingShare ? 0.5 : 1 }]} onPress={handleShare}>
                {loadingShare ? 
                    <ActivityIndicator
                        size={24}
                        color='#202060'
                    />
                    : 
                    <Ionicons name="share-outline" size={24} color="#202060" />
                }
                <View style={{ justifyContent: 'flex-start', width: 70 }}>
                    <Text style={{ fontSize: 18, color: '#202060' }}>Share</Text>
                </View>
            </TouchableOpacity>
        </MotiView>
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

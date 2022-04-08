import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'
import Video from 'react-native-video'
import { windowHeight, windowWidth } from '../utils/Dimensions'

const IntroVideo = ({ navigation }) => {

    const [videoPlaying, setVideoPlaying] = useState(false)
    const [showSkip, setShowSkip] = useState(false)

    useEffect(() => {
        videoPlaying ? setTimeout(() => {
            setShowSkip(true)
        }, 10000) : null
    }, [videoPlaying])

    return (
        <View style={{ flex: 1, backgroundColor: '#e6e7fa' }}>
            {windowHeight / windowWidth === 2 ?
                <Video
                    source={require('../assets/intro-video-18-9.mp4')}
                    style={styles.introVideo}
                    fullscreen={true}
                    fullscreenOrientation={'portrait'}
                    fullscreenAutorotate={false}
                    onLoad={() => setVideoPlaying(true)}
                    onEnd={() => navigation.replace('Onboarding')}
                    resizeMode='contain'
                    ignoreSilentSwitch='ignore'
                />
                :
                <Video
                    source={require('../assets/intro-video-16-9.mp4')}
                    style={styles.introVideo}
                    fullscreen={true}
                    fullscreenOrientation={'portrait'}
                    fullscreenAutorotate={false}
                    onLoad={() => setVideoPlaying(true)}
                    onEnd={() => navigation.replace('Onboarding')}
                    resizeMode='contain'
                    ignoreSilentSwitch='ignore'
                />
            }
            {showSkip ?
                <TouchableOpacity style={styles.panelButton} onPress={() => navigation.replace('Onboarding')}>
                    <Text style={styles.panelButtonTitle}>{'Skip'}</Text>
                </TouchableOpacity>
                : null}
        </View>
    )
}

const styles = StyleSheet.create({
    introVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    panelButton: {
        padding: 13,
        borderRadius: 10,
        backgroundColor: '#4C44D4',
        alignItems: 'center',
        marginVertical: 7,
        position: 'absolute',
        width: '25%',
        alignSelf: 'flex-end',
        right: 15,
        bottom: 25
    },
    panelButtonTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white',
    },
})

export default IntroVideo
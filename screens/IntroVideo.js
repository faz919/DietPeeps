import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, Text, View, ActivityIndicator } from 'react-native'
import Video from 'react-native-video'
import { windowHeight, windowWidth } from '../utils/Dimensions'

// currently not being used as intro video is being remade
const IntroVideo = ({ navigation }) => {

    const [videoPlaying, setVideoPlaying] = useState(false)
    const [buffering, setBuffering] = useState(false)
    const [showSkip, setShowSkip] = useState(false)

    useEffect(() => {
        if (videoPlaying) {
            const skipButtonTimer = setTimeout(() => {
                setShowSkip(true)
            }, 20000)
            return () => clearTimeout(skipButtonTimer)
        }
    }, [videoPlaying])

    return (
        <View style={{ flex: 1, backgroundColor: '#e6e7fa' }}>
            {windowHeight / windowWidth === (16/9) ?
                <Video
                    source={{ uri: 'https://dp191919.s3.us-east-2.amazonaws.com/lowres.mp4'}}
                    style={styles.introVideo}
                    fullscreen
                    fullscreenOrientation={'portrait'}
                    fullscreenAutorotate={false}
                    onLoad={() => setVideoPlaying(true)}
                    onEnd={() => navigation.replace('Onboarding')}
                    resizeMode='contain'
                    ignoreSilentSwitch='ignore'
                    bufferConfig={{
                        minBufferMS: 500,
                        maxBufferMS: 50000
                    }}
                />
                :
                <Video
                    source={{ uri: 'https://dp191919.s3.us-east-2.amazonaws.com/highres.mp4'}}
                    style={styles.introVideo}
                    fullscreen
                    fullscreenOrientation={'portrait'}
                    fullscreenAutorotate={false}
                    onLoad={() => setVideoPlaying(true)}
                    onEnd={() => navigation.replace('Onboarding')}
                    resizeMode='contain'
                    ignoreSilentSwitch='ignore'
                    bufferConfig={{
                        minBufferMS: 500,
                        maxBufferMS: 50000
                    }}
                />
            }
            {showSkip ?
                <TouchableOpacity style={styles.panelButton} onPress={() => navigation.replace('Onboarding')}>
                    <Text style={styles.panelButtonTitle}>{'Skip'}</Text>
                </TouchableOpacity>
                : null}
            {buffering && 
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size={60} color="#BDB9DB" />
                </View>
            }
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
        height: windowHeight / 17,
        justifyContent: 'center',
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
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        color: 'white',
        textAlign: 'center',
        width: '100%'
    },
})

export default IntroVideo
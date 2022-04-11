import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, Text, View, ActivityIndicator } from 'react-native'
import Video from 'react-native-video'
import { windowHeight, windowWidth } from '../utils/Dimensions'

const IntroVideo = ({ navigation }) => {

    const [videoPlaying, setVideoPlaying] = useState(false)
    const [buffering, setBuffering] = useState(false)
    const [showSkip, setShowSkip] = useState(false)

    useEffect(() => {
        videoPlaying && setTimeout(() => {
            setShowSkip(true)
        }, 20000)
    }, [videoPlaying])

    return (
        <View style={{ flex: 1, backgroundColor: '#e6e7fa' }}>
            {windowHeight / windowWidth === 2 ?
                <Video
                    source={{ uri: 'https://dp191919.s3.us-east-2.amazonaws.com/highres.mp4'}}
                    style={styles.introVideo}
                    fullscreen={true}
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
                    source={{ uri: 'https://dp191919.s3.us-east-2.amazonaws.com/lowres.mp4'}}
                    style={styles.introVideo}
                    fullscreen={true}
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
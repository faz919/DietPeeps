import React, { useContext, useEffect, useState } from 'react'
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import Modal from 'react-native-modal'
import ImagePicker from 'react-native-image-crop-picker'
import { AuthContext } from '../navigation/AuthProvider'
import analytics from '@react-native-firebase/analytics'
import crashlytics from '@react-native-firebase/crashlytics'

const CameraModal = ({ navigation }) => {

    const [attachingImage, setAttachingImage] = useState({})

    const { user, setGlobalVars } = useContext(AuthContext)

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            setAttachingImage(val => ({ ...val, visible: true}))
        })
        return unsubscribe
    }, [navigation])

    const takePhotoFromCamera = () => {
        analytics().logEvent('opened_camera', {
            userID: user.uid,
            timestamp: new Date()
        })
        setAttachingImage(val => ({ ...val, loading: true }))
        setGlobalVars(val => ({...val, autoSend: true}))
        ImagePicker.openCamera({
            cropping: false,
            includeExif: true,
            compressImageMaxHeight: 512,
            forceJpg: true,
            // includeBase64: true
        }).then((i) => {
            navigation.navigate('Main Menu', { screen: 'Coach', params: { imageInfo: [{
                uri: i.path,
                width: i.width,
                height: i.height,
                mime: i.mime,
                // base64: i.data,
                fileSize: i.size
            }] } })
        }).catch((e) => {
            if (e.code !== 'E_PICKER_CANCELLED') {
                crashlytics().recordError(e)
                console.error('error while taking photo: ', e.message)
            }
            if (e.code === 'E_NO_CAMERA_PERMISSION') {
                Alert.alert(
                    'We need your permission',
                    'Please allow camera access in your app settings.',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => Alert.alert(
                                'Are you sure?',
                                'This app requires you to send photos of your meals.',
                                [
                                    {
                                        text: 'Cancel',
                                        style: 'cancel'
                                    },
                                    {
                                        text: 'Go to Settings',
                                        onPress: () => Linking.openSettings()
                                    }
                                ]
                            ),
                            style: 'cancel'
                        },
                        {
                            text: 'Go to Settings',
                            onPress: () => Linking.openSettings()
                        }
                    ]
                )
            }
            setAttachingImage(val => ({ ...val, loading: false }))
        })
    }

    const choosePhotosFromLibrary = () => {
        analytics().logEvent('opened_photo_library', {
            userID: user.uid,
            timestamp: new Date()
        })
        setAttachingImage(val => ({ ...val, loading: true }))
        ImagePicker.openPicker({
            multiple: true,
            includeExif: true,
            compressImageMaxHeight: 512,
            forceJpg: true,
            // includeBase64: true
        }).then((imageData) => {
            navigation.navigate('Main Menu', { screen: 'Coach', params: { imageInfo: imageData.map((i) => {
                return {
                    uri: i.path,
                    width: i.width,
                    height: i.height,
                    mime: i.mime,
                    // base64: i.data,
                    fileSize: i.size
                }
            }) } })
        }).catch((e) => {
            if (e.code !== 'E_PICKER_CANCELLED') {
                crashlytics().recordError(e)
                console.error('error while choosing photos from library: ', e.message)
            }
            if (e.code === 'E_NO_LIBRARY_PERMISSION') {
                Alert.alert(
                    'We need your permission',
                    'Please allow photo library access in your app settings.',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => Alert.alert(
                                'Are you sure?',
                                'This app requires you to send photos of your meals.',
                                [
                                    {
                                        text: 'Cancel',
                                        style: 'cancel'
                                    },
                                    {
                                        text: 'Go to Settings',
                                        onPress: () => Linking.openSettings()
                                    }
                                ]
                            ),
                            style: 'cancel'
                        },
                        {
                            text: 'Go to Settings',
                            onPress: () => Linking.openSettings()
                        }
                    ]
                )
            }
            setAttachingImage(val => ({ ...val, loading: false }))
        })
    }

    return (
        <Modal
            isVisible={attachingImage.visible}
            avoidKeyboard={true}
            onBackButtonPress={() => { setAttachingImage(val => ({ ...val, visible: false, loading: false })) }}
            useNativeDriverForBackdrop
            onBackdropPress={() => { setAttachingImage(val => ({ ...val, visible: false, loading: false })) }}
            onSwipeComplete={() => { setAttachingImage(val => ({ ...val, visible: false, loading: false })) }}
            swipeDirection={['down']}
            swipeThreshold={50}
            animationInTiming={400}
            animationOutTiming={400}
            onModalHide={() => navigation.goBack()}
        >
            <View style={styles.panel}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.panelTitle}>Choose Photos</Text>
                    <Text style={styles.panelSubtitle}>Take one photo, or choose up to five from camera roll.</Text>
                </View>
                <TouchableOpacity style={styles.panelButton} onPress={takePhotoFromCamera}>
                    <Text style={styles.panelButtonTitle}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.panelButton} onPress={choosePhotosFromLibrary}>
                    <Text style={styles.panelButtonTitle}>Choose Photos From Library</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.panelButton}
                    onPress={() => { setAttachingImage(val => ({ ...val, visible: false, loading: false })) }}>
                    <Text style={styles.panelButtonTitle}>Cancel</Text>
                </TouchableOpacity>
                {attachingImage.loading ?
                    <View style={styles.modalLoading}>
                        <ActivityIndicator size={35} color="#BDB9DB" />
                    </View>
                    : null}
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    panel: {
        padding: 20,
        backgroundColor: '#E6E7FA',
        paddingTop: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 5,
        shadowOpacity: 0.4,
        width: windowWidth,
        position: 'absolute',
        margin: -20,
        bottom: 0,
        height: 300
    },
    panelTitle: {
        fontSize: 27,
        height: 35,
        color: '#202060'
    },
    panelSubtitle: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'center',
        marginBottom: 10,
    },
    panelButton: {
        height: windowHeight / 17,
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#4C44D4',
        alignItems: 'center',
        marginVertical: 7,
    },
    panelButtonTitle: {
        fontSize: 17,
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        color: 'white',
        textAlign: 'center',
        width: '100%'
    },
    modalLoading: {
        position: 'absolute',
        width: windowWidth,
        height: 320,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: 'rgba(32,32,96,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default CameraModal
import React, { useContext, useEffect, useState } from 'react'
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import Modal from 'react-native-modal'
import { Picker } from '@react-native-picker/picker'

import { AuthContext } from '../navigation/AuthProvider'
import firestore from '@react-native-firebase/firestore'
import analytics from '@react-native-firebase/analytics'

const WeighInModal = ({ navigation }) => {

    const { user, globalVars, updateInfo } = useContext(AuthContext)

    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [weight, setWeight] = useState({
        kgs: globalVars.userData.userBioData.weight.kgs,
        lbs: globalVars.userData.userBioData.weight.lbs
    })
    const [imperial, useImperial] = useState(globalVars.userData.usesImperial || true)

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            setVisible(true)
        })
        return unsubscribe
    }, [navigation])

    const weighIn = async () => {
        setLoading(true)
        if (globalVars.userData.weightHistory?.length >= 30) {
            let newWeightHistory = globalVars.userData.weightHistory
            newWeightHistory.shift()
            updateInfo({
                weightHistory: newWeightHistory
            })
        }
        updateInfo({
            weightHistory: firestore.FieldValue.arrayUnion({ weight: { kgs: weight.kgs, lbs: weight.lbs }, time: firestore.Timestamp.fromDate(new Date()) }),
            lastWeighIn: firestore.Timestamp.fromDate(new Date()),
            userBioData: {
                weight: {
                    kgs: weight.kgs,
                    lbs: weight.lbs
                }
            },
            usesImperial: imperial
        })
        await analytics().logEvent('message', {
            msg: imperial ? `Hey coach! Today I weighed in at ${weight.lbs} lbs (${weight.kgs} kgs).` : `Hey coach! Today I weighed in at ${weight.kgs} kgs (${weight.lbs} lbs).`,
            img: null,
            timeSent: firestore.Timestamp.fromDate(new Date()),
            userID: user.uid
        }).catch((e) => {
            console.error('error while uploading message data to analytics: ', e)
        })
        await firestore()
            .collection('chat-rooms')
            .doc(globalVars.chatID)
            .collection('chat-messages')
            .add({
                msg: imperial ? `Hey coach! Today I weighed in at ${weight.lbs} lbs (${weight.kgs} kgs).` : `Hey coach! Today I weighed in at ${weight.kgs} kgs (${weight.lbs} lbs).`,
                img: null,
                timeSent: firestore.Timestamp.fromDate(new Date()),
                userID: user.uid,
            })
            .catch((e) => {
                console.error("error while adding chat message: ", e)
            })
        await firestore()
            .collection('chat-rooms')
            .doc(globalVars.chatID)
            .set({
                latestMessageTime: firestore.Timestamp.fromDate(new Date()),
                latestMessage: imperial ? `Hey coach! Today I weighed in at ${weight.lbs} lbs (${weight.kgs} kgs).` : `Hey coach! Today I weighed in at ${weight.kgs} kgs (${weight.lbs} lbs).`,
                unreadCount: firestore.FieldValue.increment(1),
                latestMessageSender: user.uid,
            }, { merge: true })
            .catch((e) => {
                console.error("error while updating chat room info: ", e)
            })
        exitFunctions()
    }

    const exitFunctions = () => {
        setVisible(false)
    }

    return (
        <Modal
            isVisible={visible}
            avoidKeyboard={true}
            onBackButtonPress={exitFunctions}
            useNativeDriverForBackdrop
            onBackdropPress={exitFunctions}
            animationInTiming={400}
            animationOutTiming={400}
            onModalHide={() => {
                setLoading(false)
                navigation.goBack()
            }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}
        >
            <View style={styles.panel}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.panelTitle}>Weigh In</Text>
                    <Text style={styles.panelSubtitle}>Tap the weight unit to switch between pounds/kilograms.</Text>
                </View>
                <View overflow={'hidden'} style={[styles.largeView, { flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center' }]}>
                    <View style={{ flex: 1, alignItems: 'center', marginRight: 20 }}>
                        <View style={{ justifyContent: 'center', width: windowHeight / 8, height: windowHeight / 11, borderRadius: 10 }}>
                            <Picker style={{ margin: -(windowHeight / 50), color: '#202060' }}
                                dropdownIconColor='#202060'
                                itemStyle={styles.title1}
                                selectedValue={imperial ? weight.lbs : weight.kgs}
                                onValueChange={(value) => setWeight({
                                    lbs: imperial ? value : Math.round(value * 2.20462),
                                    kgs: imperial ? Math.round(value * 0.453592) : value
                                })}>
                                {Array.apply(null, { length: imperial ? 1400 : 635 }).map((i, index) =>
                                    <Picker.Item key={index} label={(index + 1).toString()} value={index + 1} />
                                )}
                            </Picker>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => useImperial(!imperial)} style={{ alignItems: 'center', justifyContent: 'center', width: windowHeight / 11, height: windowHeight / 11, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000000', shadowOffset: { width: 0, height: 5 }, shadowRadius: 5, shadowOpacity: 0.4 }}>
                        <Text style={styles.title1}>{imperial ? 'lbs' : 'kgs'}</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <TouchableOpacity style={styles.panelButton} onPress={weighIn}>
                        <Text style={styles.panelButtonTitle}>Weigh In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={exitFunctions}
                    >
                        <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '500', marginTop: 5, color: '#4C44D4' }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
                {loading ?
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
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 5,
        shadowOpacity: 0.4,
        width: windowWidth * 0.9,
        height: windowHeight * 0.5,
        borderRadius: 10,
        justifyContent: 'space-around'
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
        width: windowWidth * 0.9,
        height: windowHeight * 0.5,
        borderRadius: 10,
        backgroundColor: 'rgba(32,32,96,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        top: 0
    },
    title1: {
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        fontSize: windowHeight * (25 / 844),
        letterSpacing: 0,
        textAlign: 'center',
        color: '#202060',
    },
})

export default WeighInModal
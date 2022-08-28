import React, { useContext, useEffect, useRef, useState } from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Linking, Switch, ActivityIndicator, Alert, AppState, Platform } from 'react-native'
import { AuthContext } from '../navigation/AuthProvider'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import BackButton from '../components/BackButton.js'
import { requestUserPermission } from '../utils/notificationServices'

const NotificationSettings = ({ navigation }) => {

    const { globalVars, updateInfo, mixpanel } = useContext(AuthContext)

    // const appState = useRef(AppState.currentState)

    const notifTypes = [
        { label: 'Chat Message', value: 'chatMessage', icon: 'chatbox-ellipses-outline' },
        { label: 'Meal Score', value: 'imageGrade', icon: 'image-outline' },
        { label: 'Course Link', value: 'courseLink', icon: 'book-outline' },
        { label: 'Weekly Check-in', value: 'statSummary', icon: 'bar-chart-outline' },
        { label: 'Meal Reminder', value: 'mealReminder', icon: 'nutrition-outline' }
    ]
    const [selectedTypes, setSelectedTypes] = useState(globalVars.userData.settings.notificationTypes)

    const toggleSelectType = (checked, type) => {
        if (checked) {
            setSelectedTypes(val => val.concat(type))
        } else {
            const tempArray = selectedTypes.filter(x => x !== type)
            setSelectedTypes(tempArray)
        }
    }

    const [notificationsEnabled, setNotificationsEnabled] = useState(globalVars.userData.notificationsEnabled)

    const [toggling, setToggling] = useState(false)
    const toggleNotifications = (enabled) => {
        setNotificationsEnabled(!notificationsEnabled)
        setToggling(true)
        requestUserPermission()
        Alert.alert(
            'Action required',
            'Please toggle notifications in your app settings.',
            [
                {
                    text: 'Cancel',
                    onPress: () => {
                        setToggling(false)
                        setNotificationsEnabled(!enabled)
                    },
                    style: 'cancel'
                },
                {
                    text: 'Go to Settings',
                    onPress: () => Linking.openSettings('app-settings://notifications')
                }
            ]
        )
    }

    const checkNotifsEnabled = async () => {
        const result = await requestUserPermission()
        setNotificationsEnabled(result)
        if (globalVars.userData.notificationsEnabled !== result) {
            updateInfo({ notificationsEnabled: result })
        }
    }

    // when user goes to settings and modifies their notification permissions, we want to update that in the app when they open it back up
    useEffect(() => {
        const subscription = AppState.addEventListener("change", nextAppState => {
            if (nextAppState === 'active') {
                checkNotifsEnabled()
                setToggling(false)
            }
        })
    
        return () => subscription.remove()
      }, [])

    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const saveNotificationSettings = () => {
        mixpanel.track('Button Press', { 'Button': 'SaveNotificationSettings' })
        setSaving(true)
        updateInfo({
            notificationsEnabled,
            settings: {
                notificationTypes: selectedTypes
            }
        })
        setSaving(false)
        setSaved(true)
    }

    useEffect(() => {
        setSaved(false)
    }, [selectedTypes])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#E6E7FA' }}>
            <View style={styles.ViewLa} >
                <Text style={[styles.Text_8H, { color: '#202060' }]}>
                    {'Notifications'}
                </Text>
            </View>
            <View style={styles.Viewjp} >
                <View onPress={() => navigation.navigate('User Profile')}>
                    <View style={styles.optionRow} >
                        <View style={styles.optionSwitch}>
                            <Ionicons
                                size={24}
                                color={'#202060'}
                                name={notificationsEnabled ? 'notifications-outline' : 'notifications-off-outline'}
                            />
                            <Text
                                style={[styles.optionText, { color: '#202060' }]}
                                allowFontScaling={false}
                                ellipsizeMode={'tail'}
                                textBreakStrategy={'highQuality'}
                            >
                                {'Enabled'}
                            </Text>
                        </View>

                        <View style={styles.optionSwitch}>
                            <Switch
                                trackColor={{ false: '#BDB9DB', true: '#4C44D4' }}
                                thumbColor='#fff'
                                ios_backgroundColor={'#BDB9DB'}
                                value={notificationsEnabled}
                                onValueChange={(e) => toggleNotifications(e)}
                                disabled={toggling}
                            />
                        </View>
                    </View>
                    <View
                        style={styles.Divider}
                    />
                </View>
                {notifTypes.map((notifType, index) => 
                    <View key={index}>
                        <View style={[styles.optionRow, { opacity: Platform.OS === 'ios' ? 1 : notificationsEnabled ? 1 : 0.5 }]} >
                            <View style={styles.optionSwitch}>
                                <Ionicons
                                    size={24}
                                    color={'#202060'}
                                    name={notifType.icon}
                                />
                                <Text
                                    style={[styles.optionText, { color: '#202060' }]}
                                    allowFontScaling={false}
                                    ellipsizeMode={'tail'}
                                    textBreakStrategy={'highQuality'}
                                >
                                    {notifType.label}
                                </Text>
                            </View>

                            <View style={styles.optionSwitch}>
                                <Switch
                                    trackColor={{ false: '#BDB9DB', true: '#4C44D4' }}
                                    thumbColor='#fff'
                                    ios_backgroundColor={'#BDB9DB'}
                                    value={selectedTypes.includes(notifType.value)}
                                    onValueChange={(e) => toggleSelectType(e, notifType.value)}
                                    disabled={!notificationsEnabled}
                                />
                            </View>
                        </View>
                    </View>
                )}
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity disabled={saving || saved} style={[styles.panelButton, { opacity: saving ? 0.5 : saved ? 0.5 : 1 }]} onPress={saveNotificationSettings}>
                    {saving ? <ActivityIndicator size={25} color="#BDB9DB" /> : <Text style={styles.panelButtonTitle}>{saved ? 'Saved!' : 'Save'}</Text>}
                </TouchableOpacity>
            </View>
            <BackButton navigation={navigation} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    Text_8H: {
        marginBottom: 6,
        fontSize: 20,
        lineHeight: 24,
        fontFamily: 'System',
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
    },
    ViewLa: {
        flexGrow: 1,
        flexShrink: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 60,
    },
    Textc4: {
        marginLeft: 12,
        fontSize: 14,
        fontFamily: 'System',
        fontWeight: '600',
    },
    optionSwitch: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        marginLeft: 12,
        fontFamily: 'System',
        fontWeight: '600',
    },
    Divider: {
        height: 1,
        backgroundColor: 'rgba(32, 32, 96, 1)',
        width: '90%',
        alignSelf: 'center'
    },
    Viewjp: {
        flexGrow: 1,
        flexShrink: 0,
        marginLeft: 24,
        marginRight: 24,
    },
    Textsi: {
        textAlign: 'center',
        marginLeft: 8
    },
    Viewx8: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#202060',
        width: windowWidth * 0.3,
        alignSelf: 'center',
    },
    Viewx9: {
        minHeight: 54,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    Viewrg: {
        flexGrow: 1,
        flexShrink: 0,
    },
    panelButton: {
        height: windowHeight / 17,
        width: windowWidth - 32,
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#4C44D4',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 10
    },
    panelButtonTitle: {
        fontSize: 17,
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        color: 'white',
        textAlign: 'center',
        width: '100%'
    },
});

export default NotificationSettings
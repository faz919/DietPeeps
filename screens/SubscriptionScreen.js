import React, { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Purchases from 'react-native-purchases'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { AuthContext } from '../navigation/AuthProvider'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import firestore from '@react-native-firebase/firestore'
import { ENTITLEMENT_ID } from '../constants/constants'

const SubscriptionScreen = ({ navigation }) => {

    const { updateInfo } = useContext(AuthContext)

    const [subscription, setSubscription] = useState(null)
    const [loading, setLoading] = useState(true)
    const [subscribed, setSubscribed] = useState(false)

    useEffect(() => {
        if (subscribed) {
            navigation.replace('Congrats', { congratsType: 'subscribed' })
        }
    }, [subscribed])

    const fetchOfferings = async () => {
        try {
            const subscriptions = await Purchases.getOfferings()
            console.log(subscriptions.current.availablePackages[0].product)
            subscriptions.current != null && setSubscription(subscriptions.current)
            setLoading(false)
        } catch (e) {
            console.error('error while retrieving subscriptions: ', e)
            setLoading(false)
        }
    }

    const buySubscription = async (subscription) => {
        setLoading(true)
        try {
            const { purchaserInfo, productIdentifier } = await Purchases.purchasePackage(subscription)
            console.log(purchaserInfo)
            if (typeof purchaserInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined') {
                console.log('Success!')
                updateInfo({ subscribed: true, subscriptionInfo: { purchaserInfo } })
                setSubscribed(true)
                setLoading(false)
            } else {
                console.error('Unable to purchase subscription, or check subscription status. Please try again.')
                setLoading(false)
            }
        } catch (e) {
            console.error('error while making purchase: ', e)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOfferings()
    }, [])

    const promoText = [
        'Meal grading',
        '24/7 support from your personal coach',
        'Live feedback',
        'Etc.'
    ]

    return (
        <View style={{ flex: 1, backgroundColor: '#e6e7fa' }}>
            <LinearGradient start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} colors={['#817ce1', '#4C44D4']} style={{ width: '100%', height: windowHeight * 0.25, justifyContent: 'flex-end', padding: 20, paddingBottom: (windowHeight / 20) + 20 }}>
                <View style={styles.ViewD2}>
                    <Text
                        style={[
                            styles.headline2,
                            { color: '#e6e7fa', fontSize: 32 },
                        ]}
                    >
                        {'Subscription'}
                    </Text>
                </View>
            </LinearGradient>
            <View style={{
                flex: 1,
                backgroundColor: '#e6e7fa',
                top: -(windowHeight / 20),
                borderRadius: 20
            }}>
                <View style={styles.ViewT7}>
                    <View style={{ borderRadius: windowHeight / 20, borderWidth: 1, borderColor: '#202060', justifyContent: 'center', flexDirection: 'row', alignItems: 'baseline', height: windowHeight / 10, minWidth: windowWidth / 2, paddingTop: windowHeight / 40, paddingHorizontal: 20 }}>
                        <Text style={{ color: '#202060', fontSize: windowHeight / 40, lineHeight: windowHeight / 40 }}>$</Text>
                        {subscription && <Text style={{ color: '#202060', fontSize: windowHeight / 15, lineHeight: windowHeight / 15 }}>{(subscription.availablePackages[0]?.product?.price).toFixed(2)}</Text>}
                        <Text style={{ color: '#202060', fontSize: windowHeight / 40, lineHeight: windowHeight / 40 }}>/month</Text>
                    </View>
                    <View style={styles.ViewsW}>
                        <Text style={{ textAlign: 'center', fontSize: 15, color: '#202060', marginBottom: 12 }}>Hey there! Looks like your free trial period is finished. Become a DietPeeps Subscriber to receive:</Text>
                        {promoText.map((text, index) =>
                            <View style={styles.Viewvs} key={index}>
                                <MaterialCommunityIcons
                                    style={styles.Icona8}
                                    color={'#F7B852'}
                                    size={24}
                                    name={'check'}
                                />
                                <View style={styles.ViewZZ}>
                                    <Text
                                        style={[
                                            styles.subtitle1,
                                            { color: '#202060' },
                                        ]}
                                        allowFontScaling={true}
                                    >
                                        {text}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={styles.View_4v}>
                        <TouchableOpacity
                            disabled={loading}
                            onPress={() => buySubscription(subscription.availablePackages[0])}
                            style={[
                                styles.ButtonSolidQB,
                                { backgroundColor: 'transparent', opacity: loading ? 0.7 : 1 }
                            ]}
                        >
                            <LinearGradient start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} colors={['#f9cd86', '#F7B852']} style={{ width: '100%', height: '100%', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                                {loading ?
                                    <ActivityIndicator color='#fff' />
                                    : <Text style={styles.panelButtonText}>{'Subscribe'}</Text>}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    Imaget6: {
        width: windowWidth * 0.24,
        height: windowWidth * 0.24,
        marginLeft: -(windowWidth * 0.04)
    },
    ViewD2: {
        alignItems: 'flex-start',
        justifyContent: 'flex-end'
    },
    Icona8: {
        height: 34,
        width: 34,
        marginRight: 14,
    },
    ViewZZ: {
        flex: 1,
    },
    Viewvs: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 10,
    },
    IcongB: {
        marginRight: 14,
        width: 34,
        height: 34,
    },
    Viewk7: {
        flex: 1,
    },
    Viewwb: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        marginTop: 12,
    },
    IconCl: {
        height: 34,
        width: 34,
        marginRight: 14,
    },
    View_9d: {
        flex: 1,
    },
    Viewre: {
        flexDirection: 'row',
        marginBottom: 12,
        marginTop: 12,
        alignItems: 'flex-start',
    },
    ViewsW: {
        alignItems: 'center',
        alignSelf: 'center',
        maxWidth: windowWidth * 0.75
    },
    ButtonSolidQB: {
        width: '100%',
        height: 50,
        marginBottom: 12,
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#4C44D4',
        alignItems: 'center',
    },
    Buttonu5: {
        alignSelf: 'center',
        alignContent: 'center',
        paddingLeft: 12,
        paddingRight: 12,
    },
    View_4v: {
        alignItems: 'center',
        width: windowWidth - 50
    },
    ViewT7: {
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flex: 1,
        margin: 32,
        marginTop: 0,
    },
    ScrollViewUJContent: {
        justifyContent: 'space-evenly',
        flex: 1,
    },
    headline2: {
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        fontSize: 40,
        letterSpacing: 0,
    },
    subtitle1: {
        fontSize: 16,
        letterSpacing: 0,
        lineHeight: 26,
        top: -5,
    },
    panelButtonText: {
        fontSize: 17,
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        color: '#fff',
    },
})

export default SubscriptionScreen
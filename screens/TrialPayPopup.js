import { MotiView } from 'moti'
import React, { useContext, useEffect, useState } from 'react'
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Purchases from 'react-native-purchases'
import { AuthContext } from '../navigation/AuthProvider'
import { windowWidth, windowHeight } from '../utils/Dimensions'

const TrialPayPopup = ({ navigation }) => {

    const { mixpanel, updateInfo } = useContext(AuthContext)

    const [trialPrices, setTrialPrices] = useState([])
    const [selectedPrice, setSelectedPrice] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, showError] = useState(false)

    const fetchOfferings = async () => {
        try {
            const prices = await Purchases.getOfferings()
            prices.current.availablePackages.filter((pkg) => pkg.identifier.includes('trial')) && setTrialPrices(prices.current.availablePackages.filter((pkg) => pkg.identifier.includes('trial')))
        } catch (e) {
            console.error('error while retrieving prices: ', e)
            Alert.alert(
                'Error while retrieving prices',
                'Please try again later.'
            )
        }
    }

    useEffect(() => {
        fetchOfferings()
    }, [])

    useEffect(() => {
        if (selectedPrice != null) {
            showError(false)
        }
    }, [selectedPrice])

    // function that handles user attempting to pay for trial
    const handleTrialPay = (option) => {
        showError(false)
        setLoading(true)
        mixpanel.track('Attempted to Pay for Trial')
        if (option == null) {
            Alert.alert(
                'Error while making purchase',
                'Please try again.'
            )
            return
        }
        payForTrial(option)
    }

    // function that pays for trial, if user decides to
    const payForTrial = async (option) => {
        try {
            const { purchaserInfo, productIdentifier } = await Purchases.purchasePackage(option)
            // console.log(purchaserInfo)
            if (typeof purchaserInfo.entitlements.active['Purchased Trial'] !== 'undefined') {
                mixpanel.track('Paid for Trial', { 'PaymentInfo': JSON.stringify(purchaserInfo) })
                mixpanel.getPeople().set('Paid For Trial', true)
                console.log('Success!')
                updateInfo({ paidForTrial: true, trialPaymentInfo: { purchaserInfo } })
                setLoading(false)
                navigation.navigate('Main Menu', { screen: 'Coach', params: { hasPaidForTrial: true } })
            }
            // else {
            //     console.error('Unable to purchase subscription, or check subscription status. Please try again.')
            //     setLoading(false)
            // }
        } catch (e) {
            console.error('error while making purchase: ', e)
            Alert.alert(
                'Error while making purchase',
                'Please try again.'
            )
            setLoading(false)
        }
    }

    const onContinue = () => {
        navigation.pop()
    }

    return (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, backgroundColor: '#E6E7FA', paddingHorizontal: 32 }}>
            <View style={styles.ViewD2}>
                <Text
                    adjustsFontSizeToFit
                    numberOfLines={13}
                    style={[
                        styles.headline1,
                        { color: '#202060', fontSize: 20 },
                    ]}
                >
                    We hope that you're enjoying your DietPeeps free trial. Your coach is working hard to help you reach your wellness goals and is rooting for you!
                    {`\n\n`}
                    Would you like to tip your coach for the trial? It costs us {trialPrices[trialPrices?.length - 1]?.product.price_string} to compensate our DietPeeps employees for the trial, but please choose the amount you are comfortable with.
                </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginVertical: 20 }}>
                {trialPrices?.map((option, index) => (
                    <View key={index} style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 1 }}>
                        <MotiView
                            key={index}
                            from={{ 
                                opacity: 0, 
                                translateY: 20,
                                shadowOpacity: 0,
                                elevation: 0,
                                borderColor: '#202060'
                            }}
                            animate={{ 
                                opacity: 1, 
                                translateY: selectedPrice?.identifier === option.identifier ? -10 : 0,                             
                                shadowOpacity: selectedPrice?.identifier === option.identifier ? 0.4 : 0,
                                elevation: selectedPrice?.identifier === option.identifier ? 0.4 : 0,
                                borderColor: selectedPrice?.identifier === option.identifier ? '#4C44D4' : '#202060'
                            }}
                            transition={{ type: 'timing' }}
                            style={{
                                borderRadius: 20, borderWidth: 1, borderColor: '#202060', backgroundColor: '#fff', padding: 10, justifyContent: 'center', alignItems: 'center', width: 100, height: 100,
                                shadowColor: '#000000',
                                shadowOffset: { width: 0, height: 3 },
                                shadowRadius: 5,
                                margin: 10,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => setSelectedPrice(option)}
                                style={{ 
                                    borderRadius: 20,
                                    width: '100%',
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: '#202060', fontSize: 22 }}>{option.product.price_string}</Text>
                            </TouchableOpacity>
                        </MotiView>
                        {/* {index === trialPrices.length - 1 && 
                            <Text
                                adjustsFontSizeToFit
                                numberOfLines={2}
                                style={{ color: '#202060', fontSize: windowHeight * (16/844), maxWidth: 100, textAlign: 'center', position: 'absolute', bottom: -30 }}
                            >
                                Most popular option
                            </Text>
                        } */}
                    </View>
                ))}
            </View>
            <MotiView style={styles.ViewD2} from={{ opacity: 0 }} animate={{ opacity: loading ? 0.7 : 1 }}>
                {error && 
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'timing' }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text allowFontScaling={true} style={{ fontWeight: '700', fontSize: 18, color: '#DA302C', textAlign: 'center' }}>Please select a payment amount.</Text>
                </MotiView>}
                <TouchableOpacity
                    disabled={loading}
                    onPress={() => selectedPrice == null ? showError(true) : handleTrialPay(selectedPrice)}
                    style={[
                        styles.ButtonSolidQB,
                        { backgroundColor: '#4C44D4', marginTop: 20 },
                    ]}
                >
                    {loading ? 
                        <ActivityIndicator color='#BDB9DB' /> :
                        <Text style={styles.panelButtonText}>{`Let's do it!`}</Text>
                    }
                </TouchableOpacity>
            </MotiView>
            <View style={styles.ViewD2}>
                <TouchableOpacity
                    onPress={onContinue}
                >
                    <Text style={[styles.panelButtonText, { color: '#4C44D4', fontWeight: '400', textAlign: 'center' }]}>I'm not willing to compensate DietPeeps for my trial.</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

export default TrialPayPopup

const styles = StyleSheet.create({
    ViewD2: {
        alignItems: 'center'
    },
    headline1: {
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        fontSize: windowHeight * (30/844),
        letterSpacing: 0,
        textAlign: 'center',
        marginVertical: 20
    },
    ButtonSolidQB: {
        width: windowWidth - 64,
        height: 50,
        marginBottom: 12,
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#4C44D4',
        alignItems: 'center',
        marginVertical: 7,
    },
    panelButtonText: {
        fontSize: windowHeight * (17/844),
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        color: 'white',
    },
})
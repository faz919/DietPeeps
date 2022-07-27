import { MotiView } from 'moti'
import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

const TrialPayPopup = ({ trialPrices, purchaseTrial, paidForTrial, loading, onContinue }) => {
    const [selectedPrice, setSelectedPrice] = useState(null)
    return (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginHorizontal: 32 }}>
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
                    Would you like to tip your coach for the trial? It costs us {trialPrices[trialPrices.length - 1].product.price_string} to compensate our DietPeeps employees for the trial, but please choose the amount you are comfortable with.
                </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginVertical: 20 }}>
                {trialPrices?.map((option, index) => (
                    <View key={index} pointerEvents={paidForTrial ? 'none' : 'auto'} style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: paidForTrial ? 0.5 : 1 }}>
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
                {paidForTrial && 
                <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                        <Text
                            style={[
                                styles.headline1,
                                { color: '#202060', fontSize: 20, maxWidth: windowWidth * 0.6, textAlign: 'center' },
                            ]}
                        >
                            Thanks so much for your support!
                        </Text>
                </View>}
            </View>
            <MotiView style={styles.View_4v} from={{ opacity: 0 }} animate={{ opacity: loading ? 0.7 : 1 }}>
                <TouchableOpacity
                    disabled={loading}
                    onPress={() => selectedPrice != null && purchaseTrial(selectedPrice)}
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
            <View style={styles.View_4v}>
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

})
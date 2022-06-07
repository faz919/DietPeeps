import { AnimatePresence, MotiView } from 'moti';
import React, { useState } from 'react'
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Easing } from 'react-native-reanimated'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import Icon from 'react-native-vector-icons/Ionicons'
import DatePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';

const WeightGoalSelectorPage = ({ containerStyle, onSelectResponse, disableAnimation, showTitle }) => {
    return (
        <MotiView from={{ opacity: disableAnimation ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: disableAnimation ? 1 : 0 }} style={[{ justifyContent: 'space-around' }, containerStyle]}>
            {showTitle && <MotiView
                from={{ opacity: disableAnimation ? 1 : 0, scale: disableAnimation ? 1 : 0, translateY: disableAnimation ? 0 : 200 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{
                    translateY: {
                        delay: 1000,
                        duration: 1500,
                        type: 'timing',
                        easing: Easing.bezier(.69, 0, .01, .98)
                    },
                    scale: {
                        duration: 1000,
                        type: 'timing',
                        easing: Easing.bezier(.69, 0, 0, 1.58)
                    }
                }}
            >
                <View style={styles.ViewD2}>
                    <Text style={[styles.headline2, { color: '#202060', marginBottom: 0 }]}>
                        {'Tell us about yourself!'}
                    </Text>
                </View>
            </MotiView>}
            <MotiView
                from={{ opacity: disableAnimation ? 1 : 0 }}
                animate={{ opacity: 1 }}
                delay={1800}
            >
                <View style={styles.ViewD2}>
                    <Text style={[styles.headline1, { color: '#202060', marginBottom: 20 }]}>
                        {'What is your current goal?'}
                    </Text>
                </View>
            </MotiView>
            <MotiView
                from={{ opacity: disableAnimation ? 1 : 0 }}
                animate={{ opacity: 1 }}
                delay={1900}
            >
                <TouchableOpacity onPress={() => onSelectResponse('Lose Weight')} style={[styles.largeView, { flexDirection: 'row' }]}>
                    <Text style={styles.title1}>Lose Weight</Text>
                </TouchableOpacity>
            </MotiView>
            <MotiView
                from={{ opacity: disableAnimation ? 1 : 0 }}
                animate={{ opacity: 1 }}
                delay={2000}
            >
                <TouchableOpacity onPress={() => onSelectResponse('Maintain Weight')} style={[styles.largeView, { flexDirection: 'row' }]}>
                    <Text style={styles.title1}>Maintain Weight</Text>
                </TouchableOpacity>
            </MotiView>
            <MotiView
                from={{ opacity: disableAnimation ? 1 : 0 }}
                animate={{ opacity: 1 }}
                delay={2100}
            >
                <TouchableOpacity onPress={() => onSelectResponse('Gain Weight')} style={[styles.largeView, { flexDirection: 'row' }]}>
                    <Text style={styles.title1}>Gain Weight</Text>
                </TouchableOpacity>
            </MotiView>
            <MotiView
                from={{ opacity: disableAnimation ? 1 : 0 }}
                animate={{ opacity: 1 }}
                delay={2200}
            >
                <TouchableOpacity onPress={() => onSelectResponse('Not Weight Related')} style={[styles.largeView, { flexDirection: 'row' }]}>
                    <Text style={styles.title1}>Not Weight Related</Text>
                </TouchableOpacity>
            </MotiView>
        </MotiView>
    )
}

const OtherGoalSelectorPage = ({ selectedGoals, customTitle, onSelectGoal, onContinue, disableAnimation }) => {

    const goals = [
        'Eat healthy',
        'Build muscle',
        'Start a diet',
        'Gain confidence in my body',
        'Fit in my pants',
        'Prepare for a wedding',
        'Go to the gym more',
        'Tone my body',
        'Go for a 5K run',
        'Eat less junk',
        'Quit smoking',
        'Quit drinking',
        'Drink less alcohol',
        'Enjoy life',
        'Be more mindful',
        'Live in the moment',
        'Stress less',
        'Reduce anxiety',
        'Be more productive',
        'Conquer my fears',
        'Cut down on sugar',
        'Stop eating junk food',
        'Go gluten free',
        'Reduce meat consumption',
        'Reduce my carbon footprint',
        'Become comfortable doing exercise outside',
        'Help my family be more healthy',
        'Break out of my comfort zone',
        'Other'
    ]

    return (
        <MotiView key='page2' from={{ opacity: disableAnimation ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: disableAnimation ? 1 : 0 }} style={{ justifyContent: 'space-around' }}>
            <View style={styles.ViewD2}>
                <Text style={[styles.headline1, { color: '#202060', marginBottom: 20 }]}>
                    {customTitle || 'What other goals do you have?'}
                </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{
                height: windowHeight * 0.5, overflow: 'hidden'
                // if you want a border box
                //  backgroundColor: '#BDB9DB', borderRadius: 20,  paddingHorizontal: 10, paddingBottom: 10
            }}>
                <View style={{ height: 'auto', width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {goals.map((goal, index) =>
                        <TouchableOpacity key={goal} onPress={() => onSelectGoal(goal)} style={{ flexDirection: 'row', alignItems: 'center', margin: 3, padding: 5, borderRadius: 10, backgroundColor: selectedGoals.includes(goal) ? '#43CD3F' : '#fff' }}>
                            <Text style={{ fontSize: windowHeight * (18 / 844), textAlign: 'center', color: selectedGoals.includes(goal) ? '#fff' : '#202060', marginRight: 5 }}>
                                {goal}
                            </Text>
                            <Icon
                                name={selectedGoals.includes(goal) ? 'checkmark-sharp' : 'add'}
                                size={windowHeight * (18 / 844)}
                                color={selectedGoals.includes(goal) ? '#fff' : '#202060'}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
            <View style={styles.View_4v}>
                <TouchableOpacity
                    onPress={onContinue}
                    style={[
                        styles.ButtonSolidQB,
                        { backgroundColor: '#4C44D4', marginTop: 20 },
                    ]}
                >
                    <Text style={styles.panelButtonText}>{'Continue'}</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

const GenderSelectorPage = ({ onSelectResponse, disableAnimation }) => {
    return (
        <MotiView from={{ opacity: disableAnimation ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: disableAnimation ? 1 : 0 }}>
        <View style={styles.ViewD2}>
            <Text
                style={[
                    styles.headline1,
                    { color: '#202060', marginBottom: 20 },
                ]}
            >
                {'What is your gender?'}
            </Text>
        </View>
        <TouchableOpacity onPress={() => onSelectResponse('Female')} style={[styles.largeView, { flexDirection: 'row' }]}>
            <Text style={styles.title1}>Female</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onSelectResponse('Male')} style={[styles.largeView, { flexDirection: 'row' }]}>
            <Text style={styles.title1}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onSelectResponse('Other')} style={[styles.largeView, { flexDirection: 'row' }]}>
            <Text style={styles.title1}>Other</Text>
        </TouchableOpacity>
    </MotiView>
    )
}

const DateOfBirthSelectorPage = ({ prevResponse, onSelectResponse, onContinue, disableAnimation }) => {
    const [underage, setUnderage] = useState(false)

    function age(birthDate) {
        var ageInMilliseconds = new Date() - new Date(birthDate)
        return Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24 * 365))
    }

    const handleSelectResponse = (date) => {
        onSelectResponse(date)
        if (age(date) < 18) {
            setUnderage(true)
        } else {
            setUnderage(false)
        }
    }

    return (
        <MotiView key='page4' from={{ opacity: disableAnimation ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: disableAnimation ? 1 : 0 }}>
            <View style={styles.ViewD2}>
                <Text
                    style={[
                        styles.headline1,
                        { color: '#202060', marginBottom: 20 },
                    ]}
                >
                    {'What is your date of birth?'}
                </Text>
            </View>
            <View overflow={'hidden'} style={styles.largeView}>
                <DatePicker
                    minimumDate={new Date('1900')}
                    maximumDate={new Date()}
                    androidVariant={'iosClone'}
                    mode={'date'}
                    date={prevResponse || new Date(2000, 0, 1)}
                    onDateChange={(date) => handleSelectResponse(date)}
                />
            </View>
            <AnimatePresence>
                {underage && 
                <MotiView from={{ opacity: 0, maxHeight: 0 }} animate={{ opacity: 1, maxHeight: 200 }} exit={{ opacity: 0, maxHeight: 0 }} transition={{ type: 'timing' }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text allowFontScaling={true} style={{ fontWeight: '700', fontSize: 18, color: '#DA302C', textAlign: 'center' }}>Unfortunately, we are unable to serve users under the age of 18. Although our coaches cannot help you, you may feel free to complete our daily courses.</Text>
                </MotiView>}
            </AnimatePresence>
            <View style={styles.View_4v}>
                <TouchableOpacity
                    onPress={onContinue}
                    style={[
                        styles.ButtonSolidQB,
                        { backgroundColor: '#4C44D4', marginTop: 20 },
                    ]}
                >
                    <Text style={styles.panelButtonText}>{'Continue'}</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

const HeightSelector = ({ usesImperial, prevResponse, onToggleImperial, onSelectLargeUnit, onSelectSmallUnit }) => {
    return (
        <View overflow={'hidden'} style={[styles.largeView, { flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ justifyContent: 'center', width: usesImperial ? windowHeight / 11 : Platform.OS === 'ios' ? windowHeight / 10 : windowHeight / 8, height: windowHeight / 11, borderRadius: 10 }}>
                <Picker style={{ margin: -(windowHeight / 50), color: '#202060' }}
                    dropdownIconColor='#202060'
                    itemStyle={styles.title1}
                    selectedValue={usesImperial ? prevResponse.ft : prevResponse.cm}
                    onValueChange={(value) => onSelectLargeUnit(value)}>
                    {Array.apply(null, { length: usesImperial ? 8 : 272 }).map((i, index) =>
                        <Picker.Item key={index} label={(index + 1).toString()} value={index + 1} />
                    )}
                </Picker>
            </View>
            <Text style={[styles.title1, { height: windowHeight / 11, top: usesImperial ? 0 : windowHeight / 25 }]}>{usesImperial ? "'" : "."}</Text>
            <View style={{ justifyContent: 'center', width: Platform.OS === 'ios' ? windowHeight / 11 : windowHeight / 9, height: windowHeight / 11, borderRadius: 10 }}>
                <Picker style={{ margin: -(windowHeight / 50), color: '#202060' }}
                    dropdownIconColor='#202060'
                    itemStyle={styles.title1}
                    selectedValue={usesImperial ? prevResponse.in : prevResponse.mm}
                    onValueChange={(value) => onSelectSmallUnit(value)}>
                    {Array.apply(null, { length: usesImperial ? 12 : 10 }).map((i, index) =>
                        <Picker.Item key={index} label={index.toString()} value={index} />
                    )}
                </Picker>
            </View>
            {usesImperial && <Text style={[styles.title1, { height: windowHeight / 11 }]}>''</Text>}
            <UnitToggler buttonText={usesImperial ? 'ft/in' : 'cm'} onToggleImperial={onToggleImperial} />
        </View>
    )
}

const WeightSelector = ({ usesImperial, prevResponse, onToggleImperial, onSelectResponse }) => {
    return (
        <View overflow={'hidden'} style={[styles.largeView, { flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flex: 1, alignItems: 'center', marginRight: 20 }}>
                <View style={{ justifyContent: 'center', width: Platform.OS === 'ios' ? windowHeight / 8 : windowHeight / 7, height: windowHeight / 11, borderRadius: 10 }}>
                    <Picker style={{ margin: -(windowHeight / 50), color: '#202060' }}
                        dropdownIconColor='#202060'
                        itemStyle={styles.title1}
                        selectedValue={usesImperial ? prevResponse.lbs : prevResponse.kgs}
                        onValueChange={(value) => onSelectResponse(value)}>
                        {Array.apply(null, { length: usesImperial ? 1400 : 635 }).map((i, index) =>
                            <Picker.Item key={index} label={(index + 1).toString()} value={index + 1} />
                        )}
                    </Picker>
                </View>
            </View>
            <UnitToggler buttonText={usesImperial ? 'lbs' : 'kgs'} onToggleImperial={onToggleImperial} />
        </View>
    )
}

const MealCountSelectorPage = ({ prevResponse, onSelectResponse, onContinue, disableAnimation }) => {
    return (
        <MotiView from={{ opacity: disableAnimation ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: disableAnimation ? 1 : 0 }}>
            <View style={styles.ViewD2}>
                <Text
                    style={[
                        styles.headline1,
                        { color: '#202060' },
                    ]}
                >
                    {'How many meals do you eat per day?'}
                </Text>
            </View>
            <View style={{ alignItems: 'center', marginVertical: 40 }}>
                <View style={[styles.largeView, { backgroundColor: 'transparent', width: windowWidth / 5, padding: 20, justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={{ justifyContent: 'center', width: Platform.select({ ios: windowWidth / 6, android: windowWidth / 4 }) }}>
                        <Picker 
                            style={{ margin: -(windowHeight / 100), color: '#202060' }}
                            dropdownIconColor='#202060'
                            itemStyle={styles.title1}
                            selectedValue={prevResponse}
                            onValueChange={(value) => onSelectResponse(value)}>
                            {Array.apply(null, { length: 9 }).map((i, index) =>
                                <Picker.Item key={index} label={(index + 1).toString()} value={index + 1} />
                            )}
                        </Picker>
                    </View>
                </View>
            </View>
            <View style={styles.View_4v}>
                <TouchableOpacity
                    onPress={onContinue}
                    style={[
                        styles.ButtonSolidQB,
                        { backgroundColor: '#4C44D4', marginTop: 20 },
                    ]}
                >
                    <Text style={styles.panelButtonText}>{'Continue'}</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

const MealTimesSelectorPage = ({ editingMealTime, mealCount, prevResponse, onSelectResponse, onContinue, disableContainerAnimation }) => {

    const meals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'last']

    return (
        <MotiView from={{ opacity: disableContainerAnimation ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: disableContainerAnimation ? 1 : 0 }}>
            <AnimatePresence exitBeforeEnter>
                {Array.apply(null, { length: mealCount }).map((i, index) =>
                    editingMealTime - 1 === index &&
                    <MotiView key={`editingMealTime${index + 1}`} from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <View style={styles.ViewD2}>
                            <Text style={[styles.title1, { color: '#202060' }]}>
                                {mealCount == 1 ? 'What time do you usually eat your daily meal?' : `What time do you usually eat your ${index === mealCount - 1 ? 'last' : meals[index]} meal of the day?`}
                            </Text>
                        </View>
                        <View overflow={'hidden'} style={[styles.largeView, { width: windowWidth * 0.5, alignSelf: 'center' }]}>
                            <DatePicker
                                androidVariant={'iosClone'}
                                mode={'time'}
                                minuteInterval={15}
                                date={prevResponse[index] ? new Date(prevResponse[index]) : new Date()}
                                onDateChange={(v) => onSelectResponse(v, index)}
                            />
                        </View>
                    </MotiView>
                )}
            </AnimatePresence>
            <View style={styles.View_4v}>
                <TouchableOpacity
                    onPress={onContinue}
                    style={[styles.ButtonSolidQB, { backgroundColor: '#4C44D4', marginTop: 20 }]}>
                    <Text style={styles.panelButtonText}>{'Continue'}</Text>
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}

const UnitToggler = ({ style, buttonText, onToggleImperial }) => {
    return (
        <TouchableOpacity onPress={onToggleImperial} style={[styles.unitToggler, { ...style }]}>
            <Text style={styles.title1}>{buttonText}</Text>
        </TouchableOpacity>
    )
}

export { 
    WeightGoalSelectorPage, 
    OtherGoalSelectorPage, 
    GenderSelectorPage, 
    DateOfBirthSelectorPage, 
    HeightSelector,
    WeightSelector,
    MealCountSelectorPage,
    MealTimesSelectorPage,
    UnitToggler
}

const styles = StyleSheet.create({
    unitToggler: {
        alignItems: 'center', 
        justifyContent: 'center', 
        minWidth: windowHeight / 11, 
        height: windowHeight / 11, 
        borderRadius: 10, 
        backgroundColor: '#fff', 
        shadowColor: '#000000', 
        shadowOffset: { width: 0, height: 5 }, 
        shadowRadius: 5, 
        shadowOpacity: 0.4
    },
    Imaget6: {
        width: windowWidth * 0.24,
        height: windowWidth * 0.24,
        marginLeft: -(windowWidth * 0.04)
    },
    ViewD2: {
        alignItems: 'center'
    },
    Icona8: {
        height: 34,
        width: 34,
        marginRight: 14,
    },
    ViewZZ: {
        flex: 1,
        justifyContent: 'center'
    },
    Viewvs: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        marginTop: 12
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
    },
    ButtonSolidQB: {
        width: '100%',
        height: 50,
        marginBottom: 12,
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#4C44D4',
        alignItems: 'center',
        marginVertical: 7,
    },
    Buttonu5: {
        alignSelf: 'center',
        alignContent: 'center',
        paddingLeft: 12,
        paddingRight: 12,
    },
    View_4v: {
        alignItems: 'center',
    },
    ViewT7: {
        justifyContent: 'space-evenly',
        flex: 1,
        margin: 32,
        marginTop: 0
    },
    ScrollViewUJContent: {
        justifyContent: 'space-evenly',
        flex: 1,
    },
    headline2: {
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        fontSize: windowHeight * (40/844),
        letterSpacing: 0,
        textAlign: 'center',
        marginVertical: 20
    },
    headline1: {
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        fontSize: windowHeight * (30/844),
        letterSpacing: 0,
        textAlign: 'center',
        marginVertical: 20
    },
    title1: {
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        fontSize: windowHeight * (25/844),
        letterSpacing: 0,
        textAlign: 'center',
        color: '#202060',
    },
    subtitle1: {
        fontSize: windowHeight * (16/844),
        letterSpacing: 0,
        marginVertical: 20
    },
    panelButtonText: {
        fontSize: windowHeight * (17/844),
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        color: 'white',
    },
    largeView: {
        marginTop: 10,
        marginBottom: 20,
        borderRadius: 20,
        width: '100%',
        height: windowHeight / 8,
        backgroundColor: '#BDB9DB',
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingScreen: {
        ...StyleSheet.absoluteFill,
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center'
    },  
    loadingScreenText: {
        fontSize: windowHeight * (35/844),
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        letterSpacing: 0,
        textAlign: 'center',
        color: '#202060',
        // borderColor: '#202060',
        // shadowColor: '#202060',
        // shadowOffset: { width: 0, height: 0 },
        // shadowOpacity: 0.9,
        // shadowRadius: 1,
        top: windowHeight / 5,
        position: 'absolute'
    }
})
import React, { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View, ImageBackground, TouchableOpacity, Platform, TextInput, Alert } from 'react-native'
import { AuthContext } from '../navigation/AuthProvider.js'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import BackButton from '../components/BackButton.js'
import FormInput from '../components/FormInput.js'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { windowHeight } from '../utils/Dimensions.js'
import ImagePicker from 'react-native-image-crop-picker'
import Modal from 'react-native-modal'
import storage from '@react-native-firebase/storage'
import firestore from '@react-native-firebase/firestore'
import { windowWidth } from '../utils/Dimensions.js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ProfilePic from '../components/ProfilePic.js'
import { 
    DateOfBirthSelectorPage, 
    GenderSelectorPage, 
    HeightSelector, 
    MealCountSelectorPage, 
    MealTimesSelectorPage, 
    OtherGoalSelectorPage, 
    UnitToggler, 
    WeightGoalSelectorPage, 
    WeightSelector 
} from '../components/OnboardingComponents.js'
import moment from 'moment'

const EditUserDataScreen = ({ navigation }) => {
    const { user, updateInfo, globalVars, setGlobalVars, mixpanel } = useContext(AuthContext)

    const data = globalVars.userData?.userBioData

    if (data == null) {
        Alert.alert(
            'Error retrieving user data',
            'Please be sure you have completed the onboarding wizard and try again.'
        )
        return navigation.pop()
    }

    // const [newInfo, setNewInfo] = useState({})

    const dataValues = [
        { label: 'Date of Birth', value: 'dob' },
        { label: 'Gender', value: 'gender' },
        { label: 'Height', value: 'height' },
        { label: 'Weight', value: 'weight' },
        { label: 'Target Weight', value: 'targetWeight', },
        { label: 'Current Goal', value: 'weightGoal' },
        { label: 'Other Goals', value: 'goals' },
        { label: '# of Meals per Day', value: 'mealCount' },
        { label: 'Meal Times', value: 'mealTimes' },
        { label: 'Preferred Unit System', value: 'usesImperial' },
    ]

    const [editModalVisible, setEditModalVisible] = useState(false)
    const [currentValue, setCurrentValue] = useState(null)
    const [currentData, setCurrentData] = useState(null)
    const [editingMealTime, setEditingMealTime] = useState(1)
    const [usingImperial, setUsingImperial] = useState(null)

    useEffect(() => {
        setUsingImperial(globalVars.userData.usesImperial)
    }, [globalVars.userData])

    const handleEditSelect = (value, data) => {
        setCurrentValue(value)
        setCurrentData(data)
        setEditModalVisible(true)
    }

    const exitFunctions = () => {
        setEditModalVisible(false)
    }

    const toggleSelectGoal = (goal) => {
        if (currentData.includes(goal)) {
            let oldArr = currentData
            let newArr = oldArr.filter(val => val != goal)
            setCurrentData(newArr)
            
        } else {
            let newArr = currentData
            newArr.push(goal)
            setCurrentData(newArr)
        }
    }

    const EditDataModal = () => {
        return (
            <Modal
                isVisible={editModalVisible}
                avoidKeyboard={true}
                onBackButtonPress={exitFunctions}
                useNativeDriverForBackdrop
                onBackdropPress={exitFunctions}
                animationInTiming={400}
                animationOutTiming={400}
                onModalHide={() => {
                    currentValue !== 'usesImperial' ?
                        updateInfo({
                            userBioData: {
                                [currentValue]: currentData
                            }
                        }) :
                        updateInfo({
                            usesImperial: currentData
                        })
                    setCurrentValue(null)
                    setCurrentData(null)
                }}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
                <View style={styles.modalContainer}>
                    {currentValue === 'dob' && <DateOfBirthSelectorPage
                        prevResponse={new Date(currentData)}
                        onSelectResponse={(response) => setCurrentData(response)}
                        onContinue={exitFunctions}
                        disableAnimation
                    />}
                    {currentValue === 'gender' && <GenderSelectorPage
                        onSelectResponse={(response) => setCurrentData(response)}
                        disableAnimation
                    />}
                    {currentValue === 'height' && 
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Text
                                style={[
                                    styles.headline1,
                                    { color: '#202060' },
                                ]}
                            >
                                {'What is your current height?'}
                            </Text>
                            <HeightSelector
                                usesImperial={usingImperial}
                                prevResponse={currentData}
                                onToggleImperial={() => usingImperial = !usingImperial}
                                onSelectLargeUnit={(value) => setCurrentData(oldValue => ({
                                    ft: usingImperial ? value : Math.floor((value + (oldValue.mm * 0.1)) * 0.0328084),
                                    in: usingImperial ? oldValue.in : Math.round((((value + (oldValue.mm * 0.1)) * 0.0328084) - Math.floor((value + (oldValue.mm * 0.1)) * 0.0328084)) * 12),
                                    cm: usingImperial ? Math.floor((value + (oldValue.in / 12)) * 30.48) : value,
                                    mm: usingImperial ? Math.round((((value + (oldValue.in / 12)) * 30.48) - Math.floor((value + (oldValue.in / 12)) * 30.48)) * 10) : oldValue.mm
                                }))}
                                onSelectSmallUnit={(value) => setCurrentData(oldValue => ({
                                    ft: usingImperial ? oldValue.ft : Math.floor((oldValue.cm + (value * 0.1)) * 0.0328084),
                                    in: usingImperial ? value : Math.round((((oldValue.cm + (value * 0.1)) * 0.0328084) - Math.floor((oldValue.cm + (value * 0.1)) * 0.0328084)) * 12),
                                    cm: usingImperial ? Math.floor((oldValue.ft + (value / 12)) * 30.48) : oldValue.cm,
                                    mm: usingImperial ? Math.round((((oldValue.ft + (value / 12)) * 30.48) - Math.floor((oldValue.ft + (value / 12)) * 30.48)) * 10) : value
                                }))}
                            />
                            <TouchableOpacity onPress={exitFunctions} style={styles.panelButton}>
                                <Text style={styles.panelButtonTitle}>Continue</Text>
                            </TouchableOpacity>
                        </View>}
                    {currentValue === 'weight' && <WeightSelector
                        usesImperial={usingImperial}
                        prevResponse={currentData}
                        onToggleImperial={() => setUsingImperial(!usingImperial)}
                        onSelectResponse={(value) => setCurrentData({
                            lbs: usingImperial ? value : Math.round(value * 2.20462),
                            kgs: usingImperial ? Math.round(value * 0.453592) : value
                        })}
                    />}
                    {currentValue === 'targetWeight' && <WeightSelector
                        usesImperial={usingImperial}
                        prevResponse={currentData}
                        onToggleImperial={() => setUsingImperial(!usingImperial)}
                        onSelectResponse={(value) => setCurrentData({
                            lbs: usingImperial ? value : Math.round(value * 2.20462),
                            kgs: usingImperial ? Math.round(value * 0.453592) : value
                        })}
                    />}
                    {currentValue === 'weightGoal' && <WeightGoalSelectorPage  
                        onSelectResponse={(response) => setCurrentData(response)}
                        disableAnimation 
                        showTitle={false}
                    />}
                    {currentValue === 'goals' && <OtherGoalSelectorPage
                        selectedGoals={currentData}
                        onSelectGoal={(goal) => toggleSelectGoal(goal)}
                        onContinue={exitFunctions}
                        disableAnimation
                    />}
                    {currentValue === 'mealCount' && <MealCountSelectorPage
                        prevResponse={currentData}
                        onSelectResponse={(response) => setCurrentData(response)}
                        onContinue={exitFunctions}
                        disableAnimation
                    />}
                    {currentValue === 'mealTimes' && <MealTimesSelectorPage
                        editingMealTime={editingMealTime}
                        mealCount={data.mealCount}
                        prevResponse={currentData}
                        onSelectResponse={(response, index) => { let newArr = currentData || []; newArr[index] = response; setCurrentData(newArr) }}
                        onContinue={() => {
                            if (currentData[editingMealTime - 1] == null) {
                                let newArr = currentData || []
                                newArr[editingMealTime - 1] = new Date()
                                setCurrentData(newArr)
                            }
                            editingMealTime == data.mealCount ? exitFunctions() : (editingMealTime < data.mealCount && setEditingMealTime(editingMealTime + 1))
                        }}
                        disableContainerAnimation
                    />}
                    {currentValue === 'usesImperial' && <UnitToggler
                        buttonText={currentData ? 'Imperial (ft/in, lbs)' : 'Metric (cm, kgs)'}
                        onToggleImperial={() => setCurrentData(!currentData)}
                    />}
                </View>
            </Modal>
        )
    }

    return (
        <>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#E6E7FA' }}>
                <KeyboardAwareScrollView
                    contentContainerStyle={styles.KeyboardAvoidingViewtk}
                    keyboardOpeningTime={0}
                >
                    <View style={styles.ViewaX}>
                        <Text style={[styles.Text_8H, { color: '#202060' }]}>
                            {'Edit Bio Data'}
                        </Text>
                        {dataValues.map((dataValue, index) => {
                            const val = dataValue.value === 'usesImperial' ? usingImperial : data[dataValue.value]
                            const usesImperial = usingImperial
                            return (
                                <React.Fragment key={index}>
                                    <Text style={[styles.TextJa, { color: '#202060', marginTop: 10 }]}>
                                        {dataValue.label}
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 5, marginBottom: 15 }}>
                                        <Text style={[styles.Textmr, { fontSize: 16 }]}>
                                            {dataValue.value === 'dob' && moment(val).format('L')}
                                            {(dataValue.value === 'gender' || dataValue.value === 'weightGoal' || dataValue.value === 'mealCount') && val}
                                            {(dataValue.value === 'height') && (usesImperial ? `${val.ft}'${val.in}` : `${val.cm}.${val.mm} cm`)}
                                            {(dataValue.value === 'weight' || dataValue.value === 'targetWeight') && (usesImperial ? `${val.lbs} lbs` : `${val.kgs} kgs`)}
                                            {/* {dataValue.value === 'goals' && 'Click to View'} */}
                                            {dataValue.value === 'mealTimes' && val.map((mealTime, index) => `${moment(mealTime).format('h:mm a')}${index === val.length - 1 ? '' : ', '}`)}
                                            {dataValue.value === 'usesImperial' && `${usesImperial ? 'Imperial' : 'Metric'}`}
                                        </Text>
                                        {(dataValue.value === 'weight' || dataValue.value === 'targetWeight') && <Text style={[styles.Textmr, { marginLeft: 5, color: 'gray' }]}>
                                            {usesImperial ? `(${val.kgs} kgs)` : `(${val.lbs} lbs)`}
                                        </Text>}
                                        {dataValue.value === 'height' && <Text style={[styles.Textmr, { marginLeft: 5, color: 'gray' }]}>
                                            {usesImperial ? `(${val.cm}.${val.mm} cm)` : `(${val.ft}'${val.in})`}
                                        </Text>}
                                        <TouchableOpacity onPress={() => handleEditSelect(dataValue.value, val)} style={{ justifyContent: 'center', alignItems: 'center', padding: 5, paddingHorizontal: 10, backgroundColor: 'rgba(189,185,219,0.5)', borderRadius: 15, marginLeft: 5 }}>
                                            <Text style={{ color: '#202060', fontWeight: '600', fontSize: 14 }}>Edit</Text>
                                        </TouchableOpacity>
                                    </View>
                                </React.Fragment>
                            )
                        })}
                    </View>
                </KeyboardAwareScrollView>
                <BackButton navigation={navigation} />
            </SafeAreaView>
            <EditDataModal />
        </>
    )
}

const styles = StyleSheet.create({
    headline1: {
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        fontSize: windowHeight * (30/844),
        letterSpacing: 0,
        textAlign: 'center',
        marginVertical: 20
    },
    TextJa: {
        fontSize: 20,
        fontFamily: 'System',
        fontWeight: '700',
        textAlign: 'center',
    },
    Textmr: {
        fontSize: 14,
        textAlign: 'center',
    },
    CircleImage_0E: {
        marginTop: 20,
        height: 90,
        width: 90,
    },
    ViewaX: {
        alignItems: 'center',
    },
    ButtonSolid_51: {
        borderRadius: 8,
        fontFamily: 'System',
        fontWeight: '700',
        textAlign: 'center',
    },
    KeyboardAvoidingViewtk: {
        justifyContent: 'space-around',
        paddingLeft: 16,
        paddingRight: 16,
        marginTop: 30,
    },
    panelButton: {
        height: windowHeight / 17,
        width: '100%',
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
    Text_8H: {
        marginBottom: 15,
        fontSize: 22,
        fontFamily: 'System',
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
    },
    modalContainer: {
        padding: 20,
        backgroundColor: '#E6E7FA',
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 5,
        shadowOpacity: 0.4,
        width: windowWidth * 0.9,
        minHeight: windowHeight * 0.5,
        borderRadius: 10,
        justifyContent: 'space-around'
    },
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
        height: windowHeight * (320 / 844),
        alignItems: 'center'
    },
    panelTitle: {
        fontSize: 27,
        height: 35,
        color: '#202060',
        width: '100%'
    },
    panelSubtitle: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalLoading: {
        position: 'absolute',
        width: windowWidth,
        height: 320,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: 'rgba(32,32,96,0.8)',
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default EditUserDataScreen

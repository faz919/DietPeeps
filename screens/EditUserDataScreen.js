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
import { DateOfBirthSelectorPage, GenderSelectorPage, HeightSelector, Hello, MealCountSelectorPage, MealTimesSelectorPage, OtherGoalSelectorPage, UnitToggler, WeightGoalSelectorPage, WeightSelector } from '../components/OnboardingComponents.js'

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

    const [newInfo, setNewInfo] = useState({})

    const dataValues = [
        { label: 'Date of Birth', value: 'dob' },
        { label: 'Gender', value: 'gender' },
        { label: 'Current Goal', value: 'weightGoal' },
        { label: 'Height', value: 'height' },
        { label: 'Weight', value: 'weight' },
        { label: 'Target Weight', value: 'targetWeight', },
        { label: 'Other Goals', value: 'goals' },
        { label: '# of Meals per Day', value: 'mealCount' },
        { label: 'Meal Times', value: 'mealTimes' },
        { label: 'Preferred Unit System', value: 'usesImperial' },
    ]

    const [editModalVisible, setEditModalVisible] = useState(false)

    const exitFunctions = () => {
        setVisible(false)
    }

    const EditDataModal = ({ value, oldData }) => {
        const [newData, setNewData] = useState(oldData)
        return (
            <Modal
                isVisible={editModalVisible}
                avoidKeyboard={true}
                onBackButtonPress={exitFunctions}
                useNativeDriverForBackdrop
                onBackdropPress={exitFunctions}
                animationInTiming={400}
                animationOutTiming={400}
                onModalHide={() => {}}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
                <View style={styles.modalContainer}>
                    {value === 'dob' && <DateOfBirthSelectorPage />}
                    {value === 'gender' && <GenderSelectorPage />}
                    {value === 'weightGoal' && <WeightGoalSelectorPage />}
                    {value === 'height' && <HeightSelector />}
                    {value === 'weight' && <WeightSelector />}
                    {value === 'targetWeight' && <WeightSelector />}
                    {value === 'goals' && <OtherGoalSelectorPage />}
                    {value === 'mealCount' && <MealCountSelectorPage />}
                    {value === 'mealTimes' && <MealTimesSelectorPage />}
                    {value === 'usesImperial' && <UnitToggler />}
                </View>
            </Modal>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#E6E7FA' }}>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.KeyboardAvoidingViewtk}
                keyboardOpeningTime={0}
            >
                <View style={styles.ViewaX}>
                    <Text style={[styles.Text_8H, { color: '#202060' }]}>
                        {'Edit Bio Data'}
                    </Text>
                    <Text style={[styles.TextJa, { color: '#202060', marginTop: 20 }]}>
                        {user.displayName}
                    </Text>
                    <Text style={[styles.Textmr, { color: 'gray' }]}>
                        {user.email}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 5, marginBottom: 15 }}>
                        <Hello />
                    </View>
                    <View style={{ marginTop: 10 }}>

                    </View>
                </View>
            </KeyboardAwareScrollView>
            <BackButton navigation={navigation} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    TextJa: {
        fontSize: 24,
        fontFamily: 'System',
        fontWeight: '700',
        textAlign: 'center',
    },
    Textmr: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 5,
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
        flex: 1,
        justifyContent: 'space-around',
        paddingLeft: 16,
        paddingRight: 16,
        marginTop: 30
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
        marginBottom: 6,
        fontSize: 20,
        lineHeight: 24,
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
        height: windowHeight * 0.5,
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

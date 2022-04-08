import React, { useContext, useState, useEffect } from 'react'
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native'
import FormInput from '../components/FormInput'
import FormButton from '../components/FormButton'
import SocialButton from '../components/SocialButton'
import { AuthContext } from '../navigation/AuthProvider';
import { windowHeight } from '../utils/Dimensions'

const SignupScreen = ({ navigation }) => {
    //user info entry
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    //for errors
    const [errorText, setErrorText] = useState('')

    const { authErrorText, register, googleLogin, appleLogin, setAuthErrorText, globalVars, setGlobalVars } = useContext(AuthContext)

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            setErrorText('')
            setAuthErrorText('')
            setName('')
            setEmail('')
            setPassword('')
            setConfirmPassword('')
        })
        return unsubscribe
    }, [navigation])

    useEffect(() => {
        setErrorText(authErrorText)
    }, [authErrorText])

    //make this a separate .js file at some point with prop for action to complete
    const runChecks = () => {
        if (confirmPassword !== password) {
            setErrorText("Passwords do not match. Please try again.")
        } else if (password.length < 8) {
            setErrorText("Password must contain at least 8 characters.")
        } else if (password === 'password') {
            setErrorText("Password cannot be 'password.'")
        } else if (name.length < 4) {
            setErrorText("Name must contain at least 4 characters.")
        } else if (email === "") {
            setErrorText("Email must be valid.")
        } else {
            setErrorText("")
            register(name, email, password)
            setGlobalVars(val => ({...val, loggingIn: true}))
        }
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>

            <Text style={styles.text}>Create an Account</Text>

            <FormInput
                labelValue={name}
                onChangeText={(userName) => setName(userName)}
                placeholderText="Full Name"
                iconType="user"
                autoCapitalize="none"
                autoCorrect={false}
                passwordInput={false}
                maxLength={25}
                error={errorText !== "" ? true : false}
            />

            <FormInput
                labelValue={email}
                onChangeText={(userEmail) => setEmail(userEmail)}
                placeholderText="Email"
                iconType="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                passwordInput={false}
                error={errorText !== "" ? true : false}
            />

            <FormInput
                labelValue={password}
                onChangeText={(userPassword) => setPassword(userPassword)}
                placeholderText="Password"
                iconType="lock"
                autoCapitalize="none"
                autoCorrect={false}
                passwordInput={true}
                error={errorText !== "" ? true : false}
            />

            <FormInput
                labelValue={confirmPassword}
                onChangeText={(userConfirmPassword) => setConfirmPassword(userConfirmPassword)}
                placeholderText="Confirm Password"
                iconType="lock"
                autoCapitalize="none"
                autoCorrect={false}
                passwordInput={true}
                error={errorText !== "" ? true : false}
            />

            {setErrorText === '' ? null :
                <Text style={styles.errorMsg}>
                    {errorText}
                </Text>}

            <FormButton
                buttonTitle="Sign Up"
                onPress={() => runChecks()}
            />
            {Platform.OS === 'ios' ?
                <SocialButton
                    buttonTitle="Sign Up with Apple"
                    btnType="apple"
                    color="white"
                    backgroundColor="black"
                    onPress={() => { appleLogin(); setGlobalVars(val => ({ ...val, loggingIn: true })) }}
                />
                : null}
            <SocialButton
                buttonTitle="Sign Up with Google"
                btnType="google"
                color="#EA4335"
                backgroundColor="#F7E7E6"
                onPress={() => { googleLogin(); setGlobalVars(val => ({ ...val, loggingIn: true })) }}
            />
            <View style={styles.textPrivate}>
                <Text style={styles.color_textPrivate}>By registering, you confirm that you agree to our </Text>
                <TouchableOpacity onPress={() => Linking.openURL('http://dietpeeps.com/eula.html')}><Text style={[styles.color_textPrivate, { color: '#F7B852', fontSize: 12 }]}>Terms of Service</Text></TouchableOpacity>
                <Text style={styles.color_textPrivate}> and </Text>
                <TouchableOpacity onPress={() => Linking.openURL('http://dietpeeps.com/privacy.html')}><Text style={[styles.color_textPrivate, { color: '#F7B852', fontSize: 12 }]}>Privacy Policy</Text></TouchableOpacity>
                <Text style={styles.color_textPrivate}>.</Text>
            </View>
            <TouchableOpacity style={{ marginTop: windowHeight / 30 }} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.navButtonText}>Have an account? Sign In</Text>
            </TouchableOpacity>
        </ScrollView>
        </SafeAreaView>
    )
}

export default SignupScreen;

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingTop: 20,
        backgroundColor: '#fff'
    },
    text: {
        fontSize: 28,
        marginBottom: 20,
        marginTop: 0,
        color: '#202060',
    },
    navButtonText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#4D43BD',
    },
    textPrivate: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 20,
        justifyContent: 'center',
    },
    color_textPrivate: {
        fontSize: 12,
        fontWeight: '400',
        color: '#BDB9DB',
    },
    errorMsg: {
        color: '#DA302C',
        fontSize: 13,
        textAlign: 'left',
        alignSelf: 'flex-start',
        marginTop: -5,
        marginBottom: 15,
    },
})
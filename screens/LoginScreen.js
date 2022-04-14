import React, { useContext, useEffect, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, Image, StyleSheet, Platform, SafeAreaView } from 'react-native'
import FormInput from '../components/FormInput'
import FormButton from '../components/FormButton'
import SocialButton from '../components/SocialButton'
import { AuthContext } from '../navigation/AuthProvider';
import { windowHeight } from '../utils/Dimensions'

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    //for errors
    const [errorText, setErrorText] = useState('')

    const { login, googleLogin, appleLogin, authErrorText, setAuthErrorText, globalVars, setGlobalVars } = useContext(AuthContext)

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            setErrorText('')
            setAuthErrorText('')
            setEmail('')
            setPassword('')
        })
        return unsubscribe
    }, [navigation])

    useEffect(() => {
        setErrorText(authErrorText)
    }, [authErrorText])

    //make this a separate .js file at some point with prop for action to complete
    const runChecks = () => {
        if (email === "" && password === "") {
            setErrorText("Please enter a valid email and password.")
        } else if (password === "") {
            setErrorText("Please enter your password.")
        } else if (email === "") {
            setErrorText("Please enter a valid email.")
        } else {
            setErrorText("")
            login(email, password)
            setGlobalVars(val => ({...val, loggingIn: true}))
        }
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
                <Image
                    source={require('../assets/app-icon.png')}
                    style={styles.logo}
                />
                <Text style={styles.text}>{'DietPeeps'}</Text>

                <FormInput
                    labelValue={email}
                    onChangeText={(userEmail) => setEmail(userEmail)}
                    placeholderText="Email"
                    iconType="mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
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

                <Text style={styles.errorMsg}>
                    {errorText}
                </Text>

                <FormButton
                    buttonTitle="Sign In"
                    onPress={() => runChecks()}
                />
                {Platform.OS === 'ios' ? 
                <SocialButton
                    buttonTitle="Sign In with Apple"
                    btnType="apple"
                    color="white"
                    backgroundColor="black"
                    onPress={() => {appleLogin(); setGlobalVars(val => ({...val, loggingIn: true}))}}
                />
                : null}
                <SocialButton
                    buttonTitle="Sign In with Google"
                    btnType="google"
                    color="#EA4335"
                    backgroundColor="#F7E7E6"
                    onPress={() => {googleLogin(); setGlobalVars(val => ({...val, loggingIn: true}))}}
                />
                <TouchableOpacity style={{ marginTop: windowHeight / 30 }} onPress={() => navigation.navigate('Forgot Password')}>
                    <Text style={styles.navButtonText}>Forgot password?</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: windowHeight / 30 }} onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.navButtonText}>{"Create an account"}</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    )
}

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
        paddingTop: 30,
        backgroundColor: '#fff'
    },
    logo: {
        height: 120,
        width: 120,
    },
    text: {
        fontSize: 28,
        marginBottom: 20,
        color: '#202060',
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal'
    },
    navButton: {
        marginTop: 15,
    },
    navButtonText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#4D43BD',
        textAlign: 'center'
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
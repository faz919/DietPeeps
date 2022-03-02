import React, { useContext, useState, useEffect } from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import FormInput from '../components/FormInput'
import FormButton from '../components/FormButton'
import { AuthContext } from '../navigation/AuthProvider';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('')

  //for errors
  const [errorText, setErrorText] = useState('')

  const { forgotPassword, authErrorText, emailSent, setAuthErrorText } = useContext(AuthContext)

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setErrorText('')
      setAuthErrorText('')
      setEmail('')
    })
    return unsubscribe
  }, [navigation])

  useEffect(() => {
    setErrorText(authErrorText)
  }, [authErrorText])

  //make this a separate .js file at some point with prop for action to complete
  const runChecks = () => {
    if (email === "") {
      setErrorText("Please enter your email.")
    } else {
      setErrorText("")
      forgotPassword(email)
    }
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
    <View style={styles.container}>

      <Text style={styles.text}>Forgot your password?</Text>

      <Text style={{ justifyContent: 'center', textAlign: 'center', marginBottom: 40, fontSize: 15, color: '#051d5f' }}>Type in the email for your account below. You will receive an email with a link to reset your password.</Text>

      <FormInput
        labelValue={email}
        onChangeText={(userEmail) => setEmail(userEmail)}
        placeholderText="example@mail.com"
        iconType="user"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        error={errorText !== "" ? true : false}
      />

      {setErrorText === '' ? null :
        <Text style={styles.errorMsg}>
          {errorText}
        </Text>}


      <FormButton
        buttonTitle={emailSent ? "Sent!" : "Send"}
        onPress={() => {
          runChecks()
        }}
        disabled={emailSent ? true : false}
        loading={true}
      />

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.navButtonText}>Have another account? Sign In</Text>
      </TouchableOpacity>

    </View>
    </SafeAreaView>
  )
}

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  text: {
    fontSize: 28,
    marginBottom: 20,
    marginTop: 20,
    color: '#202060',
  },
  navButton: {
    marginTop: 75,
    marginBottom: 80,
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
    marginBottom: 30,
    justifyContent: 'center',
  },
  color_textPrivate: {
    fontSize: 13,
    fontWeight: '400',
    color: 'grey',
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
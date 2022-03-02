import React, { useState } from 'react';
import {View, TextInput, StyleSheet, TouchableOpacity} from 'react-native';
import {windowHeight, windowWidth} from '../utils/Dimensions';

import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';

const FormInput = ({labelValue, placeholderText, iconType, passwordInput, error, ...rest}) => {
  const [showPassword, setShowPassword] = useState(false)
  const toggleVisible = () => setShowPassword(!showPassword)
  return (
    <View style={[styles.inputContainer, {borderColor: error? '#DA302C':'#ccc'}]}>
      <View style={styles.iconStyle}>
        <AntDesign name={iconType} size={25} color="#666" />
      </View>
      <TextInput
        value={labelValue}
        style={styles.input}
        numberOfLines={1}
        placeholder={placeholderText}
        placeholderTextColor="#666"
        secureTextEntry={passwordInput ? (showPassword ? false:true):false}
        {...rest}
      />
      {passwordInput ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleVisible}
        >
          {showPassword ?
            <View style={[styles.iconStyle, {borderRightWidth: 0,}]}>
              <Feather
                name="eye"
                color="grey"
                size={20}
              />
            </View>
            :
            <View style={[styles.iconStyle, {borderRightWidth: 0,}]}>
              <Feather
                name="eye-off"
                color="grey"
                size={20}
              />
            </View>
          }
      </TouchableOpacity>)
      : null}
    </View>
  );
};

export default FormInput;

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 5,
    marginBottom: 10,
    width: '100%',
    height: windowHeight / 15,
    borderColor: '#ccc',
    borderRadius: 10,
    borderWidth: 1,        
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  iconStyle: {
    padding: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightColor: '#ccc',
    borderRightWidth: 1,
    width: 50,
  },
  input: {
    padding: 10,
    flex: 1,
    fontSize: 16,
    color: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputField: {
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    width: windowWidth / 1.5,
    height: windowHeight / 15,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 14
  },
});
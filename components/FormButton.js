import React from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import {windowHeight} from '../utils/Dimensions';

const FormButton = ({buttonTitle, customBGColor, color, disabled, ...rest}) => {
  return (
    <TouchableOpacity style={[styles.buttonContainer, {backgroundColor: customBGColor ? color:"#4C44D4", opacity: disabled? 0.8:1}]} disabled={disabled?true:false} {...rest}>
      <Text style={styles.buttonText}>{buttonTitle}</Text>
    </TouchableOpacity>
  );
};

export default FormButton;

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
    height: windowHeight / 15,
    backgroundColor: '#4C44D4',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
    color: '#ffffff',
  },
});
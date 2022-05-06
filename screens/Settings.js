import React, { useContext } from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { AuthContext } from '../navigation/AuthProvider'
import { windowWidth } from '../utils/Dimensions';
import BackButton from '../components/BackButton.js'

const Settings = ({ navigation }) => {

    const { logout, user } = useContext(AuthContext)

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#E6E7FA' }}>
            <View style={styles.ViewLa} >
                <Text style={[styles.Text_8H, { color: '#202060' }]}>
                    {'Settings'}
                </Text>
            </View>
            <View style={styles.Viewjp} >
                <TouchableOpacity onPress={() => navigation.navigate('User Profile')}>
                    <View style={styles.ViewZO} >
                        <View style={styles.Viewhj}>
                            <FontAwesome
                                size={24}
                                color={'#202060'}
                                name='user-circle'
                            />
                            <Text
                                style={[styles.TextbB, { color: '#202060' }]}
                                allowFontScaling={true}
                                ellipsizeMode={'tail'}
                                textBreakStrategy={'highQuality'}
                            >
                                {'Account Settings'}
                            </Text>
                        </View>

                        <View style={styles.ViewJa}>
                            <MaterialIcons
                                name='chevron-right'
                                color={'#202060'}
                                size={24}
                            />
                        </View>
                    </View>
                    <View
                        style={styles.Divider}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openSettings('app-settings://notifications')}>
                    <View style={styles.Viewcp} >
                        <View style={styles.Viewg4}>
                            <FontAwesome
                                size={24}
                                color={'#202060'}
                                name='bell'
                            />
                            <Text
                                style={[styles.TextIj, { color: '#202060' }]}
                                allowFontScaling={true}
                                ellipsizeMode={'tail'}
                                textBreakStrategy={'highQuality'}
                            >
                                {'Notifications'}
                            </Text>
                        </View>

                        <View style={styles.Viewc1}>
                            <MaterialIcons
                                name='chevron-right'
                                color={'#202060'}
                                size={24}
                            />
                        </View>
                    </View>
                    <View
                        style={styles.Divider}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Subscription', { trialReminder: 'none' })}>
                    <View style={styles.Viewk7} >
                        <View style={styles.Viewmm}>
                            <AntDesign
                                size={24}
                                color={'#202060'}
                                name='star'
                            />
                            <Text
                                style={[styles.TextFE, { color: '#202060' }]}
                                allowFontScaling={true}
                                ellipsizeMode={'tail'}
                                textBreakStrategy={'highQuality'}
                            >
                                {'Subscription'}
                            </Text>
                        </View>

                        <View style={styles.ViewIp}>
                            <MaterialIcons
                                name='chevron-right'
                                color={'#202060'}
                                size={24}
                            />
                        </View>
                    </View>
                    <View
                        style={styles.Divider}
                    />
                </TouchableOpacity>
                {/* <TouchableOpacity>
                    <View style={styles.View_9T} >
                        <View style={styles.Viewn1}>
                            <MaterialIcons
                                size={24}
                                color={'#202060'}
                                name='chat-bubble'
                            />
                            <Text
                                style={[styles.Textc4, { color: '#202060' }]}
                                allowFontScaling={true}
                                ellipsizeMode={'tail'}
                                textBreakStrategy={'highQuality'}
                            >
                                {'Support'}
                            </Text>
                        </View>

                        <View style={styles.ViewOs}>
                            <MaterialIcons
                                name='chevron-right'
                                color={'#202060'}
                                size={24}
                            />
                        </View>
                    </View>
                    <View
                        style={styles.Divider}
                    />
                </TouchableOpacity> */}
                <TouchableOpacity onPress={() => Linking.openURL('https://dietpeeps.com')}>
                    <View style={styles.ViewaV} >
                        <View style={styles.ViewOE}>
                            <AntDesign
                                size={24}
                                color={'#202060'}
                                name='infocirlce'
                            />
                            <Text
                                style={[styles.TextCv, { color: '#202060' }]}
                                allowFontScaling={true}
                                ellipsizeMode={'tail'}
                                textBreakStrategy={'highQuality'}
                            >
                                {'Website'}
                            </Text>
                        </View>

                        <View style={styles.View_47}>
                            <MaterialIcons
                                name='chevron-right'
                                color={'#202060'}
                                size={24}
                            />
                        </View>
                    </View>
                    <View
                        style={styles.Divider}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.Viewrg} >
                <View style={styles.Viewx8} >
                    <TouchableOpacity onPress={() => logout()} style={styles.Viewx9}>
                        <MaterialIcons
                            name='logout'
                            size={20}
                            color='#202060'
                        />
                        <Text style={[styles.Textsi, { color: '#202060' }]}>
                            {'Sign Out'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <BackButton navigation={navigation} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    Text_8H: {
        marginBottom: 6,
        fontSize: 20,
        lineHeight: 24,
        fontFamily: 'System',
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
    },
    ViewLa: {
        flexGrow: 1,
        flexShrink: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    TextbB: {
        marginLeft: 12,
        fontFamily: 'System',
        fontWeight: '600',
    },
    Viewhj: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ViewJa: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ViewZO: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 60,
    },
    TextIj: {
        marginLeft: 12,
        fontFamily: 'System',
        fontWeight: '600',
    },
    Viewg4: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    Viewc1: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    Viewcp: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 60,
    },
    Textc4: {
        marginLeft: 12,
        fontSize: 14,
        fontFamily: 'System',
        fontWeight: '600',
    },
    Viewn1: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ViewOs: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    View_9T: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 60,
    },
    TextFE: {
        marginLeft: 12,
        fontFamily: 'System',
        fontWeight: '600',
    },
    Viewmm: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ViewIp: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    Viewk7: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 60,
    },
    TextCv: {
        marginLeft: 12,
        fontFamily: 'System',
        fontWeight: '600',
    },
    ViewOE: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    View_47: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ViewaV: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 60,
    },
    Divider: {
        height: 1,
        backgroundColor: 'rgba(32, 32, 96, 1)',
        width: '90%',
        alignSelf: 'center'
    },
    Viewjp: {
        flexGrow: 1,
        flexShrink: 0,
        marginLeft: 24,
        marginRight: 24,
    },
    Textsi: {
        textAlign: 'center',
        marginLeft: 8
    },
    Viewx8: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#202060',
        width: windowWidth * 0.3,
        alignSelf: 'center',
    },
    Viewx9: {
        minHeight: 54,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    Viewrg: {
        flexGrow: 1,
        flexShrink: 0,
    },
});

export default Settings
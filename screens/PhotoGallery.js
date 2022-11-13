import React, { useState, useContext, useEffect } from 'react'
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Image, SafeAreaView, ImageBackground, Platform, ScrollView, Pressable } from 'react-native'
import firestore from '@react-native-firebase/firestore'
import Modal from "react-native-modal"
import SkeletonPlaceholder from "react-native-skeleton-placeholder"
import { AuthContext } from '../navigation/AuthProvider'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import moment from 'moment'
import PieChart from 'react-native-pie-chart'
import GalleryImage from '../components/GalleryImage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import InAppReview from 'react-native-in-app-review'
import analytics from '@react-native-firebase/analytics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AnimatePresence, MotiText, MotiView } from 'moti'
import { Easing } from 'react-native-reanimated'
import ProfilePic from '../components/ProfilePic'

const PhotoGallery = ({ navigation, route }) => {
    const { user, updateInfo, globalVars, mixpanel } = useContext(AuthContext)

    const { imageInfo } = route.params

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            navigation.setParams({ imageInfo: null })
        })
        return unsubscribe
    }, [navigation])

    const [loading, setLoading] = useState(false)
    const [imageDetailView, setImageDetailView] = useState(false)
    const [imageDetailLoaded, setImageDetailLoaded] = useState(false)
    const [selectedImage, setSelectedImage] = useState([])
    const [showGradeInfo, setShowGradeInfo] = useState(false)

    const insets = useSafeAreaInsets()
    const bottomBarHeight = useBottomTabBarHeight()

    // prompt user for app review if they've submitted >= 30 images
    useEffect(() => {
        if (globalVars.images?.length >= 30) {
            AsyncStorage.getItem('@reviewed_app').then((value) => {
                if (InAppReview.isAvailable() && value == null) {
                    InAppReview.RequestInAppReview().then((result) => {
                        Platform.OS === 'ios' && result ?
                            console.log('User app review flow has launched successfully: ', result) :
                            console.log('User has reviewed app: ', result)
                        analytics().logEvent('user_reviewed_app', {
                            userID: user.uid,
                            result: result
                        })
                        updateInfo({
                            appReview: JSON.parse(result)
                        })
                        AsyncStorage.setItem('@reviewed_app', result)
                    })
                }
            })
        }
    }, [globalVars.images])

    // when hiding the image modal, hide the score details modal as well
    useEffect(() => {
        if(!imageDetailView) {
            setShowGradeInfo(false)
        }
    }, [imageDetailView])

    // skeleton array that is mapped later
    const skeleton = new Array(12).fill(0)

    const getImageDetail = (imgInfo) => {
        setSelectedImage(globalVars.images?.find(img => img.url === imgInfo.url))
        setImageDetailView(true)
    }

    // for when user clicks on chat image in the chat screen and is navigated to gallery
    useEffect(() => {
        if (imageInfo != null) {
            handleImagePress(imageInfo)
        }
    }, [imageInfo])

    const handleImagePress = async (item) => {
        await analytics().logScreenView({
            screen_name: 'GalleryImage',
            screen_class: 'GalleryImage'
        })
        mixpanel.track('GalleryImage')
        getImageDetail(item)
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ position: 'absolute', marginTop: Platform.OS === 'ios' ? insets.top : 0, width: windowWidth, height: windowHeight, zIndex: 1 }}>
                {loading ? (
                    <SkeletonPlaceholder>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {skeleton.map((i, idx) => 
                                <View key={idx} style={{
                                    width: windowWidth * (0.32),
                                    height: windowWidth * (0.32),
                                    marginLeft: windowWidth * (0.01),
                                    marginBottom: windowWidth * (0.01)
                                }} />
                            )}
                        </View>
                    </SkeletonPlaceholder>) : (
                    <View>
                        <FlatList
                            bounces={globalVars.images?.length !== 0}
                            ListEmptyComponent={(
                                <View style={{ flex: 1, alignItems: 'center', height: windowHeight * 0.5, padding: 15 }}>
                                    <Image style={{ width: '70%', height: windowHeight * 0.22, resizeMode: 'contain', borderRadius: 20, marginBottom: 20, top: windowHeight * 0.39 }} source={require('../assets/onboarding-img1.png')} />
                                    <Text style={{ color: '#202060', textAlign: 'center', fontSize: 24 }}>You haven't sent in any meal photos yet...</Text>
                                    <Text style={{ color: '#202060', textAlign: 'center', fontSize: 18, marginTop: 10 }}>Send your first image today!</Text>
                                </View>
                            )}
                            ListFooterComponent={(
                                <View style={{ margin: bottomBarHeight }} />
                            )}
                            data={globalVars.images}
                            numColumns={3}
                            initialNumToRender={18}
                            renderItem={({ item, index }) => (
                                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 20 }}>
                                    <GalleryImage item={item} index={index} onPress={() => handleImagePress(item)} />
                                </MotiView>
                            )}
                            keyExtractor={(item) => item.url}
                            showsVerticalScrollIndicator={false}
                        />
                        <Modal
                            isVisible={imageDetailView}
                            onBackButtonPress={() => setImageDetailView(false)}
                            useNativeDriverForBackdrop
                            onSwipeComplete={() => setImageDetailView(false)}
                            onBackdropPress={() => setImageDetailView(false)}
                            swipeDirection={['down']}
                            swipeThreshold={50}
                        >
                            <View style={{ width: windowWidth * 0.9, height: windowHeight * 0.5, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
                                <ImageBackground onLoadStart={() => setImageDetailLoaded(false)} onLoad={() => setImageDetailLoaded(true)} style={{ width: windowWidth * 0.9, height: windowHeight * 0.5 }} imageStyle={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomLeftRadius: selectedImage.graded ? 0 : 10, borderBottomRightRadius: selectedImage.graded ? 0 : 10, width: windowWidth * 0.9, height: windowHeight * 0.5 }} source={{ uri: selectedImage.url }}>
                                    {imageDetailLoaded ? null :
                                        <SkeletonPlaceholder backgroundColor='#e6e7fa' highlightColor='#fff' speed={800}>
                                            <View style={{ width: windowWidth * 0.9, height: windowHeight * 0.5, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomLeftRadius: selectedImage.graded ? 0 : 10, borderBottomRightRadius: selectedImage.graded ? 0 : 10 }} />
                                        </SkeletonPlaceholder>}
                                    {selectedImage.graded && imageDetailLoaded ?
                                        <>
                                            <View style={{ width: windowWidth * 0.9, height: windowHeight * 0.5, flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <View style={{ width: windowWidth * 0.9, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                    <View style={{ left: 5, elevation: 2, shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowRadius: 5, shadowOpacity: 0.5 }}>
                                                        <MotiText from={{ opacity: 0 }} animate={{ opacity: 1 }} adjustsFontSizeToFit={true} style={{ width: windowWidth * 0.9 * 0.4, fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal', color: '#fff', fontSize: windowWidth * 0.15 }}>{selectedImage.grade}</MotiText>
                                                    </View>
                                                    <View style={{ position: 'absolute', bottom: 10, right: 15 }}>
                                                        <MotiView
                                                            style={{ flexDirection: 'row' }}
                                                            from={{ width: 70, left: 0, right: 0 }}
                                                            animate={{ width: 175, left: 5, right: 5 }}
                                                            transition={{
                                                                width: {
                                                                    type: 'timing',
                                                                    easing: Easing.bezier(0.77, 0.0, 0.175, 1.0),
                                                                    duration: 700,
                                                                    delay: 100
                                                                },
                                                                left: {
                                                                    type: 'timing',
                                                                    duration: 100,
                                                                },
                                                                right: {
                                                                    type: 'timing',
                                                                    duration: 100,
                                                                    delay: 800
                                                                }
                                                            }}
                                                        >
                                                            <View style={styles.imageDetailGradeInfo}>
                                                                <MotiView style={{ zIndex: 1 }} from={{ rotate: "0deg" }} animate={{ rotate: "-360deg" }} transition={{ delay: 300 }}>
                                                                    <PieChart
                                                                        style={{ borderRadius: 30, alignSelf: 'center', marginLeft: 5 }}
                                                                        widthAndHeight={60}
                                                                        series={[selectedImage.red * 10, selectedImage.yellow * 10, selectedImage.green * 10]}
                                                                        sliceColor={['#ECF0E6', '#FFC482', '#67BB3A']}
                                                                    />
                                                                </MotiView>
                                                                <MotiView
                                                                    from={{
                                                                        width: 0,
                                                                        marginRight: 5,
                                                                        opacity: 0,
                                                                    }}
                                                                    animate={{
                                                                        width: 105,
                                                                        marginRight: 5,
                                                                        opacity: 1
                                                                    }}
                                                                    transition={{
                                                                        type: 'timing',
                                                                        easing: Easing.bezier(0.77, 0.0, 0.175, 1.0),
                                                                        width: {
                                                                            delay: 100,
                                                                            duration: 700
                                                                        },
                                                                        opacity: {
                                                                            delay: 700
                                                                        }
                                                                    }}
                                                                >
                                                                    <View style={{ height: 70, borderRadius: 10, justifyContent: 'center', alignItems: 'flex-start', marginLeft: 0, padding: 10 }}>
                                                                        <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: '#202060' }}>Green: {Math.round((selectedImage.green / (selectedImage.red + selectedImage.yellow + selectedImage.green)) * 100)}%</Text>
                                                                        <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: '#202060' }}>Yellow: {Math.round((selectedImage.yellow / (selectedImage.red + selectedImage.yellow + selectedImage.green)) * 100)}%</Text>
                                                                        <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: '#202060' }}>White: {Math.round((selectedImage.red / (selectedImage.red + selectedImage.yellow + selectedImage.green)) * 100)}%</Text>
                                                                    </View>
                                                                </MotiView>
                                                            </View>
                                                        </MotiView>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={{ position: 'absolute', top: 10, right: 10 }}>
                                                <TouchableOpacity style={{position: 'absolute', top: 0, right: 0}} onPress={() => setShowGradeInfo(true)}>
                                                    <MaterialCommunityIcons
                                                        name="information-outline"
                                                        size={28}
                                                        color="#fff"
                                                        style={{ elevation: 2, shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowRadius: 5, shadowOpacity: 0.5 }}
                                                    />
                                                </TouchableOpacity>
                                                <AnimatePresence>
                                                    {showGradeInfo &&
                                                        <MotiView
                                                            from={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 250 }}
                                                            style={styles.explanationModal}
                                                        >
                                                            <TouchableOpacity activeOpacity={1} onPress={() => setShowGradeInfo(false)}>
                                                                {/* <TouchableOpacity onPress={() => setShowGradeInfo(false)} style={styles.cancelImage}>
                                                                    <Icon
                                                                        name='ios-close'
                                                                        size={20}
                                                                        color='black'
                                                                    />
                                                                </TouchableOpacity> */}
                                                                <Text adjustsFontSizeToFit={true} style={{ color: '#202060' }}>{'Your Meal Score is calculated by first giving you points for all the green foods on your plate. Then the white foods on your plate are subtracted from this score.'}</Text>
                                                                <Text />
                                                                <Text adjustsFontSizeToFit={true} style={{ color: '#202060' }}>{'A Meal Score of 60 or higher is considered a good score.'}</Text>
                                                                <Text adjustsFontSizeToFit={true} style={{ color: '#202060', fontSize: 12, alignSelf: 'center', marginTop: 5 }}>{'(Hide)'}</Text>
                                                            </TouchableOpacity>
                                                        </MotiView>}
                                                </AnimatePresence>
                                            </View>
                                        </>
                                        : null}
                                    <Text style={{ position: 'absolute', left: 10, top: 10, color: '#fff' }}>{selectedImage.uploadedAt && moment(selectedImage.uploadedAt.toDate()).format('DD MMM YYYY')}</Text>
                                </ImageBackground>
                                {selectedImage.graded ?
                                    <View style={{ justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#fff', width: windowWidth * 0.9, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, minHeight: 75 }}>
                                        <View
                                            style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                                            <ProfilePic source={{ uri: globalVars.coachData.photoURL }} size={50} />
                                            <View style={{ marginLeft: 20 }}>
                                                <Text numberOfLines={1} style={{ paddingBottom: 5, fontSize: 22, marginTop: 5, color: '#202060' }}>{globalVars.coachData.displayName}:</Text>
                                                <Text style={{ marginBottom: 5, fontSize: 18, color: '#202060', width: windowWidth * 0.65 }}>{selectedImage.comment}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    : null}
                            </View>
                        </Modal>
                    </View>
                )}
            </View>
        </SafeAreaView>
    )
}

export default PhotoGallery

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#E6E7FA",
    },
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
    photoDisplay: {
        width: windowWidth * (0.32),
        height: windowWidth * (0.32),
        marginLeft: windowWidth * (0.01),
        marginBottom: windowWidth * (0.01),
    },
    pieChartContainer: {
        alignItems: 'center',
        top: (windowWidth * 0.32 * 0.5) - (windowWidth * 0.32 * 0.6) / 2,
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 5,
        shadowOpacity: 0.4,
    },
    imageDetailGradeInfo: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 5,
        shadowOpacity: 0.3,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 35,
    },
    statsViewContainer: {
        position: 'absolute',
        alignSelf: 'center',
        width: '100%',
        backgroundColor: '#E6E7FA',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -10 },
        shadowRadius: 5,
        shadowOpacity: 0.4,
        paddingTop: 40,
        borderRadius: 20,
        height: windowHeight
    },
    explanationModal: {
        width: windowWidth * 0.5,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 5,
        shadowOpacity: 0.3,
        padding: 10,
    },
    cancelImage: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(180,180,180,0.7)',
        position: 'absolute',
        top: 0,
        right: 0,
        width: 25,
        height: 25,
        borderRadius: 12.5
    },
})
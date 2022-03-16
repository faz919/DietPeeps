import React, { useState, useContext, useEffect } from 'react'
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Image, SafeAreaView, ImageBackground, Platform, ScrollView } from 'react-native'
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

const PhotoGallery = ({ navigation, route }) => {
    const { user, globalVars, setGlobalVars } = useContext(AuthContext)

    const { imageInfo } = route.params

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            navigation.setParams({ imageInfo: null })
        })
        return unsubscribe
    }, [navigation])

    const [loading, setLoading] = useState(false)
    const [deleteMode, setDeleteMode] = useState(false)
    const [imageDetailView, setImageDetailView] = useState(false)
    const [imageDetailLoaded, setImageDetailLoaded] = useState(false)
    const [selectedImage, setSelectedImage] = useState([])
    const [showGradeInfo, setShowGradeInfo] = useState(false)
    const [userInfo, setUserInfo] = useState({})
    const [scoreExplanationModalHeight, setScoreExplanationModalHeight] = useState(0)
    const [commentWidgetHeight, setCommentWidgetHeight] = useState(0)

    const insets = useSafeAreaInsets()
    const bottomBarHeight = useBottomTabBarHeight()

    useEffect(() => {
        let imageList = []
        return firestore()
            .collection('chat-rooms')
            .doc(globalVars.chatID)
            .collection('chat-messages')
            .where('userID', '==', user.uid)
            .orderBy('timeSent', 'desc')
            .onSnapshot((querySnapshot) => {
                querySnapshot.docs.forEach((doc) => {
                    if (doc.data().img != null) {
                        Array.prototype.push.apply(imageList, doc.data().img)
                    }
                })
                setGlobalVars(val => ({...val, images: imageList}))
                imageList = []
                if (loading) {
                    setLoading(false)
                }
            }, (e) => {
                console.log('error while fetching chat images: ', e)
            })
    }, [])

    useEffect(() => {
        if(globalVars.images >= 10) {
            AsyncStorage.getItem('@reviewed_app').then((value) => {
                if(InAppReview.isAvailable() && value == null) {
                    InAppReview.RequestInAppReview().then((result) => {
                        Platform.OS === 'ios' && result ? 
                        console.log('User app review flow has launched successfully: ', result) :
                        console.log('User has reviewed app: ', result)
                        analytics().logEvent('user_reviewed_app', {
                            userID: user.uid,
                            result: result
                        })
                        AsyncStorage.setItem('@reviewed_app', 'true')
                    })
                }
            })
        }
    }, [globalVars.images])

    //skeleton placeholder array thingy, just so that I don't have to
    //write out this view component so many times
    const skeleton = []
    for (let i = 0; i < 12; i++) {
        skeleton.push(
            <View key={i} style={{
                width: windowWidth * (0.32),
                height: windowWidth * (0.32),
                marginLeft: windowWidth * (0.01),
                marginBottom: windowWidth * (0.01)
            }} />
        )
    }

    const getImageDetail = (imgInfo) => {
        setSelectedImage(imgInfo)
        setImageDetailView(true)
    }

    useEffect(() => {
        if(imageInfo != null){
            getImageDetail(imageInfo)
        }
    }, [imageInfo])

    useEffect(() => {
        firestore()
            .collection('user-info')
            .doc(user.uid)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    return setUserInfo(doc.data())
                }
            })
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ position: 'absolute', marginTop: Platform.OS === 'ios' ? insets.top : 0, width: windowWidth, height: windowHeight, zIndex: 1 }}>
                {loading ? (
                    <SkeletonPlaceholder>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {skeleton}
                        </View>
                    </SkeletonPlaceholder>) : (
                    <View>
                        <FlatList
                            ListEmptyComponent={(
                                <View style={{ flex: 1, alignItems: 'center', height: windowHeight * 0.5, padding: 15 }}>
                                    <Image style={{ width: '70%', height: windowHeight * 0.22, resizeMode: 'contain', borderRadius: 20, marginBottom: 20, top: windowHeight * 0.39 }} source={require('../assets/onboarding-img1.png')} />
                                    <Text style={{ color: '#202060', textAlign: 'center', fontSize: 24 }}>You haven't sent in any meal photos yet...</Text>
                                    <Text style={{ color: '#202060', textAlign: 'center', fontSize: 18, marginTop: 10 }}>Add your first image today!</Text>
                                </View>
                            )}
                            ListFooterComponent={(
                                <View style={{ margin: bottomBarHeight }} />
                            )}
                            data={globalVars.images}
                            numColumns={3}
                            initialNumToRender={18}
                            renderItem={({ item }) => (
                                <GalleryImage item={item} onPress={() => getImageDetail(item)} />
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
                                </SkeletonPlaceholder> }
                                    {selectedImage.graded ?
                                    <>
                                        <View style={{ width: windowWidth * 0.9, height: windowHeight * 0.5, flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View style={{ width: windowWidth * 0.9, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                <View style={{ left: 5, elevation: 2, shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowRadius: 5, shadowOpacity: 0.5 }}>
                                                    <Text adjustsFontSizeToFit={true} style={{ width: windowWidth * 0.9 * 0.4, fontWeight: 'bold', color: '#fff', fontSize: windowWidth * 0.15 }}>{selectedImage.grade}</Text>
                                                </View>
                                                <View style={{ bottom: 10, right: 10 }}>
                                                    <View style={styles.imageDetailGradeInfo}>
                                                        <PieChart
                                                            style={{ borderRadius: 30, alignSelf: 'center', marginLeft: 5 }}        
                                                            widthAndHeight={60}
                                                            series={[selectedImage.red * 10, selectedImage.yellow * 10, selectedImage.green * 10]}
                                                            sliceColor={['#C70039', '#EBD32E', '#43CD3F']}
                                                        />
                                                        <View style={{ borderRadius: 10, justifyContent: 'center', alignItems: 'flex-start', marginLeft: 0, padding: 10, marginRight: 10 }}>
                                                            <Text style={{ color: '#202060' }}>Red: {Math.round((selectedImage.red / (selectedImage.red + selectedImage.yellow + selectedImage.green)) * 100)}%</Text>
                                                            <Text style={{ color: '#202060' }}>Yellow: {Math.round((selectedImage.yellow / (selectedImage.red + selectedImage.yellow + selectedImage.green)) * 100)}%</Text>
                                                            <Text style={{ color: '#202060' }}>Green: {Math.round((selectedImage.green / (selectedImage.red + selectedImage.yellow + selectedImage.green)) * 100)}%</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{ position: 'absolute', top: 10, right: 10 }}>
                                                <TouchableOpacity onPress={() => setShowGradeInfo(true)}>
                                                    <MaterialCommunityIcons
                                                        name="information-outline"
                                                        size={28}
                                                        color="#fff"
                                                        style={{ elevation: 2, shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowRadius: 5, shadowOpacity: 0.5 }}
                                                    />
                                                </TouchableOpacity>
                                                <Modal
                                                    animationIn="fadeIn"
                                                    animationOut="fadeOut"
                                                    backdropOpacity={0}
                                                    isVisible={showGradeInfo}
                                                    onBackButtonPress={() => setShowGradeInfo(false)}
                                                    useNativeDriverForBackdrop
                                                    onBackdropPress={() => setShowGradeInfo(false)}
                                                    style={{ alignItems: 'flex-end', right: 10, justifyContent: 'center' }}
                                                >
                                                    <View
                                                        onLayout={(event) => {
                                                            const { height } = event.nativeEvent.layout
                                                            setScoreExplanationModalHeight(height)
                                                        }}
                                                        style={[styles.explanationModal, {top: scoreExplanationModalHeight ? (scoreExplanationModalHeight/2)-(windowHeight * 0.25) - (commentWidgetHeight/2) + 10 : 0 }]}
                                                    >
                                                        <Text adjustsFontSizeToFit={true} style={{ color: '#202060' }}>{'Your Meal Score is calculated by first giving you points for all the green foods on your plate. Then the red foods on your plate are subtracted from this score.'}</Text>
                                                        <Text />
                                                        <Text adjustsFontSizeToFit={true} style={{ color: '#202060' }}>{'A Meal Score of 60 or higher is considered a good score.'}</Text>
                                                    </View>
                                                </Modal>
                                            </View>
                                            </>
                                        : null}
                                    <Text style={{ position: 'absolute', left: 10, top: 10, color: '#fff' }}>{selectedImage.uploadedAt == undefined ? null : moment(selectedImage.uploadedAt.toDate()).format('DD MMM YYYY')}</Text>
                                </ImageBackground>
                                {selectedImage.graded ?
                                <View style={{ justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#fff', width: windowWidth * 0.9, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, minHeight: 75 }}>
                                        <View 
                                            onLayout={(event) => {
                                                const { height } = event.nativeEvent.layout
                                                setCommentWidgetHeight(height)
                                            }} 
                                            style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                                            <Image source={{ uri: globalVars.coachData.photoURL }} style={{ height: 50, width: 50, borderRadius: 25 }} />
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
        backgroundColor: 'rgba(255,255,255,0.9)',
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
        padding: 10
    }
})
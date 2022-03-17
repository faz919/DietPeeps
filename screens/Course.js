import React, { useContext, useEffect, useState } from 'react'
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import { AuthContext } from '../navigation/AuthProvider'
import { windowWidth, windowHeight } from '../utils/Dimensions'
import BackButton from '../components/BackButton.js'
import analytics from '@react-native-firebase/analytics'
import { AnimatePresence, MotiText, MotiView, useAnimationState } from 'moti'
import { Easing } from 'react-native-reanimated'

const Course = ({ navigation, route }) => {

    const { courseData, courseCompleted } = route.params

    const { updateInfo, user } = useContext(AuthContext)

    const [loading, setLoading] = useState(true)
    const [showButton, setShowButton] = useState(false)

    // size of loading indicator
    const size = 100

    // amount of time to wait until loading is "finished"
    const loadingDelay = 10000

    // breathing speed
    const breatheSpeed = 10000

    // speed of exit animation
    const exitAnimSpeed = 1000

    // breathing type
    const breatheType = Easing.bezier(0.175, 0.885, 0.32, 1.275)

    useEffect(() => {
        analytics().logEvent('course_started', {
            userID: user.uid,
            courseNumber: courseData.UniqueCourseNumber,
            courseStartedAt: new Date()
        })
        const loadingTimer = setTimeout(() => {
            setLoading(false)
        }, loadingDelay)
        const buttonTimer = setTimeout(() => {
            setShowButton(true)
        }, loadingDelay + 15000)
        return () => {
            clearTimeout(loadingTimer)
            clearTimeout(buttonTimer)
        }
    }, [])

    const completeCourse = async () => {
        updateInfo({
            courseData: {
                latestCourseCompleted: courseData.UniqueCourseNumber,
                courseCompletedAt: new Date(),
                courseDay: courseData.Courseday,
                courseDayCompleted: courseData.UniqueCourseNumber >= courseData.MaxCourseinDay ? true : false
            }
        })
        await analytics().logEvent('course_completed', {
            userID: user.uid,
            courseData: {
                latestCourseCompleted: courseData.UniqueCourseNumber,
                courseCompletedAt: new Date(),
                courseDay: courseData.Courseday,
                courseDayCompleted: courseData.UniqueCourseNumber >= courseData.MaxCourseinDay ? true : false
            }
        })
        navigation.navigate('Main Menu')
    }
    
    return (
        <View style={{ flex: 1, backgroundColor: '#E6E7FA' }}>
            <MotiView
                from={{
                    opacity: 0
                }}
                animate={{
                    opacity: 1
                }}
                transition={{
                    delay: loadingDelay + exitAnimSpeed + 200
                }}
                style={{ flex: 1 }}
            >
                <WebView
                    source={{ uri: courseData.CourseLink }}
                    style={{ backgroundColor: '#E6E7FA' }}
                />
            </MotiView>
            <AnimatePresence>
                {loading ?
                    <View style={{ padding: 20, position: 'absolute', width: windowWidth, height: windowHeight, backgroundColor: '#202060', justifyContent: 'center', alignItems: 'center' }}>
                        <MotiView
                            style={{
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                borderWidth: size / 10,
                                borderColor: '#fff',
                                shadowColor: '#fff',
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 1,
                                shadowRadius: 10,
                            }}
                            from={{
                                opacity: 1,
                                width: size - 20,
                                height: size - 20,
                                borderRadius: (size - 20) / 2,
                                borderWidth: size / 20,
                                scale: 1
                            }}
                            animate={{
                                opacity: 1,
                                width: size + 60,
                                height: size + 60,
                                borderRadius: (size + 60) / 2,
                                borderWidth: size / 10,
                                scale: 1
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0
                            }}
                            transition={{
                                type: 'timing',
                                duration: breatheSpeed,
                                easing: breatheType,
                                loop: true,
                                scale: {
                                    duration: exitAnimSpeed,
                                    type: 'timing'
                                },
                                opacity: {
                                    duration: exitAnimSpeed,
                                    type: 'timing'
                                }
                            }}
                        />
                        {Array.apply(null, { length: Math.floor((loadingDelay/breatheSpeed) * 2) }).map((i, index) => 
                            <MotiView 
                                style={{
                                    position: 'absolute',
                                    width: size,
                                    height: size,
                                    borderRadius: size / 2,
                                    borderWidth: size / 50,
                                    borderColor: '#fff',
                                    shadowColor: '#fff',
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 1,
                                    shadowRadius: 10,
                                }}
                                from={{
                                    width: size - 20,
                                    height: size - 20,
                                    borderRadius: (size - 20) / 2,
                                    opacity: 0.7, scale: 1
                                }}
                                animate={{
                                    width: size + 60,
                                    height: size + 60,
                                    borderRadius: (size + 60) / 2,
                                    opacity: 0, scale: 6
                                }}
                                transition={{
                                    type: 'timing',
                                    duration: breatheSpeed,
                                    easing: breatheType,
                                    loop: true,
                                    scale: {
                                        duration: breatheSpeed * 2,
                                        delay: index * (breatheSpeed / 2),
                                        repeatReverse: false,
                                    },
                                    opacity: {
                                        delay: index * (breatheSpeed / 2),
                                        repeatReverse: false,
                                    }
                                }}
                                key={index}

                            />
                        )}
                        <MotiText
                            style={{
                                fontSize: 40,
                                fontWeight: 'bold',
                                letterSpacing: 0,
                                textAlign: 'center',
                                color: '#fff',
                                borderColor: '#fff',
                                shadowColor: '#fff',
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.9,
                                shadowRadius: 1,
                                bottom: windowHeight / 5,
                                position: 'absolute'
                            }}
                            from={{
                                opacity: 0,
                                scale: 1
                            }}
                            animate={{
                                opacity: [
                                    { value: 1, duration: 1000 }, 
                                    { value: 0, delay: 2000, duration: 1000 },
                                    { value: 0, delay: 500, duration: 1000 }
                                ],
                                scale: 1
                            }}
                            exit={{
                                scale: 0
                            }}
                            transition={{
                                type: 'timing',
                                loop: true,
                                repeatReverse: false,
                                scale: {
                                    duration: exitAnimSpeed,
                                    type: 'timing'
                                }
                            }}
                        >
                            Take a deep breath...
                        </MotiText>
                    </View>
                    :
                    showButton ?
                        <TouchableOpacity disabled={courseCompleted} style={[styles.panelButton, { opacity: courseCompleted ? 0.5 : 1 }]} onPress={() => completeCourse()}>
                            <Text style={styles.panelButtonTitle}>{courseCompleted ? 'Course Completed!' : 'Complete Course'}</Text>
                        </TouchableOpacity>
                        : null
                }
            </AnimatePresence>
            <BackButton navigation={navigation} color={'#BDB9DB'} />
        </View>
    )
}

const styles = StyleSheet.create({
    panelButton: {
        padding: 13,
        borderRadius: 10,
        backgroundColor: '#4C44D4',
        alignItems: 'center',
        marginVertical: 7,
        position: 'absolute',
        width: '95%',
        alignSelf: 'center',
        bottom: 25
    },
    panelButtonTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white',
    },
})

export default Course
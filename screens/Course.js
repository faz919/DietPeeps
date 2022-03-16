import React, { useContext, useEffect, useState } from 'react'
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import { AuthContext } from '../navigation/AuthProvider'
import { windowWidth, windowHeight } from '../utils/Dimensions'
import BackButton from '../components/BackButton.js'
import Spinner from 'react-native-spinkit'
import analytics from '@react-native-firebase/analytics'

const Course = ({ navigation, route }) => {

    const { courseData, courseCompleted } = route.params

    const { updateInfo, user } = useContext(AuthContext)

    const [loading, setLoading] = useState(true)
    const [showButton, setShowButton] = useState(false)

    useEffect(() => {
        analytics().logEvent('course-started', {
            userID: user.uid,
            courseNumber: courseData.UniqueCourseNumber,
            courseStartedAt: new Date()
        })
        const loadingTimer = setTimeout(() => {
            setLoading(false)
        }, 5000)
        const buttonTimer = setTimeout(() => {
            setShowButton(true)
        }, 20000) 
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
            <WebView
                source={{ uri: courseData.CourseLink }}
                style={{ backgroundColor: '#E6E7FA' }}
            />
            {loading ?
                <View style={{ position: 'absolute', width: windowWidth, height: windowHeight, backgroundColor: 'rgba(32,32,96,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                    <Spinner type={'FadingCircleAlt'} isVisible={true} color='#BDB9DB' size={120} />
                </View>
                :
                showButton ?
                    <TouchableOpacity disabled={courseCompleted} style={[styles.panelButton, { opacity: courseCompleted ? 0.5 : 1 }]} onPress={() => completeCourse()}>
                        <Text style={styles.panelButtonTitle}>{courseCompleted ? 'Course Completed!' : 'Complete Course'}</Text>
                    </TouchableOpacity>
                    : null
            }
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
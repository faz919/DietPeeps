import React, { useState, useContext, useEffect } from 'react'
import { ActivityIndicator, FlatList, ImageBackground, StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native'
import CourseData from '../courses/CourseData.json'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { AuthContext } from '../navigation/AuthProvider'
import firestore from '@react-native-firebase/firestore'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ToggleButtonRow from '../components/ToggleButtonRow'
import CourseImage from '../components/CourseImage'
import { AnimatePresence, MotiView } from 'moti'

const CourseSelection = ({ navigation, route }) => {

  const { courseInfo, courseCompleted, courseDayCompleted } = route.params 

  const { updateInfo, user } = useContext(AuthContext)
  const [userCourseData, setUserCourseData] = useState(3)
  const [loading, setLoading] = useState(true)
  const [starred, setStarred] = useState([])
  const [sortBy, setSortBy] = useState('To Do')

  const stopLoading = () => {
    if (loading) {
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      navigation.setParams({ courseInfo: null, courseCompleted: null })
    })
    return unsubscribe
  }, [navigation])

  useEffect(() => {
    if (courseInfo != null) {
      navigation.navigate('Course', { courseData: courseInfo, courseCompleted: courseCompleted })
    } 
    else if (courseInfo == null && courseCompleted && courseDayCompleted) {
      navigation.navigate('Congrats', { congratsType: 'courseDayCompletion' })
    }
  }, [courseInfo, courseCompleted])

  useEffect(() => {
    const unsub = firestore()
      .collection('user-info')
      .doc(user.uid)
      .onSnapshot((doc) => {
        const c = doc.data().courseData
        let localDayStart = new Date()
        localDayStart.setHours(0)
        localDayStart.setMinutes(0)
        localDayStart.setSeconds(0)
        localDayStart.setMilliseconds(0)
        if (c.courseDayCompleted) {
          if (localDayStart > c.courseCompletedAt?.toDate()) {
            setUserCourseData({
              latestCourseCompleted: c.latestCourseCompleted,
              courseCompletedAt: c.courseCompletedAt,
              courseDay: c.courseDay + 1,
              courseDayCompleted: false
            })
            updateInfo({
              courseData: {
                latestCourseCompleted: c.latestCourseCompleted,
                courseCompletedAt: c.courseCompletedAt,
                courseDay: c.courseDay + 1,
                courseDayCompleted: false
              }
            })
            stopLoading()
            return null
          } else {
            setUserCourseData(c)
            stopLoading()
            return null
          }
        } else {
          setUserCourseData({
            latestCourseCompleted: c.latestCourseCompleted ? c.latestCourseCompleted : 0,
            courseCompletedAt: c.courseCompletedAt ? c.courseCompletedAt : new Date(),
            courseDay: c.courseDay ? c.courseDay : 1,
            courseDayCompleted: false
          })
        }
        stopLoading()
        return null
      }, (e) => {
        console.error('error while updating course data: ', e)
      })
    return () => unsub()
  }, [])

  useEffect(() => {
    const getStarredCourses = async () => {
      const data = await AsyncStorage.getItem('@starred_courses')
      if (data != null) {
        setStarred(JSON.parse(data))
      } else {
        return null
      }
    }
    getStarredCourses()
  }, [])

  useEffect(() => {
    AsyncStorage.setItem('@starred_courses', JSON.stringify(starred))
  }, [starred])

  const relevantCourses = CourseData.filter(course => course.Courseday <= userCourseData.courseDay)
  let coursesSort
  let listEmptyText
  switch (sortBy) {
    case 'Completed':
      coursesSort = relevantCourses.filter(course => userCourseData.latestCourseCompleted >= course.UniqueCourseNumber)
      listEmptyText = 'No courses completed. \n Complete your first course today!'
      break
    case 'To Do':
      coursesSort = relevantCourses.filter(course => userCourseData.latestCourseCompleted < course.UniqueCourseNumber)
      listEmptyText = 'No more courses for today! \n Check back tomorrow for new courses.'
      break
    case 'Starred':
      coursesSort = relevantCourses.filter(course => starred[course.UniqueCourseNumber] === true)
      listEmptyText = 'No courses starred!'
      break
  }

  return (
    <SafeAreaView style={{ backgroundColor: '#E6E7FA', flex: 1 }}>
      <View style={styles.ViewGU}>
        <Text style={[styles.Textp6, { color: '#202060', zIndex: 1 }]}>{'Courses'}</Text>
        {loading ?
          <View style={{ flex: 1, width: windowWidth, height: windowHeight, backgroundColor: '#E6E7FA' }}>
            <ActivityIndicator style={{ alignSelf: 'center', top: 100 }} size={35} color="#202060" />
          </View> :
          <>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={coursesSort.reverse()}
              initialNumToRender={6}
              contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 55, paddingBottom: 50, backgroundColor: '#E6E7FA' }}
              ListEmptyComponent={(
                <View style={{alignItems: 'center', margin: 20}}>
                  <Text style={{color: '#BDB9DB', textAlign: 'center'}}>{listEmptyText}</Text>
                </View>
              )}
              inverted
              renderItem={({ item, index }) => {
                return (
                  <MotiView
                    from={{
                      opacity: 0
                    }}
                    animate={{
                      opacity: item.UniqueCourseNumber - userCourseData.latestCourseCompleted > 1 ? 0.5 : 1
                    }}
                    transition={{
                      duration: 450
                    }}
                    key={index}
                    style={[styles.Viewe6, { borderRadius: 6, opacity: item.UniqueCourseNumber - userCourseData.latestCourseCompleted > 1 ? 0.5 : 1 }]}>
                    <CourseImage item={item} userCourseData={userCourseData} navigation={navigation} /> 
                    <View style={styles.View_92}>
                      <TouchableOpacity disabled={item.UniqueCourseNumber - userCourseData.latestCourseCompleted > 1} onPress={() => navigation.navigate('Course', { courseData: item, courseCompleted: userCourseData.latestCourseCompleted >= item.UniqueCourseNumber ? true : false })}>
                        <View>
                          <Text style={styles.TexthV}>
                            {item.Title}
                          </Text>
                          <Text style={{ color: '#202060' }}>
                            {item.Subtitle}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.TouchableMR}>
                        <View style={styles.ViewoC}>
                          <TouchableOpacity disabled={item.UniqueCourseNumber - userCourseData.latestCourseCompleted > 1} onPress={() => { let newArr = [...starred]; newArr[item.UniqueCourseNumber] = !newArr[item.UniqueCourseNumber]; setStarred(newArr) }}>
                            <FontAwesome
                              color={starred[item.UniqueCourseNumber] ? '#FFCD3C' : '#202060'}
                              size={24}
                              name={starred[item.UniqueCourseNumber] ? 'star' : 'star-o'}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </MotiView>
                )
              }}
              keyExtractor={(item) => item.CoverLink}
            />
            <View style={{position: 'absolute', width: windowWidth - 20, alignSelf: 'center', backgroundColor: '#e6e7fa', height: 45}} />
            <View style={{position: 'absolute', width: windowWidth, top: 45}}>
              <ToggleButtonRow
                highlightBackgroundColor={'#4D43BD'}
                highlightTextColor={'white'}
                inactiveBackgroundColor={'transparent'}
                inactiveTextColor={'#BDB9DB'}
                values={['Completed', 'To Do', 'Starred']}
                value={sortBy}
                onSelect={value => setSortBy(value)}
                style={{ marginHorizontal: 10, height: windowHeight / 24, backgroundColor: '#e6e7fa' }}
              />
            </View>
          </>
        }
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  Textp6: {
    textAlign: 'center',
    fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
    fontSize: 24,
    letterSpacing: 0,
    lineHeight: 34,
  },
  ViewGU: {
    marginTop: 10,
    backgroundColor: '#E6E7FA',
  },
  ImageBackgroundmU: {
    width: '100%',
    height: '100%',
  },
  ViewJX: {
    width: 140,
    height: 140,
    overflow: 'hidden',
  },
  TexthV: {
    width: '100%',
    textAlign: 'left',
    marginBottom: 4,
    fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
    fontSize: 18,
    letterSpacing: 0,
    color: '#202060'
  },
  ViewoC: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 60,
  },
  TouchableMR: {
    paddingTop: 8,
    paddingRight: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  View_92: {
    alignSelf: 'flex-start',
    justifyContent: 'space-between',
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 16,
  },
  Viewe6: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    paddingRight: 8,
    marginTop: 16
  },
  ScrollViewaOContent: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  screen: {
    flex: 1,
  },
  checkmarkStyle: {
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 5,
    shadowOpacity: 0.4,
    left: 3
  }
})

export default CourseSelection
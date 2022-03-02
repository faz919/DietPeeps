import React, { useState, useContext, useEffect } from 'react'
import { ActivityIndicator, FlatList, ImageBackground, StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native'
import CourseData from '../courses/CourseData.json'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Icon from 'react-native-vector-icons/Ionicons'
import { AuthContext } from '../navigation/AuthProvider'
import firestore from '@react-native-firebase/firestore'
import { windowHeight, windowWidth } from '../utils/Dimensions'
import AsyncStorage from '@react-native-async-storage/async-storage'

const CourseSelection = ({ navigation }) => {

  const { updateInfo, user } = useContext(AuthContext)
  const [userCourseData, setUserCourseData] = useState(3)
  const [loading, setLoading] = useState(true)
  const [starred, setStarred] = useState([])

  const stopLoading = () => {
    if (loading) {
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }

  useEffect(() => {
    return firestore()
      .collection('user-info')
      .doc(user.uid)
      .onSnapshot((doc) => {
        const c = doc.data().courseData
        let now = new Date()
        let oneDay = 60 * 60 * 24 * 1000
        if (c.courseDayCompleted === true) {
          if (now - c.courseCompletedAt.toDate() >= oneDay) {
            setUserCourseData({
              courseData: {
                latestCourseCompleted: c.latestCourseCompleted,
                courseCompletedAt: c.courseCompletedAt,
                courseDay: c.courseDay + 1,
                courseDayCompleted: false
              }
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
        }
        setUserCourseData(c)
        stopLoading()
        return null
      }, (e) => {
        console.log('error while updating course data: ', e)
      })
  }, [])

  useEffect(() => {
    const getStarredCourses = async () => {
      const data = await AsyncStorage.getItem('@starred_courses')
      if(data != null) {
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

  return (
    <SafeAreaView style={{ backgroundColor: '#E6E7FA', flex: 1 }}>
      <View style={styles.ViewGU}>
        <Text
          style={[
            styles.Textp6,
            { color: '#202060' },
          ]}
        >
          {'Courses'}
        </Text>
        {loading ?
          <View style={{ flex: 1, width: windowWidth, height: windowHeight, backgroundColor: '#E6E7FA' }}>
            <ActivityIndicator style={{ alignSelf: 'center', top: 100 }} size={35} color="#202060" />
          </View> :
          <FlatList
            showsVerticalScrollIndicator={false}
            data={relevantCourses.reverse()}
            initialNumToRender={6}
            contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 65, backgroundColor: '#E6E7FA' }}
            inverted
            renderItem={({ item, index }) => {
              return (
                <View
                  style={[styles.Viewe6, { borderRadius: 6, opacity: item.UniqueCourseNumber - userCourseData.latestCourseCompleted > 1 ? 0.5 : 1 }]}
                >
                  <View style={[styles.ViewJX, { borderRadius: 16 }]}>
                    <TouchableOpacity disabled={item.UniqueCourseNumber - userCourseData.latestCourseCompleted > 1} onPress={() => navigation.navigate('Course', { courseData: item, courseCompleted: userCourseData.latestCourseCompleted >= item.UniqueCourseNumber ? true : false })}>
                      <ImageBackground
                        style={[
                          styles.ImageBackgroundmU,
                          { borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
                        ]}
                        imageStyle={{
                          opacity: userCourseData.latestCourseCompleted >= item.UniqueCourseNumber ? 0.3 : 1
                        }}
                        resizeMode={'cover'}
                        source={{ uri: `${item.CoverLink}` }}
                      >
                        {userCourseData.latestCourseCompleted >= item.UniqueCourseNumber ?
                          <Icon
                            name='checkmark-circle-outline'
                            size={100}
                            color='#4bb543'
                            style={styles.checkmarkStyle}
                          />
                          : null
                        }
                      </ImageBackground>
                    </TouchableOpacity>
                  </View>

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
                      <TouchableOpacity disabled={item.UniqueCourseNumber - userCourseData.latestCourseCompleted > 1} onPress={() => {let newArr = [...starred]; newArr[index] = !newArr[index]; setStarred(newArr)}}>
                        <FontAwesome
                          color={starred[index] ? '#FFCD3C' : '#202060'}
                          size={24}
                          name={starred[index] ? 'star' : 'star-o'}
                        />
                      </TouchableOpacity>
                      {/* <Entypo
                            color='#202060'
                            size={24}
                            name='bookmarks'
                          /> */}
                    </View>
                  </View>
                  </View>
                </View>
              )
            }}
            keyExtractor={(item) => item.CoverLink}
          />
        }
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  Textp6: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 0,
    lineHeight: 34,
  },
  ViewGU: {
    marginTop: 10,
    backgroundColor:'#E6E7FA',
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
    fontWeight: 'bold',
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
    marginTop: 16,
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
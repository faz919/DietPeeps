import React, { useContext, useState } from 'react'
import { ImageBackground, SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { AuthContext } from '../navigation/AuthProvider'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import BackButton from '../components/BackButton'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

const CoachProfile = ({ navigation }) => {

  const { globalVars } = useContext(AuthContext)
  const [loading, setLoading] = useState(true)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e6e7fa' }}>
      <View style={styles.ViewWi}>
        <ImageBackground onLoad={() => setLoading(false)} style={[styles.Image_9l, { backgroundColor: '#e6e7fa' }]}
          source={{ uri: globalVars.coachData.photoURL }}
        >
          {loading &&
            <SkeletonPlaceholder backgroundColor='#BDB9DB' highlightColor='#e6e7fa' speed={1000}>
              <View style={styles.Image_9l} />
            </SkeletonPlaceholder>}
        </ImageBackground>
      </View>
      <View style={styles.ViewmY}>
        <View style={styles.ViewvG}>
          <Text style={[styles.TextOd, { color: '#202060' }]}>
            {globalVars.coachData.displayName}
          </Text>
          <MaterialCommunityIcons
            color={'#202060'}
            size={20}
            name='check-decagram'
          />
        </View>

        {/* <View style={styles.ViewEk}>
          <TouchableOpacity>
            <FontAwesome
              color='#202060'
              size={24}
              name='twitter-square'
            />
          </TouchableOpacity>

          <TouchableOpacity>
            <FontAwesome
              color='#202060'
              size={24}
              name='google-plus-square'
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.TouchableOpacityLv}>
            <FontAwesome
              color='#202060'
              size={24}
              name='facebook-square'
            />
          </TouchableOpacity>
        </View> */}

        <Text style={[styles.Textra, { color: '#202060' }]}>
          {'About Me'}
        </Text>

        <Text style={[styles.TextBM, { color: '#202060' }]}>
          {globalVars.coachData.coachInfo?.bio || `Hey! I'm ${globalVars.coachData.displayName}. Welcome to DietPeeps!` }
        </Text>
        
        {globalVars.coachData.coachInfo?.interests && 
        <>
        <Text style={[styles.TextO5, { color: '#202060' }]}>
          {'Interests'}
        </Text>

        <View style={styles.ViewuK}>
          <View
            style={[
              styles.ViewIr,
              {
                backgroundColor: '#202060',
                borderRadius: 10,
              },
            ]}
          >
            <Text
              style={[styles.TextG2, { color: '#fff' }]}
            >
              {globalVars.coachData.coachInfo?.interests[0]}
            </Text>
          </View>

          <View
            style={[
              styles.Viewaj,
              {
                backgroundColor: '#202060',
                borderRadius: 10,
              },
            ]}
          >
            <Text
              style={[styles.TextbA, { color: '#fff' }]}
            >
              {globalVars.coachData.coachInfo?.interests[1]}
            </Text>
          </View>

          <View
            style={[
              styles.ViewrX,
              {
                backgroundColor: '#202060',
                borderRadius: 10,
              },
            ]}
          >
            <Text
              style={[styles.Text_1J, { color: '#fff' }]}
            >
              {globalVars.coachData.coachInfo?.interests[2]}
            </Text>
          </View>
        </View> </>}
      </View>
      <BackButton navigation={navigation} style={{ transform: [{ rotateZ: '270deg' }], top: 30 }} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  Image_9l: {
    height: '100%',
    width: '100%',
  },
  ViewWi: {
    minHeight: '50%',
    maxHeight: '50%',
  },
  TextOd: {
    marginRight: 6,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'System',
    fontWeight: '700',
  },
  ViewvG: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  TouchableOpacityLv: {
    alignItems: 'center',
  },
  ViewEk: {
    flexDirection: 'row',
    marginTop: 6,
    maxWidth: '25%',
    justifyContent: 'space-between',
  },
  Textra: {
    textTransform: 'uppercase',
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 11,
    marginTop: 18,
  },
  TextBM: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  TextO5: {
    marginTop: 16,
    marginTop: 24,
    textTransform: 'uppercase',
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 11,
  },
  TextG2: {
    fontSize: 10,
    fontFamily: 'System',
    fontWeight: '700',
  },
  ViewIr: {
    marginRight: 8,
    paddingBottom: 8,
    paddingTop: 8,
    paddingRight: 16,
    paddingLeft: 16,
  },
  TextbA: {
    fontSize: 10,
    fontFamily: 'System',
    fontWeight: '700',
  },
  Viewaj: {
    marginRight: 8,
    paddingBottom: 8,
    paddingTop: 8,
    paddingRight: 16,
    paddingLeft: 16,
  },
  Text_1J: {
    fontSize: 10,
    fontFamily: 'System',
    fontWeight: '700',
  },
  ViewrX: {
    marginRight: 8,
    paddingBottom: 8,
    paddingTop: 8,
    paddingRight: 16,
    paddingLeft: 16,
  },
  ViewuK: {
    flexDirection: 'row',
    marginTop: 12,
  },
  ViewmY: {
    marginLeft: 18,
    marginRight: 18,
    flexGrow: 1,
    flexShrink: 0,
    minHeight: '50%',
  },
})

export default CoachProfile

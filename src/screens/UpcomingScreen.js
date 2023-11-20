import {
  View,
  Text,
  TextInput,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import React, { useCallback, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon, XMarkIcon } from 'react-native-heroicons/outline';
import Loading from '../components/Loading';
import { debounce } from 'lodash';
import { fallbackMoviePoster, fetchSearchMovies, fetchUpcomingMovies, image185 } from '../api/MovieDb';
import ProgressiveImage from 'rn-progressive-image';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

export default function UpcomingScreen() {
  const navigation = useNavigation();
  const [upcoming, setUpcoming] = useState([]);
  const [page, setNextPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  useEffect(() => {
    setNextPage((prevPage) => prevPage + 1);
    getUpcomingMovies();
  }, []);
  const getUpcomingMovies = async () => {
    try {
      setFetchingMore(true); // Set fetching state to true when starting to fetch more data
      const data = await fetchUpcomingMovies({ page });
      console.log(page);
      if (data && data.results) {
        setUpcoming((prevUpcoming) => [...prevUpcoming, ...data.results]);
      }
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };
  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    if (
      !fetchingMore &&
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
    ) {
      setNextPage((prevPage) => prevPage + 1);
      getUpcomingMovies();
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  let movieName = 'Equalizer 3';
  return (
    <SafeAreaView className="bg-neutral-800 flex-1">
      <View style={{ flexDirection: 'row', paddingHorizontal: 15, marginBottom: 20, marginTop: 10 }}>
        <TouchableOpacity
          style={{ backgroundColor: theme.background }}
          className="rounded-xl p-1"
          onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={28} strokeWidth={2.5} color="white" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <Loading />
      ) : upcoming.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          // contentContainerStyle={{ paddingHorizontal: 15 }}
          className="space-y-3"
          onScroll={handleScroll}
          onContentSizeChange={(contentWidth, contentHeight) => {
            // Tidak ada yang perlu dilakukan di sini, tetapi diperlukan untuk menetapkan properti onContentSizeChange
          }}>
          <View className="flex-row justify-between flex-wrap" style={{paddingHorizontal: 15}}>
            {upcoming.map((item, index) => {
              return (
                <TouchableWithoutFeedback
                  key={index}
                  onPress={() => navigation.push('Movie', item)}>
                  <View className="space-y-2 mb-4">
                    <ProgressiveImage
                      className="rounded-3xl"
                      //   source={require('../../assets/images/moviePoster2.jpeg')}
                      source={{
                        uri: image185(item?.poster_path) || fallbackMoviePoster,
                      }}
                      style={{ width: width * 0.44, height: height * 0.3 }}
                    />
                    <Text className="text-gray-300 ml-1">
                      {item?.title.length > 22
                        ? item?.title.slice(0, 22) + '...'
                        : item?.title}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              );
            })}
          </View>
          {fetchingMore ? (
            <View style={{ width: '100%', height: 60, backgroundColor: theme.background, position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'white' }}>Fetching More...</Text>
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <View className="flex-row justify-center">
          <Image
            source={require('../../assets/images/movieTime.png')}
            className="h-96 w-96"
          />
        </View>
      )
      }
    </SafeAreaView >
  );
}

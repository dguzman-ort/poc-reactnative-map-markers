import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Client } from "@googlemaps/google-maps-services-js";
import { GOOGLE_API_KEY } from "@env";



export default function App() {

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [restaurantes, setRestaurantes] = useState([])

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log("My Location: ", location)
      setLocation(location);
    })();
  }, []);

  useEffect(useCallback(() => {
    if (location?.coords) {
      console.log("Aqui voy a buscar la data de restaurantes (este ejemplo es con GOOGLE MAP)")
      console.log("KEY", GOOGLE_API_KEY)
      //TODO: Buscar data de los restaurantes
      const googleClient = new Client()
      googleClient
        .placesNearby({
          params: {
            location: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            },
            radius: 500,
            type: "restaurant",
            key: GOOGLE_API_KEY,

          },
          timeout: 1000, // milliseconds
        })
        .then(({ data }) => {
          //console.log(data.results[0]);
          // console.log(data.results[0].geometry);
          // console.log(data.results[0].name);
          // console.log(data.results[0].vicinity);
          const processedData = data.results.filter(item => item.geometry.location !== undefined)
          
          setRestaurantes(processedData)
        })
        .catch((e) => {
          console.log(e.response.data.error_message);
        });
    }
  }), [location])

  return (
    <View style={styles.container}>

      {
        (location) ?
          <MapView style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >

            {
              restaurantes.map((restaurant, index) => 
                <Marker
                  key={index}
                  coordinate={{
                    latitude: restaurant.geometry.location.lat,
                    longitude: restaurant.geometry.location.lng
                  }}
                  title={restaurant.name}
                  description={restaurant.vicinity}
                />
              )
            }

          </MapView>
          :
          <Text>Cargando...</Text>


      }


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

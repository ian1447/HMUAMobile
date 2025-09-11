import { View, Text, Dimensions, FlatList, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../../constants/api";
import { useAuthStore } from "../../../store/authStore";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window"); // Get the screen width

export default function Beautician() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [beauticians, setBeauticians] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const GetData = async () => {
    try {
      const resp = await fetch(`${API_URL}/api/beautician`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await resp.json();
      if (Array.isArray(data)) {
        setBeauticians(data);
      } else {
        setBeauticians([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    GetData();
  }, [beauticians]);

  // useEffect(() => {
  //   console.log(beauticians.length);

  // },[beauticians])

  const handlePress = (id) => {
    const ts = Date.now();
    router.push(`/${id}?reload=${ts}`);
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await GetData();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const renderBeautician = ({ item }) => (
    <TouchableOpacity style={styles.beauticianItem} onPress={() => handlePress(item._id)}>
      <View style={styles.header}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.detail}>Experience: {item.experience}</Text>
          <Text style={styles.detail}>Specialties: {item.specialties}</Text>
          <Text style={styles.detail}>Contact: {item.contact}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Hair and Makeup Artists</Text>

      {beauticians?.length === 0 ? (
        <View style={styles.noBeauticianCard}>
          <Text style={styles.noBeauticianText}>No active beauticians</Text>
        </View>
      ) : (
        <FlatList data={beauticians} renderItem={renderBeautician} keyExtractor={(item) => item._id} refreshing={refreshing} onRefresh={onRefresh} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "#fef2fe",
  },
  headerText: {
    fontSize: width * 0.08,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
  },
  beauticianItem: {
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f7b2d9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  detail: {
    fontSize: 14,
    marginTop: 4,
  },
  noBeauticianCard: {
    padding: 20,
    backgroundColor: "#f7b2d9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  noBeauticianText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

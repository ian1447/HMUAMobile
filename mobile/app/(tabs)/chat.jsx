import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function Chat() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [chatList, setChatList] = useState([]);
  const { user, token } = useAuthStore();

  const goToChat = (id: string) => {
    router.push(`/(chat)/${id}`);
  };

  const GetChats = async () => {
    const user_id = user.id;
    try {
      const resp = await fetch(`${API_URL}/api/chat/getlatest?user_id=${user_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await resp.json();
      
      if (Array.isArray(data)) {
        setChatList(data);
      } else {
        setChatList([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      GetChats();

      const interval = setInterval(() => {
        GetChats();
      }, 10000);

      return () => clearInterval(interval); 
    }, [])
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await GetChats();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.fullScreenContainer}>
      <FlatList
        data={chatList}
        keyExtractor={(item) => item.beautician_id._id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => goToChat(item.beautician_id._id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f9f9f9",
              padding: 12,
              marginBottom: 12,
              borderRadius: 12,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Avatar */}
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#dcdcdc",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.beautician_id.name.charAt(0)}</Text>
            </View>

            {/* Text Section */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.beautician_id.name}</Text>
              <Text style={{ color: "#666", marginTop: 4 }}>{item.chat_text}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#fef2fe",
    padding: 16,
  },
});

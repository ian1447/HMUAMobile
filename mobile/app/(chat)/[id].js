import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  Platform,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback } from "react";

export const unstable_settings = {
  initialRouteName: "chat/[id]",
};

export default function ChatPage() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const GetChats = async () => {
    const user_id = user.role === "user" ? user.id : id;
    const beautician_id = user.role === "user" ? id : user.beautician;

    try {
      const resp = await fetch(
        `${API_URL}/api/chat?user_id=${user_id}&beautician_id=${beautician_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await resp.json();

      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
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
      }, 5000);

      return () => clearInterval(interval);
    }, [])
  );

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [messages]);

  const handleSendMessage = () => {
    const newMessageSend = async () => {
      try {
        const user_id = user.role === "user" ? user.id : id;
        const chat_text = newMessage;
        const beautician_id = user.role === "user" ? id : user.beautician;
        const sender = user.role === "user" ? "user" : "beautician";
        const response = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_text,
            beautician_id,
            user_id,
            sender,
          }),
        });

        const data = await response.json();

        if (!response.ok)
          throw new Error(data.message || "Something went wrong");
        else {
          setNewMessage("");
          GetChats();
        }
      } catch (error) {
        console.error(error);
      }
    };
    newMessageSend();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.beauticianName}>
          {user.role === "user"
            ? messages[0]?.beautician_id?.name
            : messages[0]?.user_id?.username}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={sortedMessages}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              user.role === "user"
                ? item.sender === "user"
                  ? styles.userMessage
                  : styles.receiverMessage
                : item.sender === "user"
                ? styles.receiverMessage
                : styles.userMessage,
            ]}
          >
            <Text style={styles.messageSender}>{item.sender}:</Text>
            <Text style={styles.messageText}>{item.chat_text}</Text>
            <Text style={styles.timestamp}>
              {dayjs(item.datetime).format("MMM D, YYYY h:mm A")}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item._id}
        inverted
        style={styles.messageList}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"} // ⬅️ lifts input above keyboard on iOS
        keyboardVerticalOffset={30} // adjust based on header height
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              style={styles.sendButton}
            >
              <Ionicons name="send" size={28} color="#EC7FA9" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "space-between",
    // paddingTop: 20,
    // paddingHorizontal: 10,
    backgroundColor: "#fef2fe",
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  messageList: {
    flex: 1,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    borderColor: "#ccc",
    borderRadius: 18,
    margin: 5,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#FFB8E0",
  },
  receiverMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFB8E0",
  },
  messageSender: {
    fontWeight: "bold",
  },
  messageText: {
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 25,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    marginLeft: 5,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#EC7FA9",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  backButton: {
    fontSize: 16,
    color: "#FFEDFA",
  },
  beauticianName: {
    fontSize: 18,
    fontWeight: "600",
  },
  sendButton: {
    margin: 8,
  },
  timestamp: {
    fontSize: 10,
    color: "#888",
    marginTop: 5,
    alignSelf: "flex-end",
  },
});

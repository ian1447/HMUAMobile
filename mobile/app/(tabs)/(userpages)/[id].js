import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Button,
  Modal,
  RefreshControl
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../store/authStore";
import { API_URL } from "../../../constants/api";
import { ActivityIndicator } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width, height } = Dimensions.get("window");

export default function BeauticianProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;
  const { user, token } = useAuthStore();
  const [beauticianWorks, setBeauticianWorks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inclusions, setInclusions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const GetWorks = async () => {
    try {
      const resp = await fetch(
        `${API_URL}/api/beauticianWorks/?beautician_id=${id}`,
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
        setBeauticianWorks(data);
      } else {
        setBeauticianWorks([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const GetInclusions = async () => {
    try {
      const resp = await fetch(
        `${API_URL}/api/beauticianInclusions/?beautician_id=${id}`,
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
        setInclusions(data);
      } else {
        setInclusions([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    GetWorks();
    GetInclusions();
  }, [params.id, params.reload]);

  // useEffect(() => {
  //   console.log(getCombinedDateTime());
  // }, [selectedDate, selectedTime]);

  const getCombinedDateTime = () => {
    const date = new Date(selectedDate);
    const time = new Date(selectedTime);

    // Set hours, minutes, seconds from time into date
    date.setHours(time.getHours());
    date.setMinutes(time.getMinutes());
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
  };

  const goToChat = (id: string) => {
    const InitialChat = async () => {
      try {
        const user_id = user.id;
        const chat_text = "Hi!";
        const beautician_id = id;
        const sender = "User";
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
          router.push(`/(chat)/${id}`);
        }
      } catch (error) {
        console.error(error);
      }
    };
    InitialChat();
  };

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
    // const { contentOffset } = event.nativeEvent;
    // if (contentOffset.x <= 0) {
    //   // user scrolled to far left
    //   triggerRefresh();
    // }
  };

  const triggerRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await GetWorks();
    setRefreshing(false);
  };

  const goToCamera = () => {
    console.log(bookingId);
    
    router.push({ pathname: "/camera", params: {bookingId} });
  };

  const handleBooking = () => {
    const BookBeautician = async () => {
      try {
        const beautician_id = id;
        const ubooker_id = user.id;
        const beauticianWork_id = beauticianWorks[currentIndex]._id;
        const status = "Pending";
        const datetime = getCombinedDateTime();
        const amount = beauticianWorks[currentIndex].amount;
        const response = await fetch(`${API_URL}/api/booking`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            beautician_id,
            ubooker_id,
            beauticianWork_id,
            datetime,
            status,
            amount,
          }),
        });

        const data = await response.json();
        setBookingId(data.newBooking._id)

        if (!response.ok)
          throw new Error(data.message || "Something went wrong");
        else {
          setModalVisible(false);
          alert("Booked successfully!");
          goToCamera();
        }

        // if (!response.ok)
        //   throw new Error(data.message || "Something went wrong");
        // else {
        //   setNewMessage("");
        //   GetChats();
        // }
      } catch (error) {
        console.error(error);
      }
    };
    BookBeautician();
  };

  const renderItem = ({ item }) => (
    <View>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.imageDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.scrollcontainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={triggerRefresh}
          colors={["#ff69b4"]}
          tintColor="#ff69b4"
          title="Refreshing..."
        />
      }
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/beautician")}
        >
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>

        <FlatList
          data={beauticianWorks}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
        />

        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inclusions</Text>
          <View style={styles.bulletList}>
            {inclusions.map((item, index) => (
              <Text key={index} style={styles.bulletItem}>
                • {item.description}
              </Text>
            ))}
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <Text style={styles.sectionContent}>⭐ 4.8 (200 reviews)</Text>
        </View>

        {/* Price and Book Button */}
        <View style={styles.bookingSection}>
          <Text style={styles.price}>
            {beauticianWorks[currentIndex]?.amount != null
              ? `₱${new Intl.NumberFormat("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(beauticianWorks[currentIndex].amount)}`
              : "₱--"}
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => goToChat(id)}
            >
              <Text style={styles.bookButtonText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Select Date and Time for Booking:
            </Text>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, date) => {
                  if (date) {
                    setSelectedDate(date);
                  }
                  setShowDatePicker(false);
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="default"
                onChange={(event, time) => {
                  if (time) {
                    setSelectedTime(time);
                  }
                  setShowTimePicker(false);
                }}
              />
            )}

            <View style={styles.datetimeRow}>
              <TouchableOpacity
                style={styles.datetimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: "#fff" }}>Pick Date</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datetimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={{ color: "#fff" }}>Pick Time</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.selectedText}>
              <Text style={styles.selectedLabel}>Selected:</Text>{" "}
              {getCombinedDateTime().toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>

             {/* <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={goToCamera}
                style={styles.confirmButton}
              >
                <Text style={{ color: "#fff" }}>Open Camera</Text>
              </TouchableOpacity>
             </View> */}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={{ color: "#fff" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleBooking();
                }}
                style={styles.confirmButton}
              >
                <Text style={{ color: "#fff" }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollcontainer: {
    backgroundColor: "#fef2fe",
    flex: 1,
  },
  container: {
    backgroundColor: "#fef2fe",
    paddingBottom: 20,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 14,
    zIndex: 1,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 10,
    elevation: 5,
  },
  imageContainer: {
    width: width,
    height: height / 3,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    padding: 16,
    alignItems: "center",
  },
  imageDescription: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    color: "#333",
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  sectionContent: {
    fontSize: 16,
    color: "#444",
  },
  bookingSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  bookButton: {
    backgroundColor: "#ff69b4",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  secondaryButton: {
    backgroundColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 16,
    marginTop: 20,
  },
  bulletList: {
    marginTop: 6,
  },
  bulletItem: {
    fontSize: 16,
    color: "#444",
    marginBottom: 4,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
  },
  dateButton: {
    backgroundColor: "#ff69b4",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  dateButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#999",
    padding: 10,
    borderRadius: 8,
    width: "30%",
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#ff69b4",
    padding: 10,
    borderRadius: 8,
    width: "65%",
    alignItems: "center",
  },
  datetimeRow: {
    flexDirection: "row",
    // justifyContent: "space-between",
    gap: 5,
    marginTop: 10,
  },
  datetimeButton: {
    backgroundColor: "#ff69b4",
    padding: 10,
    borderRadius: 8,
    margin: 3,
    width: "48%",
    alignItems: "center",
  },
  selectedText: {
    marginTop: 15,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 13,
    // justifyContent: "space-between",
    marginTop: 20,
  },
  selectedLabel: {
    fontWeight: "bold",
    color: "#555",
  },
});

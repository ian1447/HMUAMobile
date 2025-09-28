import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";

const getStatusColor = (status) => {
  switch (status) {
    case "Confirmed":
      return "#4caf50";
    case "Pending":
      return "#ff9800";
    case "Cancelled":
      return "#f44336";
    default:
      return "#000000";
  }
};

export default function Booking() {
  const { user, token } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedImageURL, setSelectedImageURL] = useState(null);
  const [loading, setLoading] = useState(true);

  const GetBookings = async () => {
    try {
      const resp = await fetch(
        `${API_URL}/api/booking/admin?beautician_id=${user.beautician}`,
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
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    GetBookings();
  }, []);

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await GetBookings();
    setRefreshing(false);
  };

  const extractDateOnly = (datetime) => {
    const date = new Date(datetime);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const extractTimeOnly = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const fetchSelected = async (booking) => {
    try {
      const res = await fetch(
        `${API_URL}/api/bookingImage/selected/${booking._id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      console.log("Selected Image:", data);
      console.log(data[0]?.url);

      setSelectedImageURL(data[0]?.url);
    } catch (err) {
      console.error("❌ Fetch selected image error:", err);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: bookings.length === 0 ? "center" : "flex-start",
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sortedBookings.length === 0 ? (
          <Text style={styles.noBookingsText}>No Bookings Found</Text>
        ) : (
          sortedBookings.map((booking, index) => (
            <TouchableOpacity
              key={index}
              style={styles.bookingBox}
              onPress={() => {
                setSelectedBooking(booking);
                fetchSelected(booking);
              }}
            >
              <Text style={styles.title}>{booking.description}</Text>

              {/* Name and Date Section */}
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoText}>
                  {booking.ubooker_id.username}
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoText}>
                  {extractDateOnly(booking.datetime).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    }
                  )}
                </Text>
              </View>

              {/* Time and Beautician Section */}
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Time:</Text>
                <Text style={styles.infoText}>
                  {extractTimeOnly(booking.datetime)}
                </Text>
              </View>
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Beautician:</Text>
                <Text style={styles.infoText}>
                  {booking.beautician_id?.name}
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Amount:</Text>
                <Text style={styles.infoText}>
                  {`₱${new Intl.NumberFormat("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(booking.amount)}`}
                </Text>
              </View>

              {/* Status Section */}
              <Text
                style={[
                  styles.status,
                  { color: getStatusColor(booking.status) },
                ]}
              >
                Status: {booking.status}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      {/* Modal for Booking Details */}
      <Modal
        visible={!!selectedBooking}
        transparent={true}
        animationType="slide"
      >
        {selectedBooking && (
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              {/* Booking Image */}

              <View
                style={{
                  width: 300,
                  height: 200,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {loading && (
                  <Image
                    source={{ uri: "https://i.gifer.com/ZZ5H.gif" }} 
                    style={{ width: 50, height: 50, position: "absolute" }}
                  />
                )}

                <Image
                  source={{
                    uri: selectedImageURL,
                  }}
                  style={{ width: "100%", height: "100%", borderRadius: 10 }}
                  resizeMode="contain"
                  onLoadStart={() => setLoading(true)}
                  onLoadEnd={() => setLoading(false)}
                />
              </View>

              {/* Booking Title / Description */}
              <Text style={styles.modalTitle}>
                {selectedBooking.description}
              </Text>

              {/* Booking Details */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>
                  {selectedBooking.ubooker_id?.username}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {extractDateOnly(selectedBooking.datetime).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    }
                  )}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time:</Text>
                <Text style={styles.detailValue}>
                  {extractTimeOnly(selectedBooking.datetime)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Beautician:</Text>
                <Text style={styles.detailValue}>
                  {selectedBooking.beautician_id?.name}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>
                  ₱
                  {new Intl.NumberFormat("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(selectedBooking.amount)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: getStatusColor(selectedBooking.status) },
                  ]}
                >
                  {selectedBooking.status}
                </Text>
              </View>

              {/* Status Change Buttons */}
              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.statusButton, { backgroundColor: "#4caf50" }]}
                  onPress={() => updateStatus(selectedBooking._id, "Confirmed")}
                >
                  <Text style={styles.buttonText}>Confirm</Text>
                </Pressable>
                <Pressable
                  style={[styles.statusButton, { backgroundColor: "#ff9800" }]}
                  onPress={() => updateStatus(selectedBooking._id, "Pending")}
                >
                  <Text style={styles.buttonText}>Pending</Text>
                </Pressable>
                <Pressable
                  style={[styles.statusButton, { backgroundColor: "#f44336" }]}
                  onPress={() => updateStatus(selectedBooking._id, "Cancelled")}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
              </View>

              {/* Close Button */}
              <Pressable
                style={styles.closeButton}
                onPress={() => setSelectedBooking(null)}
              >
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fef2fe",
  },
  bookingBox: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#f06292",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
    color: "#f06292",
    textAlign: "center",
  },
  infoSection: {
    flexDirection: "row",
    marginBottom: 3,
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#333",
    width: 100,
    fontSize: 18,
  },
  infoText: {
    color: "#555",
    flex: 1,
    fontWeight: "bold",
    fontSize: 15,
  },
  status: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  noBookingsText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#888",
    fontWeight: "500",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  statusButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#999",
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
    width: "100%",
  },
  detailLabel: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 16,
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
    color: "#555",
    fontSize: 16,
  },
  modalImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#eee",
  },
});

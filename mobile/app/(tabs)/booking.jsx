import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";

// Static data for user bookings
// const userBookings = [
//   {
//     name: "John Doe",
//     date: "2025-05-15",
//     time: "2:00 PM",
//     status: "Confirmed",
//     description: "Facial Treatment",
//     amount: "$100",
//     beauticianName: "Jane Smith",
//   },
//   {
//     name: "Alice Johnson",
//     date: "2025-05-16",
//     time: "11:00 AM",
//     status: "Pending",
//     description: "Massage",
//     amount: "$80",
//     beauticianName: "Emily White",
//   },
//   {
//     name: "Bob Lee",
//     date: "2025-05-17",
//     time: "4:00 PM",
//     status: "Cancelled",
//     description: "Manicure",
//     amount: "$50",
//     beauticianName: "Sara Brown",
//   },
//   {
//     name: "Bob Lee",
//     date: "2025-05-17",
//     time: "4:00 PM",
//     status: "Cancelled",
//     description: "Manicure",
//     amount: "$50",
//     beauticianName: "Sara Brown",
//   },
//   {
//     name: "Bob Lee",
//     date: "2025-05-17",
//     time: "4:00 PM",
//     status: "Cancelled",
//     description: "Manicure",
//     amount: "$50",
//     beauticianName: "Sara Brown",
//   },
// ];

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

  const GetBookings = async () => {
    try {
      const resp = await fetch(`${API_URL}/api/booking/user?ubooker_id=${user.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await resp.json();
      // console.log(data);

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

  const sortedBookings = [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const onRefresh = async () => {
    setRefreshing(true);
    await GetBookings();
    setRefreshing(false);
  };

  const extractDateOnly = (datetime) => {
    const date = new Date(datetime); // convert string → Date
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const extractTimeOnly = (datetime) => {
    const date = new Date(datetime); // convert to Date object if it's a string
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {sortedBookings.map((booking, index) => (
        <View key={index} style={styles.bookingBox}>
          <Text style={styles.title}>{booking.description}</Text>

          {/* Name and Date Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoText}>{booking.ubooker_id.username}</Text>
          </View>
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoText}>
              {extractDateOnly(booking.datetime).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}
            </Text>
          </View>

          {/* Time and Beautician Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoText}>{extractTimeOnly(booking.datetime)}</Text>
          </View>
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Beautician:</Text>
            <Text style={styles.infoText}>{booking.beautician_id?.name}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Amount:</Text>
            <Text style={styles.infoText}>{`₱${new Intl.NumberFormat("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(booking.amount)}`}</Text>
          </View>

          {/* Status Section */}
          <Text style={[styles.status, { color: getStatusColor(booking.status) }]}>Status: {booking.status}</Text>
        </View>
      ))}
    </ScrollView>
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
    // marginTop: 10,
    textAlign: "center",
    fontSize: 16,
  },
});

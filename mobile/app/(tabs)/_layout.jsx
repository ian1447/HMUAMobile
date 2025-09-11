import { Tabs } from "expo-router";
import { Text } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";

export default function Tablayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
        tabBarStyle: {
          backgroundColor: "#f7b2d9",
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: "#000",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => <Entypo name="home" size={focused ? 30 : 24} color={color} />,
          tabBarLabel: ({ focused, color }) => <Text style={{ color, fontWeight: focused ? "bold" : "normal", fontSize: 12 }}>Home</Text>,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused, color }) => <Entypo name="chat" size={focused ? 30 : 24} color={color} />,
          tabBarLabel: ({ focused, color }) => <Text style={{ color, fontWeight: focused ? "bold" : "normal", fontSize: 12 }}>Chat</Text>,
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          tabBarIcon: ({ focused, color }) => <MaterialIcons name="feed" size={focused ? 30 : 24} color={color} />,
          tabBarLabel: ({ focused, color }) => <Text style={{ color, fontWeight: focused ? "bold" : "normal", fontSize: 12 }}>Booking</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => <Octicons name="person-fill" size={focused ? 30 : 24} color={color} />,
          tabBarLabel: ({ focused, color }) => <Text style={{ color, fontWeight: focused ? "bold" : "normal", fontSize: 12 }}>Profile</Text>,
        }}
      />
      <Tabs.Screen
         name="(userpages)/beautician"
         options={{
           href: null,
         }}
      />
       <Tabs.Screen
         name="(userpages)/[id]"
         options={{
           href: null,
         }}
      />
      {/* <Tabs.Screen
         name="(chat)/[id]"
         options={{
           href: null,
         }}
      /> */}
    </Tabs>
  );
}

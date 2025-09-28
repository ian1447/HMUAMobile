import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function FirstLaunchScreen() {

  const router = useRouter();
  useEffect(() => {
    console.log("naaai timer datpat");
    
    const timer = setTimeout(() => {
      router.replace("/(auth)"); 
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image 
        source={require("../../assets/images/loading2.jpg")} 
        style={styles.image}
        resizeMode="cover" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", 
  },
});

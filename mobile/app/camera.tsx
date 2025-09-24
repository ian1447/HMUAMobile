import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { API_URL } from "../constants/api";

export default function Camera() {
  const router = useRouter();
  const [facing, setFacing] = useState("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<any[]>([]);
  const screenWidth = Dimensions.get("window").width;
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const cameraRef = useRef<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user, token } = useAuthStore();

  const { bookingId } = useLocalSearchParams();
  console.log("📸 Got query param id:", bookingId);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((c) => (c === "back" ? "front" : "back"));
  }

  async function takePhoto() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({});
    console.log("📸 Captured photo:", photo);
    try {
      setPhotoUri(photo.uri);
    } catch (err) {
      console.error("❌ Image error:", err);
    }
  }

  const handleUpload = async () => {
    console.log("Uploadding...");

    setIsUploading(true); // show overlay

    const data = new FormData();

    data.append("file", {
      uri: photoUri,
      type: "image/jpeg",
      name: "upload.jpg",
    });

    data.append("upload_preset", "unsigned_demo");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dqqmhmlby/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await res.json();
      console.log("Cloudinary upload result:", result.url);

      const apiRes = await fetch(`${API_URL}/api/bookingImage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: bookingId,
          url: result.secure_url,
        }),
      });

      const saved = await apiRes.json();
      console.log("Saved in MongoDB:", saved);
    } catch (err) {
      console.error("Upload error:", err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Uploading...</Text>
        </View>
      )}
      {photoUri ? (
        <View style={{ flex: 1 }}>
          <Image
            source={{ uri: photoUri }}
            style={{ flex: 1, transform: [{ scaleX: -1 }] }}
            resizeMode="contain"
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setImageSize({ width, height });
            }}
          />
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => setPhotoUri(null)}
          >
            <Text style={styles.text}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <Text style={styles.text}>Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => router.back()}
          >
            <Text style={styles.text}>Select</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
          <View style={styles.buttonContainer}>
            {/* <TouchableOpacity
              style={styles.button}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.text}>Flip</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Text style={styles.text}>Snap</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.back()}
            >
              <Text style={styles.text}>Back</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  message: { textAlign: "center", paddingBottom: 10 },
  camera: { flex: 1 },
  buttonContainer: {
    position: "absolute",
    bottom: 64,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
  },
  button: { alignItems: "center" },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  retakeButton: {
    backgroundColor: "#dc3545", // Bootstrap-style red
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "60%",
  },
  uploadButton: {
    backgroundColor: "#007bff", // Bootstrap-style blue
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "60%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)", // dim background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999, // make sure it's on top
  },
  loadingText: {
    marginTop: 12,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

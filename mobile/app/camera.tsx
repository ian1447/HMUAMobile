import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  FlatList,
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
  const [isAIloading, setIsAIloading] = useState(false);
  const { user, token } = useAuthStore();
  const [aiImages, setAiimages] = useState([]);
  const [bookingImageId, setBookingImageId] = useState();
  const [loadingMap, setLoadingMap] = useState({});

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
    handleDeleteImages();
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
      // setIsAIloading(true);
    }
  };

  const handleDeleteImages = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/bookingImage?booking_id=${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      console.log("🗑️ Delete response:", data);

      if (res.ok) {
        console.log(`Deleted all images for booking ${bookingId}`);
        setAiimages([]);
      } else {
        console.log(data.message || "Failed to delete images");
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  const handleSelectImage = async (imageId: string) => {
    try {
      console.log("imageid", imageId);

      const res = await fetch(`${API_URL}/api/bookingImage/${imageId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        alert("Image selected!");
        router.back();
      } else {
        alert(data.message || "Failed to select image");
      }
    } catch (err) {
      console.error("❌ Select image error:", err);
      alert("Something went wrong selecting image");
    }
  };

  const fetchImages = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/bookingImage/?booking_id=${bookingId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      console.log("📥 Existing images:", data);
      if (Array.isArray(data) && data.length > 1) {
        setIsAIloading(false);
        setAiimages(data);
      }
    } catch (err) {
      console.error("❌ Fetch images error:", err);
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
      {isAIloading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading AI generated iamges...</Text>
        </View>
      )}
      {aiImages.length > 0 && (
        <View style={{ flex: 1 }}>
          <FlatList
            data={aiImages}
            keyExtractor={(item, idx) => idx.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const loading = loadingMap[item._id] ?? true;

              return (
                <View
                  style={{
                    width: screenWidth,
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {loading && (
                    <Image
                      source={{ uri: "https://i.gifer.com/ZZ5H.gif" }} // loading GIF
                      style={{
                        width: 50,
                        height: 50,
                        position: "absolute",
                        zIndex: 2,
                      }}
                    />
                  )}

                  <Image
                    source={{ uri: item.url }}
                    style={{
                      width: screenWidth,
                      height: "80%",
                      resizeMode: "contain",
                      borderRadius: 10,
                    }}
                    onLoadStart={() =>
                      setLoadingMap((prev) => ({ ...prev, [item._id]: true }))
                    }
                    onLoadEnd={() =>
                      setLoadingMap((prev) => ({ ...prev, [item._id]: false }))
                    }
                  />

                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => handleSelectImage(item._id)}
                  >
                    <Text style={styles.text}>Select This</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={fetchImages}
                  >
                    <Text style={styles.text}>Refresh List</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>
      )}

      {Array.isArray(aiImages) &&
        aiImages.length === 0 &&
        (photoUri ? (
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
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUpload}
            >
              <Text style={styles.text}>Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={fetchImages}>
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
        ))}
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
  aiImage: {
    width: 200, // bigger width
    marginHorizontal: 8,
    borderRadius: 16, // keep rounded corners
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

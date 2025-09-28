import { StyleSheet, Dimensions } from "react-native";
import COLORS from "../../constants/colors";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 2,
  },

  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)", // darker for contrast
  },

  topIllustration: {
    alignItems: "center",
    marginBottom: 40,
  },

  illustrationImage: {
    width: width * 0.35,
    height: width * 0.35,
  },

  card: {
    backgroundColor: COLORS.white,
    borderTopRightRadius: 100,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 25,
    width: "100%",
    maxWidth: 400,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  formContainer: {
    marginBottom: 16,
  },

  labelLogin: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
    color: COLORS.primary,
    textAlign: "center",
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    marginBottom: 8,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: 48,
    color: COLORS.textDark,
    fontSize: 16,
  },

  eyeIcon: {
    padding: 8,
  },

  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  footerText: {
    color: COLORS.textSecondary,
    marginRight: 5,
  },

  link: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default styles;

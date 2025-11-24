// toastConfig.js
import { BaseToast, ErrorToast } from "react-native-toast-message";

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#22C55E", backgroundColor: "#1E293B" }}
      text1Style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}
      text2Style={{ color: "#cbd5e1" }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#ef4444", backgroundColor: "#1E293B" }}
      text1Style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}
      text2Style={{ color: "#cbd5e1" }}
    />
  ),
};

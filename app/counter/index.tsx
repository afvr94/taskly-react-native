import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { theme } from "../../theme";
import { registerForPushNotificationsAsync } from "../../utils/register-for-push-notifications";
import { isDevice } from "expo-device";
import { scheduleNotificationAsync } from "expo-notifications";
import { useEffect, useState } from "react";

export default function CounterScreen() {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsElapsed((prevState) => prevState + 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const scheduleNotification = async () => {
    const result = await registerForPushNotificationsAsync();
    if (result === "granted") {
      await scheduleNotificationAsync({
        content: {
          title: "I'm a notification from your app",
        },
        trigger: {
          seconds: 5,
        },
      });
      return;
    }
    console.log(result);
    if (isDevice) {
      Alert.alert(
        "Unable to schedule notifications",
        "Enable the notification permission for Expo Go in settings",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text>{secondsElapsed}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={scheduleNotification}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Schedule notification</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: theme.colorBlack,
    borderRadius: 6,
    padding: 12,
  },
  buttonText: {
    color: theme.colorWhite,
    fontWeight: "semibold",
    textTransform: "uppercase",
    fontSize: 24,
    letterSpacing: 1,
  },
});

import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppInput } from "./AppInput";
import { colors, spacing } from "../theme";

export function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  return (
    <AppInput
      autoCapitalize="none"
      autoCorrect={false}
      secureTextEntry={!visible}
      rightAccessory={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          hitSlop={8}
          onPress={() => setVisible((current) => !current)}
          style={styles.toggle}
        >
          <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={22} color={colors.muted} />
        </Pressable>
      }
      {...props}
    />
  );
}

const styles = StyleSheet.create({ toggle: { padding: spacing.md } });

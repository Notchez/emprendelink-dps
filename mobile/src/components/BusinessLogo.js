import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppStyles, radii } from "../theme";

export function BusinessLogo({ logoUrl, name = "Emprendimiento", size = 54 }) {
  const { colors, styles } = useAppStyles(makeStyles);
  const [failedUrl, setFailedUrl] = useState(null);

  return (
    <View style={[styles.shell, { width: size, height: size }]}>
      {logoUrl && failedUrl !== logoUrl ? (
        <Image
          source={{ uri: logoUrl }}
          style={styles.image}
          resizeMode="contain"
          onError={() => setFailedUrl(logoUrl)}
          accessibilityLabel={`Logotipo de ${name}`}
        />
      ) : (
        <Ionicons name="storefront-outline" size={Math.round(size * 0.43)} color={colors.muted} />
      )}
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  shell: { alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: radii.md, backgroundColor: colors.subtle },
  image: { width: "100%", height: "100%", backgroundColor: "#FFFFFF" },
});

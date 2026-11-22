import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { OrdersProvider } from "./src/context/OrdersContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { colors, navigationTheme } from "./src/theme";
import { getIdentityScopeKey } from "./src/utils/sessionState";

function IdentityScopedApp() {
  const { identity } = useAuth();
  const scopeKey = getIdentityScopeKey(identity);

  return (
    <OrdersProvider key={scopeKey}>
      <CartProvider>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </CartProvider>
    </OrdersProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["bottom"]} style={styles.viewport}>
        <AuthProvider>
          <IdentityScopedApp />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1, backgroundColor: colors.background },
});

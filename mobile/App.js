import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { OrdersProvider } from "./src/context/OrdersContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { navigationTheme } from "./src/theme";
import { getIdentityScopeKey } from "./src/utils/sessionState";

function IdentityScopedApp() {
  const { identity } = useAuth();
  const scopeKey = getIdentityScopeKey(identity);

  return (
    <OrdersProvider key={scopeKey}>
      <CartProvider>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </CartProvider>
    </OrdersProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <IdentityScopedApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

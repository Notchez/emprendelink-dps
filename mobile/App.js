import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { OrdersProvider } from "./src/context/OrdersContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { navigationTheme } from "./src/theme";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OrdersProvider>
          <CartProvider>
            <NavigationContainer theme={navigationTheme}>
              <StatusBar style="dark" />
              <RootNavigator />
            </NavigationContainer>
          </CartProvider>
        </OrdersProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

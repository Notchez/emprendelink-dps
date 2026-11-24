import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import { ErrorState, LoadingState } from "../components/StateView";
import { CustomerTopBar } from "../components/CustomerTopBar";
import { CompleteProfileScreen } from "../screens/auth/CompleteProfileScreen";
import { BusinessesScreen } from "../screens/app/BusinessesScreen";
import { CartScreen } from "../screens/app/CartScreen";
import { CheckoutScreen } from "../screens/app/CheckoutScreen";
import { CatalogScreen } from "../screens/app/CatalogScreen";
import { OrderDetailScreen } from "../screens/app/OrderDetailScreen";
import { OrderConfirmationScreen } from "../screens/app/OrderConfirmationScreen";
import { OrdersScreen } from "../screens/app/OrdersScreen";
import { ProductDetailScreen } from "../screens/app/ProductDetailScreen";
import { ProfileScreen } from "../screens/app/ProfileScreen";
import { RolePendingScreen } from "../screens/app/RolePendingScreen";
import { ManagementScreen } from "../screens/management/ManagementScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { typography, useAppStyles, useAppTheme } from "../theme";
import { getRootFlow, ROOT_FLOWS } from "./roleFlow";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons = {
  Businesses: ["storefront", "storefront-outline"],
  Orders: ["receipt", "receipt-outline"],
  Profile: ["person", "person-outline"],
};

function MainTabs() {
  const { colors } = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: ({ navigation }) => (
          <CustomerTopBar
            title={{ Businesses: "Negocios", Orders: "Pedidos", Profile: "Mi perfil" }[route.name]}
            onCart={() => navigation.getParent()?.navigate("Cart")}
            onProfile={() => navigation.navigate("Profile")}
          />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: typography.tiny,
          fontWeight: "700",
          marginBottom: 2,
        },
        tabBarStyle: {
          height: 68,
          paddingTop: 7,
          paddingBottom: 8,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          elevation: 8,
        },
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons
            name={tabIcons[route.name][focused ? 0 : 1]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen name="Businesses" component={BusinessesScreen} options={{ title: "Negocios" }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: "Pedidos" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function CustomerNavigator() {
  const { colors } = useAppTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: colors.ink,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontSize: typography.body, fontWeight: "800" },
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="Catalog"
        component={CatalogScreen}
        options={({ route }) => ({ title: route.params?.businessName || "Catálogo" })}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Detalle del producto" }}
      />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: "Carrito" }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Finalizar compra" }} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} options={{ title: "Pedido recibido", headerBackVisible: false }} />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: "Detalle del pedido" }}
      />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  const { styles } = useAppStyles(makeStyles);
  const { user, profileRequired, initializing, sessionError, sessionRecoverable, retrySession } = useAuth();

  if (initializing) return <View style={styles.loading}><LoadingState message="Restaurando sesión..." /></View>;
  if (sessionRecoverable) {
    return <View style={styles.loading}><ErrorState message={sessionError} onRetry={() => void retrySession()} /></View>;
  }
  if (profileRequired) return <CompleteProfileScreen />;
  const flow = getRootFlow(user);

  if (flow === ROOT_FLOWS.AUTH) return <AuthNavigator />;
  if (flow === ROOT_FLOWS.CUSTOMER) return <CustomerNavigator />;
  if (flow === ROOT_FLOWS.ADMIN) return <ManagementScreen key="admin" isAdmin />;
  if (flow === ROOT_FLOWS.ENTREPRENEUR) return <ManagementScreen key="entrepreneur" />;

  // Un rol desconocido nunca accede a pantallas de negocio o cliente.
  return <RolePendingScreen />;
}

const makeStyles = (colors) => StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", backgroundColor: colors.background },
});

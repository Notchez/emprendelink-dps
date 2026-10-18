import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import { BusinessesScreen } from "../screens/app/BusinessesScreen";
import { CartScreen } from "../screens/app/CartScreen";
import { CatalogScreen } from "../screens/app/CatalogScreen";
import { OrderDetailScreen } from "../screens/app/OrderDetailScreen";
import { OrdersScreen } from "../screens/app/OrdersScreen";
import { ProductDetailScreen } from "../screens/app/ProductDetailScreen";
import { ProfileScreen } from "../screens/app/ProfileScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { colors, typography } from "../theme";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons = {
  Businesses: ["storefront", "storefront-outline"],
  Orders: ["receipt", "receipt-outline"],
  Profile: ["person", "person-outline"],
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: typography.tiny, fontWeight: "700", marginBottom: 2 },
        tabBarStyle: { height: 68, paddingTop: 7, paddingBottom: 8, borderTopColor: colors.border, backgroundColor: colors.surface },
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons name={tabIcons[route.name][focused ? 0 : 1]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Businesses" component={BusinessesScreen} options={{ title: "Negocios" }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: "Pedidos" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

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
      <Stack.Screen name="Catalog" component={CatalogScreen} options={({ route }) => ({ title: route.params?.businessName || "Catálogo" })} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Detalle del producto" }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: "Carrito" }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Detalle del pedido" }} />
    </Stack.Navigator>
  );
}

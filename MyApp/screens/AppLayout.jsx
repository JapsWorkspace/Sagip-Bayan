// screens/AppLayout.jsx
import React, { useContext, useState } from "react";
import { View, StyleSheet } from "react-native";
import { UserContext } from "./UserContext";

import AppTopBar from "./components/AppTopBar";
import AppDrawer from "./components/AppDrawer";
import LogoutModal from "./components/LogoutModal";

export default function AppLayout({
  children,
  onSearch,
  suggestions = [],
  onSelectSuggestion,
}) {
  const { setUser } = useContext(UserContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const confirmLogout = async () => {
    setLogoutVisible(false);
    await setUser(null);
  };

  return (
    <View style={styles.root}>
      {children}

      <AppTopBar
        showSearch={typeof onSearch === "function"}
        onSearchChange={onSearch}
        suggestions={suggestions}
        onSelectSuggestion={onSelectSuggestion}
        onMenuPress={() => setDrawerOpen(true)}
      />

      {drawerOpen && (
        <AppDrawer
          onRequestClose={() => setDrawerOpen(false)}
          onLogout={() => {
            setDrawerOpen(false);
            setLogoutVisible(true);
          }}
        />
      )}

      <LogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={confirmLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "./UserContext";
import api from "../lib/api";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetMode, setResetMode] = useState(false);

  // ✅ Load user from storage on app start
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        // ✅ ALWAYS fetch fresh user from backend
        try {
          const res = await api.get(`/user/${parsedUser.id}`);
          setUser(res.data);
          await AsyncStorage.setItem("user", JSON.stringify(res.data));
        } catch (err) {
          console.error("Failed to refresh user", err);
          setUser(parsedUser);
        }
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  // ✅ Persist user every time it changes
  const updateUser = async (data) => {
    setUser(data);
    if (data) {
      await AsyncStorage.setItem("user", JSON.stringify(data));
    } else {
      await AsyncStorage.removeItem("user");
    }
  };

  if (loading) return null; // or splash screen

  return (
   <UserContext.Provider
  value={{
    user,
    setUser: updateUser,
    resetMode,
    setResetMode,
  }}
>
  {children}
</UserContext.Provider>
  );
};
``
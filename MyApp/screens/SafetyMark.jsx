<<<<<<< HEAD

import {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
=======
// screens/SafetyMark.jsx
import React, { useState, useContext, useEffect, useMemo, useRef } from "react";
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
import {
  View,
  Text,
  TextInput,
  Alert,
<<<<<<< HEAD
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  Image,
} from "react-native";
import { UserContext } from "./UserContext";
import api from "../lib/api";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { useFocusEffect } from "@react-navigation/native";
import AppLayout from "./AppLayout";
import useJaenPlaceSearch from "./hooks/useJaenPlaceSearch";

/* ================= CONSTANTS ================= */
const BASE_URL = "http://192.168.1.4:8000";
const { height } = Dimensions.get("window");
const PANEL_COLLAPSED = height * 0.55;
const PANEL_EXPANDED = 80;

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=065F46&color=fff&rounded=true&name=User";

/* ================= HELPERS ================= */
const timeAgo = (date) => {
  if (!date) return null;
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days <= 7) return `${days} day ago`;
  return "Over a week ago";
};

const getDistanceMeters = (from, to) => {
  const R = 6371e3;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(to.lat - from.latitude);
  const dLon = toRad(to.lng - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

/* ================= COMPONENT ================= */
export default function SafetyMark() {
  const { user } = useContext(UserContext);
  
  
  console.log("[SafetyMark] user from context:", user)
  const { suggestions, search, clear } = useJaenPlaceSearch();
  const mapRef = useRef(null);

  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [personalNotifications, setPersonalNotifications] = useState([]);

  const [showRequests, setShowRequests] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [panelView, setPanelView] = useState("main");

  const [myLocation, setMyLocation] = useState(null);
  const [myAddress, setMyAddress] = useState(null);
  const [memberAddresses, setMemberAddresses] = useState({});

  /* ================= DERIVED STATE ================= */
  const hasActiveConnection = connections.length > 0;
  const isAnyConnectionFull = false;

  const totalNotifications =
    pendingRequests.length + personalNotifications.length;

  const mySafetyStatus =
    connections
      .flatMap((c) => (Array.isArray(c.members) ? c.members : []))
      .find((m) => m._id === user?._id)?.safetyStatus ||
    user?.safetyStatus ||
    "SAFE";

  /* ================= SLIDE PANEL ================= */
  const translateY = useRef(new Animated.Value(PANEL_COLLAPSED)).current;
  const lastY = useRef(PANEL_COLLAPSED);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 8,
      onPanResponderMove: (_, g) => {
        let next = lastY.current + g.dy;
        next = Math.max(PANEL_EXPANDED, Math.min(next, PANEL_COLLAPSED));
        translateY.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const toValue = g.dy < -60 ? PANEL_EXPANDED : PANEL_COLLAPSED;
        Animated.spring(translateY, {
          toValue,
          useNativeDriver: false,
        }).start(() => {
          lastY.current = toValue;
        });
=======
  Image,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  PanResponder,
} from "react-native";
import styles, { COLORS } from "../Designs/SafetyMark";
import { UserContext } from "./UserContext";
import NewBottomNav from "./NewBottomNav"; // keep if you show bottom nav per screen

// --- web map behind the panel ---
let WebMap = null;
if (Platform.OS === "web") {
  WebMap = require("./WebMap").default;
}

/** Safe JSON parser */
async function safeJson(res) {
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/** Random code generator: 6 chars, excludes ambiguous (O,0,I,1,L). */
function genFamilyCode(len = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O,0,I,1,L
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export default function SafetyMark({ navigation }) {
  const ctx = useContext(UserContext) || {};
  const userId = ctx?.user?.id || ctx?.user?._id || null;

  // Show user's code (from context if provided; otherwise generate client-side and ask server to save)
  const [myCode, setMyCode] = useState(
    (ctx?.user?.familyCode || ctx?.user?.code || "").toString().toUpperCase()
  );

  // UI state
  const [joinCode, setJoinCode] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]); // [{_id, username, familyCode}]
  const [connections, setConnections] = useState([]);
  const [pendingByConn, setPendingByConn] = useState({});
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // 🔹 Internal sub‑panel view: 'search' | 'family'
  const [panelView, setPanelView] = useState("search");
  const scrollRef = useRef(null);
  const pendingAnchorY = useRef(0);

  // Derived: unlock CTA only when there is at least one "other" member
  const hasFamilyConnections = useMemo(() => {
    const uid = (userId || "").toString();
    return (connections || []).some((c) =>
      (c.members || []).some((m) => (m?._id || m?.id || "").toString() !== uid)
    );
  }, [connections, userId]);

  // Derived: do we have pending requests?
  const hasPending = useMemo(() => {
    return (connections || []).some((c) => (pendingByConn[c?._id] ?? []).length > 0);
  }, [connections, pendingByConn]);

  const api = (path) => `http://localhost:8000${path}`;

  const getStatusColor = (status) => {
    if (status === "SAFE") return COLORS.dotSafe;
    if (status === "NOT_SAFE") return COLORS.dotNotSafe;
    return COLORS.dotUnknown;
  };

  const initialsOf = (name = "") => {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts[1]?.[0] ?? "";
    return (first + last).toUpperCase() || "🙂";
  };

  // --- API: connections + pending ---
  const fetchConnections = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(api(`/connection/user/${userId}`));
      const data = await safeJson(res);
      setConnections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[fetchConnections]", err);
      Alert.alert("Error", "Failed to fetch connections");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingMembers = async (connectionId) => {
    try {
      const res = await fetch(api(`/connection/${connectionId}`));
      const data = await safeJson(res);
      setPendingByConn((prev) => ({
        ...prev,
        [connectionId]: data?.pendingMembers ?? [],
      }));
    } catch (err) {
      console.error("[fetchPendingMembers]", err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [userId]);

  useEffect(() => {
    (connections || []).forEach((c) => c?._id && fetchPendingMembers(c._id));
  }, [connections]);

  // --- Generate & Save Code ---
  const handleRefreshCode = async () => {
    if (!userId) return Alert.alert("Please sign in first.");
    const code = genFamilyCode(6);
    setMyCode(code); // optimistic UI
    try {
      const res = await fetch(api(`/user/${userId}/family-code`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await safeJson(res);
      if (data?.code) setMyCode(String(data.code).toUpperCase());
      else setMyCode(code);
      Alert.alert("Your Code", "Family code updated.");
    } catch (err) {
      console.error("[refreshCode]", err);
      Alert.alert("Error", "Failed to update code on server. Showing local code.");
    }
  };

  // --- Join by code ---
  const handleJoinConnection = async () => {
    if (!userId) return Alert.alert("Please sign in first.");
    if (!joinCode.trim()) return Alert.alert("Join Code", "Please enter a code.");
    try {
      const res = await fetch(api(`/connection/join/${userId}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
      });
      const data = await safeJson(res);
      if (data?.message) Alert.alert("Join", data.message);
      setJoinCode("");
      fetchConnections();
    } catch (err) {
      console.error("[joinConnection]", err);
      Alert.alert("Error", "Failed to join connection");
    }
  };

  // --- Approve/Reject requests (creator) ---
  const handleApprove = async (connectionId, memberId) => {
    try {
      const res = await fetch(api(`/connection/approve/${connectionId}/${memberId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await safeJson(res);
      Alert.alert(data?.message ?? "Approved");
      fetchConnections();
      fetchPendingMembers(connectionId);
    } catch (err) {
      console.error("[approveMember]", err);
      Alert.alert("Error", "Failed to approve member");
    }
  };

  const handleReject = async (connectionId, memberId) => {
    try {
      const res = await fetch(api(`/connection/reject/${connectionId}/${memberId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await safeJson(res);
      Alert.alert(data?.message ?? "Rejected");
      fetchPendingMembers(connectionId);
    } catch (err) {
      console.error("[rejectMember]", err);
      Alert.alert("Error", "Failed to reject member");
    }
  };

  // --- Search users (optional backend) with debounce ---
  const searchTimer = useRef(null);
  useEffect(() => {
    if (!search?.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(api(`/users/search?q=${encodeURIComponent(search.trim())}`));
        const data = await safeJson(res);
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("[search users]", err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => searchTimer.current && clearTimeout(searchTimer.current);
  }, [search]);

  const handleRequestByUserId = async (targetUserId) => {
    if (!userId) return Alert.alert("Please sign in first.");
    try {
      const res = await fetch(api(`/connection/request`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterId: userId, targetUserId }),
      });
      const data = await safeJson(res);
      Alert.alert("Request", data?.message ?? "Request sent.");
    } catch (err) {
      console.error("[requestByUser]", err);
      Alert.alert("Error", "Failed to send request");
    }
  };

  // ---------- SLIDING PANEL (match Incident: handle-only drag) ----------
  const START_Y = 0;           // collapsed
  const MAX_UP = -280;         // slide up distance
  const MAX_DOWN = 0;          // fully down

  const pan = useRef(new Animated.ValueXY({ x: 0, y: START_Y })).current;
  const startY = useRef(START_Y);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startY.current = pan.y._value;
      },
      onPanResponderMove: (_, g) => {
        let newY = startY.current + g.dy;
        if (newY < MAX_UP) newY = MAX_UP;
        if (newY > MAX_DOWN) newY = MAX_DOWN;
        pan.setValue({ x: 0, y: newY });
      },
      onPanResponderRelease: () => {
        // exactly like your Incident: spring to current position (no snapping)
        Animated.spring(pan, {
          toValue: { x: 0, y: pan.y._value },
          useNativeDriver: false,
        }).start();
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
      },
    })
  ).current;

<<<<<<< HEAD
  /* ================= CONNECTIONS ================= */
  const fetchConnections = async () => {
    if (!user?._id) return;
    try {
      const res = await api.get(`/connection/user/${user._id}`);
      setConnections(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch connections failed:", err?.message);
    }
  };
  useFocusEffect(
    useCallback(() => {
      if (!user?._id) return;

      fetchConnections();

      api.get(`/user/${user._id}`)
        .then((res) => {
          setPersonalNotifications(
            (res.data.notifications || []).filter((n) => !n.read)
          );
        })
        .catch(() => {});
    }, [!user?._id])
  );

  /* ================= PENDING REQUESTS ================= */
  useEffect(() => {
    if (!user?._id) return;

    const pending = [];
    connections.forEach((connection) => {
      if (
        connection.creator?.toString() === user._id &&
        Array.isArray(connection.pendingMembers)
      ) {
        connection.pendingMembers.forEach((member) => {
          pending.push({ connectionId: connection._id, member });
        });
      }
    });

    setPendingRequests(pending);
  }, [connections, !user?._id]);

  /* ================= LOCATION ================= */
  useEffect(() => {
    if (!user?._id) return;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      // ✅ set immediately (old working behavior)
      setMyLocation(coords);

      try {
        const [place] = await Location.reverseGeocodeAsync(coords);
        if (place) {
          const street = place.street || place.name || "";
          const city = place.city || place.region || "";
          setMyAddress(
            `${street}${street && city ? ", " : ""}${city}` ||
              "Approximate area"
          );
        }
      } catch {}

      try {
        await api.put(`/user/location/${user._id}`, {
          lat: coords.latitude,
          lng: coords.longitude,
        });
      } catch {}
    })();
  }, [user?._id]);



const handleDeleteConnection = (connectionId) => {
  Alert.alert(
    "Delete Connection",
    "This will permanently remove the connection and all members.\n\nAre you sure?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          api
            .delete(`/connection/delete/${connectionId}/${user._id}`)
            .then(() => {
              fetchConnections();
              setPanelView("main");
            })
            .catch((err) => {
              Alert.alert(
                "Delete Failed",
                err?.response?.data?.message ||
                  "Failed to delete connection"
              );
            });
        },
      },
    ]
  );
};
  /* ================= FAMILY ADDRESS RESOLVE ================= */
  useEffect(() => {
    const resolveFamilyLocations = async () => {
      if (!connections.length) return;

      const updates = {};

      for (const connection of connections) {
        for (const member of connection.members || []) {
          if (
            member.location?.lat &&
            member.location?.lng &&
            !memberAddresses[member._id]
          ) {
            try {
              const [place] = await Location.reverseGeocodeAsync({
                latitude: member.location.lat,
                longitude: member.location.lng,
              });
              if (place) {
                const street = place.street || place.name || "";
                const city = place.city || place.region || "";
                updates[member._id] =
                  `${street}${street && city ? ", " : ""}${city}` ||
                  "Approximate area";
              }
            } catch {}
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        setMemberAddresses((prev) => ({ ...prev, ...updates }));
      }
    };

    resolveFamilyLocations();
  }, [connections]);

  /* ================= SEARCH ================= */
  const handleSelectSuggestion = (place) => {
    if (!mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      350
    );
    clear();
  };

  /* ================= ACTIONS ================= */
const handleCreateConnection = () => {
  if (hasActiveConnection) {
    Alert.alert(
      "Already Connected",
      "You can only have one family connection at a time.\n\nPlease leave your current connection first."
    );
    return;
  }

  api.post(`/connection/create/${user._id}`)
    .then(fetchConnections)
    .catch(() =>
      Alert.alert("Error", "Failed to create connection")
    );
};
  const handleJoinConnection = () => {
    if (hasActiveConnection) {
      Alert.alert(
        "Already Connected",
        "You can only join one family connection."
      );
      return;
    }
    if (!joinCode.trim()) {
      Alert.alert("Missing Info", "Enter a connection code");
      return;
    }
    api.post(`/connection/join/${user._id}`, {
      code: joinCode.trim().toUpperCase(),
    })
      .then(() => {
        setJoinCode("");
        fetchConnections();
      })
      .catch((err) => {
        Alert.alert(
          "Join Failed",
          err?.response?.data?.message ||
            "Invalid or expired connection code"
        );
      });
  };

  const handleMarkSafe = () => {
    if (!hasActiveConnection)
      return Alert.alert("No Connection", "You are not connected.");
    api.put(`/connection/safe/${user._id}`, { message: "I am safe" })
      .then(fetchConnections)
      .catch(() => Alert.alert("Error", "Failed to mark SAFE"));
  };

  const handleMarkNotSafe = () => {
    if (!hasActiveConnection)
      return Alert.alert("No Connection", "You are not connected.");
    api.put(`/connection/not-safe/${user._id}`, { message: "Need help" })
      .then(fetchConnections)
      .catch(() => Alert.alert("Error", "Failed to mark NOT SAFE"));
  };
const handleLeaveConnection = (id) => {
  api.delete(`/connection/leave/${user._id}/${id}`)
    .then(fetchConnections)
    .catch(() =>
      Alert.alert("Error", "Failed to leave connection")
    );
};
/* ================= RENDER ================= */
return (
<AppLayout
  onSearch={search}
  suggestions={suggestions}
  onSelectSuggestion={handleSelectSuggestion}
>
  <View style={styles.container}>
    <MapView
      ref={mapRef} 
      style={StyleSheet.absoluteFillObject}
      initialRegion={{
        latitude: myLocation?.latitude || 14.5995,
        longitude: myLocation?.longitude || 120.9842,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {myLocation && (
        <Marker coordinate={myLocation}>
          <Image
            source={{
              uri: user.avatar
                ? `${BASE_URL}${user.avatar}`
                : DEFAULT_AVATAR,
            }}
            style={[
              styles.markerAvatar,
              {
                borderColor:
                  mySafetyStatus === "SAFE"
                    ? "#22C55E"
                    : "#EF4444",
                borderWidth: 3,
              },
            ]}
          />
        </Marker>
      )}
    </MapView>

    <TouchableOpacity
      style={styles.notificationBtn}
      onPress={() => setShowRequests(true)}
    >
      <Text style={styles.notificationIcon}>🔔</Text>

      {totalNotifications > 0 && (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationCount}>
            {totalNotifications}
          </Text>
        </View>
      )}
    </TouchableOpacity>

    {showRequests && (
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowRequests(false)}>
              <Text style={styles.modalBack}>←</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Request</Text>
            <View style={{ width: 20 }} />
          </View>

          {/* pending requests */}
          {pendingRequests.length === 0 ? (
            <Text style={styles.emptyText}>No pending requests</Text>
          ) : (
            pendingRequests.map(({ connectionId, member }) => (
              <View key={member._id} style={styles.requestRow}>
                <Image
                  source={{
                    uri: member.avatar
                      ? `${BASE_URL}${member.avatar}`
                      : DEFAULT_AVATAR,
                  }}
                  style={styles.requestAvatar}
                />

                <Text style={styles.requestName}>
                  {member.username}
                </Text>

                <View style={styles.requestActions}>
                  {/* ✅ Approve */}
                  <TouchableOpacity
                    onPress={() => {
                      api.put(
                        `/connection/approve/${connectionId}/${member._id}/${user._id}`
                      ).then(() => {
                        fetchConnections();
                        setShowRequests(false);
                      });
                    }}
                  >
                    <Text style={styles.approveBtn}>✔</Text>
                  </TouchableOpacity>

                  {/* ❌ Reject */}
                  <TouchableOpacity
                    onPress={() => {
                      api.put(
                        `/connection/reject/${connectionId}/${member._id}/${user._id}`
                      ).then(() => {
                        fetchConnections();
                        setShowRequests(false);
                      });
                    }}
                  >
                    <Text style={styles.rejectBtn}>✖</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {/* ✅ Personal system notifications */}
          {personalNotifications.map((notif, index) => (
            <View key={`notif-${index}`} style={styles.requestRow}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {notif.message}
              </Text>
              <Text
                style={{
                  color: "#D1FAE5",
                  fontSize: 11,
                  marginTop: 4,
                }}
              >
                {timeAgo(notif.createdAt)}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.closeModal}
            onPress={() => setShowRequests(false)}
          >
            <Text style={{ fontWeight: "700" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    )}

    {/* ================= PANEL ================= */}
    <Animated.View style={[styles.panel, { transform: [{ translateY }] }]}>
      <View {...panResponder.panHandlers} style={styles.handle} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {panelView === "main" && (
          <>
            <Text style={styles.title}>Safety Mark</Text>
            {myAddress && (
              <Text style={styles.locationLabel}>{myAddress}</Text>
            )}

         <TouchableOpacity
  style={[
    styles.primaryBtn,
    hasActiveConnection && { opacity: 0.5 }
  ]}
  disabled={hasActiveConnection}
  onPress={handleCreateConnection}
>
  <Text style={styles.primaryText}>Create Connection</Text>
</TouchableOpacity>





            <Text style={styles.label}>Join with code</Text>
            <TextInput
              style={styles.input}
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="Enter connection code"
            />

         <TouchableOpacity
  style={[
    styles.secondaryBtn,
    hasActiveConnection && { opacity: 0.5 }
  ]}
  disabled={hasActiveConnection}
  onPress={handleJoinConnection}
>
  <Text style={styles.secondaryText}>Join Connection</Text>
</TouchableOpacity>

            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => setPanelView("connections")}
            >
              <Text style={styles.linkText}>
                View your connections →
              </Text>
            </TouchableOpacity>
          </>
        )}

          {panelView === "connections" && (
            <>
            {isAnyConnectionFull && (
  <Text style={{ color: "#991B1B", marginTop: 6 }}>
    Connection is full (maximum of 5 members)
  </Text>
)}
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setPanelView("main")}
              >
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Safety Status</Text>

              <TouchableOpacity
                style={styles.safeBtn}
                onPress={handleMarkSafe}
              >
                <Text style={styles.safeText}>Mark SAFE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.unsafeBtn}
                onPress={handleMarkNotSafe}
              >
                <Text style={styles.unsafeText}>Mark NOT SAFE</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>
                Family Account Connections
              </Text>





              {connections.map((connection) => (
                <View key={connection._id}>
                  <Text style={styles.codeText}>
                    Connection Code:{" "}
                    <Text style={{ fontWeight: "800" }}>
                      {connection.code}
                    </Text>
                  </Text>
{connection.members.map((member) => (
  <View key={member._id} style={styles.connectionCard}>

    {/* ✅ LEFT WRAPPER (takes all space) */}
    <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
      
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <Image
          source={{
            uri: member.avatar
              ? `${BASE_URL}${member.avatar}`
              : DEFAULT_AVATAR,
          }}
          style={styles.avatar}
        />
      </View>

      {/* Info */}
      <View style={styles.infoCol}>
        <Text style={styles.name}>
          {member.username} ({member.safetyStatus || "UNKNOWN"})
        </Text>

        <Text style={styles.location}>
          {memberAddresses[member._id] || "Location unavailable"}
        </Text>

        {myLocation && member.location?.lat && member.location?.lng && (
          <Text style={styles.location}>
            {timeAgo(member.location.updatedAt)} •{" "}
            {(() => {
              const meters = getDistanceMeters(myLocation, member.location);
              return meters < 1000
                ? `${meters} m away`
                : `${(meters / 1000).toFixed(1)} km away`;
            })()}
          </Text>
        )}
      </View>
    </View>

    {/* ✅ RIGHT‑ALIGNED ⋮ — GUARANTEED */}
    {connection.creator?.toString() === user._id &&
      member._id !== user._id && (
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Remove Member",
              `Remove ${member.username} from this connection?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Kick",
                  style: "destructive",
                  onPress: () => {
                    api
                      .put(
                        `/connection/kick/${connection._id}/${member._id}/${user._id}`
                      )
                      .then(fetchConnections)
                      .catch(() =>
                        Alert.alert("Error", "Failed to remove member")
                      );
                  },
                },
              ]
            );
          }}
        >
          <Text style={{ fontSize: 18, color: "#D1FAE5", paddingLeft: 8 }}>
            ⋮
          </Text>
        </TouchableOpacity>
      )}
  </View>
))}
{connection.creator?.toString() === user._id ? (
  // ✅ CREATOR: DELETE
  <TouchableOpacity
    style={[styles.leaveBtn, { backgroundColor: "#FEE2E2" }]}
    onPress={() => handleDeleteConnection(connection._id)}
  >
    <Text style={{ color: "#991B1B", fontWeight: "700" }}>
      Delete Connection
    </Text>
  </TouchableOpacity>
) : (
  // ✅ MEMBER: LEAVE
  <TouchableOpacity
    style={styles.leaveBtn}
    onPress={() => handleLeaveConnection(connection._id)}
  >
    <Text style={styles.leaveText}>Leave Connection</Text>
  </TouchableOpacity>
)}

                </View>
              ))}
            </>
          )}
        </ScrollView>
      </Animated.View>
    </View>
    </AppLayout>
   
);
}

/* ================= STYLES ================= */
/* ✅ STYLES UNCHANGED */
/* ================= STYLES ================= */
/* YOUR styles remain unchanged */


/* ================= STYLES ================= */
/* ================= STYLES ================= */
/* ✅ STYLES UNCHANGED */
/* ================= STYLES ================= */
/* YOUR styles remain unchanged */


/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1 },

  locationLabel: {
    color: "#047857",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },

  panel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 15,
  },

  handle: {
    width: 50,
    height: 5,
    backgroundColor: "#D1D5DB",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 14,
  },

  markerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
  },

  title: { fontSize: 26, fontWeight: "800", color: "#064E3B" },

  label: { marginTop: 16, fontWeight: "600" },

  input: {
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#F9FAFB",
  },

  primaryBtn: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 14,
    marginTop: 12,
    alignItems: "center",
  },

  primaryText: { color: "#FFF", fontWeight: "800" },

  secondaryBtn: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#10B981",
    alignItems: "center",
  },

  secondaryText: { color: "#047857", fontWeight: "700" },

  linkBtn: { marginTop: 18, alignItems: "center" },

  linkText: { color: "#047857", fontWeight: "700" },

  backBtn: { marginBottom: 10 },

  backText: { color: "#047857", fontWeight: "700" },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "800",
    color: "#064E3B",
  },

  safeBtn: {
    backgroundColor: "#ECFDF5",
    padding: 14,
    borderRadius: 14,
    borderColor: "#10B981",
    borderWidth: 1,
    marginBottom: 10,
  },

  unsafeBtn: {
    backgroundColor: "#FEF2F2",
    padding: 14,
    borderRadius: 14,
    borderColor: "#FCA5A5",
    borderWidth: 1,
  },

  safeText: { textAlign: "center", fontWeight: "800", color: "#047857" },

  unsafeText: { textAlign: "center", fontWeight: "800", color: "#991B1B" },

  connectionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#064E3B",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },

  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ECFDF5",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: { width: "100%", height: "100%", borderRadius: 21 },

  statusDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  dotSafe: { backgroundColor: "#22C55E" },

  dotUnsafe: { backgroundColor: "#EF4444" },

  infoCol: { flex: 1 },

  name: { color: "#FFF", fontWeight: "800", fontSize: 14 },

  location: { color: "#D1FAE5", fontSize: 12, marginTop: 2 },

  statusPill: {
    backgroundColor: "#022C22",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  statusText: {
    color: "#A7F3D0",
    fontSize: 11,
    fontWeight: "700",
  },

  leaveBtn: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },

  leaveText: {
    textAlign: "center",
    color: "#991B1B",
    fontWeight: "700",
  },

  notificationBtn: {
  position: "absolute",
  top: 40,
  right: 20,
  zIndex: 20,
},

notificationIcon: {
  marginTop: 90,
  fontSize: 26,
},


modalOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
  elevation: 999,   // ✅ THIS is the missing piece
},

modalBox: {
  width: "85%",
  backgroundColor: "#E5E7EB",
  borderRadius: 16,
  padding: 20,
},

modalTitle: {
  fontSize: 20,
  fontWeight: "800",
  marginBottom: 16,
  textAlign: "center",
},

requestRow: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#064E3B",
  padding: 12,
  borderRadius: 12,
  marginBottom: 10,
},

requestAvatar: {
  width: 36,
  height: 36,
  borderRadius: 18,
  marginRight: 10,
},

requestName: {
  flex: 1,
  color: "#fff",
  fontWeight: "700",
},

requestActions: {
  flexDirection: "row",
  gap: 12,
},

approveBtn: {
  fontSize: 20,
  color: "#22C55E",
},

rejectBtn: {
  fontSize: 20,
  color: "#EF4444",
},

closeModal: {
  marginTop: 10,
  alignItems: "center",
},

emptyText: {
  textAlign: "center",
  color: "#374151",
  marginVertical: 20,
},
notificationBadge: {
  position: "absolute",
  top: -4,
  right: -4,
  minWidth: 18,
  height: 18,
  borderRadius: 9,
  marginTop: 90,
  backgroundColor: "#EF4444",
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 4,
},

notificationCount: {
  color: "#fff",
  fontSize: 11,
  fontWeight: "800",
},
modalHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 16,
},

modalBack: {
  fontSize: 18,
  fontWeight: "800",
},
});
=======
  // If user isn’t ready yet
  if (!userId) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 6 }}>Please sign in</Text>
        <Text style={{ color: "#6B7280", textAlign: "center" }}>
          Open the LogIn screen to authenticate and view your connections.
        </Text>
      </View>
    );
  }

  return (
    <View style={frame.webFrame}>
      <View style={frame.phone}>
        {/* MAP BEHIND */}
        <View style={frame.mapContainer}>
          {Platform.OS === "web" && WebMap ? <WebMap onSelect={() => {}} /> : <View/>}
        </View>

        {/* SLIDING PANEL — EXACT same geometry as Incident */}
        <Animated.View style={[frame.centerWrapper, { transform: pan.getTranslateTransform() }]}>
          <View style={frame.card}>
            {/* Grey drag handle INSIDE the panel (like Incident) */}
            <View {...panResponder.panHandlers} style={frame.dragHandle} />

            {/* CONTENT (scrollable) */}
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 16 }}
              bounces
            >
              <View style={styles.sheet}>
                {/* HEADER / NAV BETWEEN SUB‑PANELS */}
                {panelView === "family" ? (
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <Pressable
                      onPress={() => {
                        setPanelView("search");
                        scrollRef.current?.scrollTo({ y: 0, animated: false });
                      }}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: Platform.OS === "ios" ? 8 : 6,
                        borderRadius: 8,
                        backgroundColor: "#0F172A",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "800" }}>‹ Back</Text>
                    </Pressable>
                    <Text style={[styles.title, { flex: 1, textAlign: "center", marginRight: 12 }]}>
                      Family Account Connections
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.title, { marginTop: 0 }]}>Family Account Connections</Text>
                )}

                {/* ------------ PAGE 1: SEARCH ------------ */}
                {panelView === "search" && (
                  <>
                    <View style={styles.findBlock}>
                      <Text style={styles.findTitle}>Find People</Text>

                      <TextInput
                        style={styles.findSearch}
                        placeholder="Search by name or code"
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor="#9CA3AF"
                      />

                      {/* Search results */}
                      {searching ? (
                        <View style={[styles.findResultBox, { padding: 10 }]}>
                          <ActivityIndicator />
                        </View>
                      ) : searchResults.length > 0 ? (
                        <View style={styles.findResultBox}>
                          {searchResults.map((u, idx) => (
                            <View
                              key={u?._id ?? `u_${idx}`}
                              style={[
                                styles.resultRow,
                                idx === searchResults.length - 1 && { borderBottomWidth: 0 },
                              ]}
                            >
                              <View style={styles.resultInfo}>
                                <Text style={styles.resultName}>{u?.username ?? "User"}</Text>
                                <Text style={styles.resultMeta}>
                                  Code: {(u?.familyCode || u?.code || "— — — — — —").toString().toUpperCase()}
                                </Text>
                              </View>

                              <Pressable
                                style={styles.resultBtn}
                                onPress={() => handleRequestByUserId(u?._id)}
                              >
                                <Text style={styles.resultBtnText}>Request</Text>
                              </Pressable>
                            </View>
                          ))}
                        </View>
                      ) : null}

                      {/* Enter + join code */}
                      <View style={styles.findRow}>
                        <Pressable style={styles.findEnterBtn} onPress={handleJoinConnection}>
                          <Text style={styles.findEnterText}>Enter</Text>
                        </Pressable>
                        <TextInput
                          style={styles.findCodeInput}
                          placeholder="Enter code (e.g., VSJ4KW)"
                          value={joinCode}
                          onChangeText={setJoinCode}
                          autoCapitalize="characters"
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>

                      {/* Your code */}
                      <Text style={styles.yourCodeLabel}>your code</Text>
                      <View style={styles.yourCodeBox}>
                        <Text style={styles.yourCodeText}>{(myCode || "———").toString().toUpperCase()}</Text>
                      </View>
                      <View style={{ marginTop: 8, alignItems: "center" }}>
                        <Pressable
                          onPress={handleRefreshCode}
                          style={{
                          paddingHorizontal: 12,
                          paddingVertical: Platform.OS === "ios" ? 8 : 6,
                          borderRadius: 8,
                          backgroundColor: "#0F172A",
                          }}
                        >
                          <Text style={{ color: "#fff", fontWeight: "800" }}>Generate New Code</Text>
                        </Pressable>
                      </View>

                      {/* Family Account Connections (locked until connected) */}
                      <Pressable
                        style={[styles.primaryBtn, !hasFamilyConnections && styles.primaryBtnDisabled]}
                        disabled={!hasFamilyConnections}
                        onPress={() => {
                          if (!hasFamilyConnections) return;
                          setPanelView("family");
                          scrollRef.current?.scrollTo({ y: 0, animated: true });
                        }}
                      >
                        <Text
                          style={[
                            styles.primaryBtnText,
                            !hasFamilyConnections && styles.primaryBtnTextDisabled,
                          ]}
                        >
                          Family Account Connections
                        </Text>
                      </Pressable>

                      {/* Request List (goes to Family; scrolls to pending if any) */}
                      <Pressable
                        style={[
                          styles.primaryBtn,
                          { marginTop: 8, backgroundColor: hasPending ? "#0F172A" : "#D1D5DB" },
                        ]}
                        onPress={() => {
                          setPanelView("family");
                          setTimeout(() => {
                            if (hasPending) {
                              scrollRef.current?.scrollTo({
                                y: Math.max(pendingAnchorY.current - 8, 0),
                                animated: true,
                              });
                            }
                          }, 120);
                        }}
                      >
                        <Text
                          style={[
                            styles.primaryBtnText,
                            { color: hasPending ? "#FFFFFF" : "#6B7280" },
                          ]}
                        >
                          Request List
                        </Text>
                      </Pressable>

                      {!hasFamilyConnections && (
                        <Text style={{ color: COLORS.muted, textAlign: "center", marginTop: 6 }}>
                          Family button unlocks once someone connects with you.
                        </Text>
                      )}
                    </View>
                  </>
                )}

                {/* ------------ PAGE 2: FAMILY ------------ */}
                {panelView === "family" && (
                  <>
                    {loading && <ActivityIndicator style={{ marginVertical: 8 }} />}

                    {/* Connections */}
                    <View style={styles.list}>
                      {(connections || []).length === 0 ? (
                        <Text style={{ color: COLORS.muted, textAlign: "center", marginTop: 6 }}>
                          No connections yet. Share your code or search to connect.
                        </Text>
                      ) : (
                        (connections || []).map((c, i) => renderTile(c, i))
                      )}
                    </View>

                    {/* Anchor for pending auto-scroll */}
                    <View onLayout={(e) => (pendingAnchorY.current = e.nativeEvent.layout.y)} />

                    {/* Pending */}
                    {(connections || []).some((c) => (pendingByConn[c?._id] ?? []).length > 0) && (
                      <View style={{ marginTop: 12 }}>
                        <Text style={{ fontWeight: "800", marginBottom: 6 }}>Pending Members</Text>
                        {(connections || []).map((c) =>
                          (pendingByConn[c?._id] ?? []).map((m) => (
                            <View
                              key={`${c?._id ?? "c"}_${m?._id ?? "m"}`}
                              style={local.pendingRow}
                            >
                              <Text style={{ fontWeight: "700" }}>{m?.username ?? "Member"}</Text>
                              <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Pressable
                                  style={[btn.solid, { backgroundColor: "#16A34A" }]}
                                  onPress={() => handleApprove(c._id, m._id)}
                                >
                                  <Text style={btn.text}>APPROVE</Text>
                                </Pressable>
                                <View style={{ width: 8 }} />
                                <Pressable
                                  style={[btn.solid, { backgroundColor: "#B91C1C" }]}
                                  onPress={() => handleReject(c._id, m._id)}
                                >
                                  <Text style={btn.text}>REJECT</Text>
                                </Pressable>
                              </View>
                            </View>
                          ))
                        )}
                      </View>
                    )}

                    {/* SAFE / UNSAFE (inside Family) */}
                    <View style={styles.actionRow}>
                      <Pressable
                        style={[styles.btn, styles.btnSafe]}
                        onPress={() => {
                          fetch(api(`/connection/safe/${userId}`), {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ message: "I am safe" }),
                          }).then(() => {
                            Alert.alert("Status", "You are marked SAFE");
                            fetchConnections();
                          });
                        }}
                      >
                        <Text style={styles.btnText}>SAFE</Text>
                      </Pressable>

                      <View style={{ width: 10 }} />

                      <Pressable
                        style={[styles.btn, styles.btnUnsafe]}
                        onPress={() => {
                          fetch(api(`/connection/not-safe/${userId}`), {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ message: "Need help" }),
                          }).then(() => {
                            Alert.alert("Status", "You are marked NOT SAFE");
                            fetchConnections();
                          });
                        }}
                      >
                        <Text style={styles.btnText}>UNSAFE</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        </Animated.View>

        {/* Bottom nav (remove if you already mount it globally) */}
        <NewBottomNav navigation={navigation} />
      </View>
    </View>
  );

  function renderTile(connection, idx) {
    const lead = connection?.members?.[0] || {};
    return (
      <View
        key={connection?._id ?? `conn_${idx}`}
        style={[styles.tile, idx > 0 && styles.tileSpacing]}
      >
        <View style={styles.avatarWrap}>
          {lead.avatarUrl ? (
            <Image source={{ uri: lead.avatarUrl }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <Text style={{ fontWeight: "800", color: "#111827" }}>
              {initialsOf(lead.username)}
            </Text>
          )}
          <View style={styles.dotWrap}>
            <View style={[styles.dot, { backgroundColor: getStatusColor(lead.safetyStatus) }]} />
          </View>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.name}>{lead.username ?? "Member"}</Text>
          <Text style={styles.location}>
            {lead.lastKnownLocation ?? "Near your last saved place"}
          </Text>
        </View>

        <View style={styles.statusPill}>
          <Text style={styles.statusText}>Status: {lead.safetyStatus ?? "Unknown"}</Text>
        </View>
      </View>
    );
  }
}

// --- local layout styles (match Incident: centerWrapper, card, dragHandle) ---
const frame = StyleSheet.create({
  webFrame: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Platform.OS === "web" ? "#f0f0f0" : "#fff",
  },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 390,  // same phone width as your Incident screen
    position: "relative",
    backgroundColor: "#fff",
  },
  mapContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#ddd",
  },
  // ▶️ The panel wrapper matches your Incident's centerWrapper
  centerWrapper: {
    position: "absolute",
    top: 520,
    width: "100%",
    alignSelf: "center",
    zIndex: 10,
    paddingBottom: 30,
  },
  // ▶️ The white sheet container (same feel as Incident's card)
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 0,           // handle sits on top; internal padding lives in styles.sheet
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  // ▶️ The grey drag handle INSIDE the panel (same size as Incident)
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 8,
  },
});

const btn = StyleSheet.create({
  solid: {
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    borderRadius: 8,
  },
  text: { color: "#FFFFFF", fontWeight: "800", letterSpacing: 0.6 },
});

const local = StyleSheet.create({
  pendingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
});
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a

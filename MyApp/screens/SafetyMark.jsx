// screens/SafetyMark.jsx
import React, { useState, useContext, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
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
      },
    })
  ).current;

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

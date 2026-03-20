import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Button, TextInput, Alert, StyleSheet } from 'react-native';
import { UserContext } from "./UserContext";

export default function SafetyMark() {
  const [joinCode, setJoinCode] = useState('');
  const { user, setUser } = useContext(UserContext);
  const [connections, setConnections] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);

  // Fetch all user connections
  const fetchConnections = async () => {
    try {
      const response = await fetch(`http://localhost:8000/connection/user/${user.id}`);
      const data = await response.json();
      setConnections(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const getStatusColor = (status) => {
    if (status === "SAFE") return "green";
    if (status === "NOT_SAFE") return "red";
    return "gray";
  };

  // 1️⃣ Create Connection
  const handleCreateConnection = () => {
    fetch(`http://localhost:8000/connection/create/${user.id}`, {
      method: "POST"
    })
      .then(res => res.json())
      .then(data => {
        console.log("Connection Created", `Your connection code: ${data.code}`);
        fetchConnections();
        fetchPendingMembers();
      })
      .catch(err => console.error(err));
  };

  // 2️⃣ Join Connection
  const handleJoinConnection = () => {
    fetch(`http://localhost:8000/connection/join/${user.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: joinCode })
    })
      .then(res => res.json())
      .then(data => {
        console.log("Join Connection", data.message);
        fetchConnections();
        setJoinCode("");

        console.log(connection.creator === user.id, "2");
      console.log(pendingMembers.length);
      })
      .catch(err => {
        console.error(err);
        Alert.alert("Error", "Failed to join connection");
      });

       console.log(connection.creator === user.id, "1");
      console.log(pendingMembers.length);
  };

  // Leave Connection
  const handleLeaveConnection = (connectionId) => {
    fetch(`http://localhost:8000/connection/leave/${user.id}/${connectionId}`, { method: "DELETE" })
      .then(res => res.json())
      .then(data => {
        Alert.alert("Connection", data.message);
        fetchConnections();
      })
      .catch(err => {
        console.error(err);
        Alert.alert("Error", "Failed to leave connection");
      });
  };

  // Mark SAFE
  const handleMarkSafe = (message) => {
    fetch(`http://localhost:8000/connection/safe/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    })
      .then(res => res.json())
      .then(data => {
        console.log("Status Updated", data);
        Alert.alert("Status", "You are marked SAFE");
        fetchConnections();
      })
      .catch(err => {
        console.error(err);
        Alert.alert("Error", "Failed to update status");
      });

      


     
  };

  // Mark NOT SAFE
  const handleMarkNotSafe = (message) => {
    fetch(`http://localhost:8000/connection/not-safe/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    })
      .then(res => res.json())
      .then(data => {
        console.log("Status Updated", data);
        Alert.alert("Status", "You are marked NOT SAFE");
        fetchConnections();
      })
      .catch(err => {
        console.error(err);
        Alert.alert("Error", "Failed to update status");
      });
  };

  // Fetch pending members for a connection (creator only)
const fetchPendingMembers = (connectionId) => {
  fetch(`http://localhost:8000/connection/${connectionId}`)
    .then(res => res.json())
    .then(data => {
      setPendingMembers(data.pendingMembers || []);
      console.log("Pending Members for connection ID:", connectionId, data.pendingMembers);
    })
    .catch(err => console.error(err));
};

useEffect(() => {
  // Fetch pending members for each connection
  connections.forEach(connection => {
    fetchPendingMembers(connection._id);
  });
}, [connections]); // runs whenever connections change

  // Approve member
  const handleApprove = (connectionId, memberId) => {
    fetch(`http://localhost:8000/connection/approve/${connectionId}/${memberId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }) // send creator ID
    })
      .then(res => res.json())
      .then(data => {
        Alert.alert(data.message);
        fetchConnections();
        fetchPendingMembers(connectionId);
      })
      .catch(err => console.error(err));
  };

  // Reject member
  const handleReject = (connectionId, memberId) => {
    fetch(`http://localhost:8000/connection/reject/${connectionId}/${memberId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id })
    })
      .then(res => res.json())
      .then(data => {
        Alert.alert(data.message);
        fetchPendingMembers(connectionId);
      })
      .catch(err => console.error(err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connections</Text>

      {/* Create Connection */}
      <Button title="Create Connection" onPress={handleCreateConnection} />

      {/* Join Connection */}
      <Text style={styles.label}>Join a Connection</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter connection code"
        value={joinCode}
        onChangeText={setJoinCode}
      />
      <Button title="Join Connection" onPress={handleJoinConnection} />

      {/* Safety Status */}
      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Update Safety Status</Text>
      <Button title="Mark SAFE" onPress={() => handleMarkSafe("I am safe")} />
      <Button title="Mark NOT SAFE" onPress={() => handleMarkNotSafe("Need help")} color="red" />

      {/* Connections List */}
      <Text style={{ marginTop: 30, fontSize: 18, fontWeight: "bold" }}>Your Connections</Text>
      {connections.map((connection) => (
  <View key={connection._id} style={{ marginTop: 15, padding: 10, borderWidth: 1 }}>
    <Text style={{ fontWeight: "bold" }}>Code: {connection.code}</Text>

    <Text style={{ marginTop: 5 }}>Members:</Text>
    {connection.members.map((member) => (
      <Text key={member._id} style={{ color: getStatusColor(member.safetyStatus) }}>
        {member.username} - {member.safetyStatus}
      </Text>
    ))}

    {/* Pending members */}
    {pendingMembers.map((member) => (
      <View key={member._id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
        <Text style={{ flex: 1 }}>{member.username}</Text>
        <Button title="Approve" onPress={() => handleApprove(connection._id, member._id)} />
        <Button title="Reject" color="red" onPress={() => handleReject(connection._id, member._id)} />
      </View>
    ))}
    <Button
      title="Leave Connection"
      color="red"
      onPress={() => handleLeaveConnection(connection._id)}
    />
  </View>
))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { marginTop: 20, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#aaa', padding: 10, marginBottom: 10, borderRadius: 5 }
});
import "react-native-reanimated";
import React, { useState, useEffect, useRef } from "react";
import { Text, View, Pressable, StyleSheet, Dimensions } from "react-native";
import { MotiView, MotiText, AnimatePresence } from "moti";
import * as Haptics from "expo-haptics";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Audio } from "expo-av";

const { width, height } = Dimensions.get("window");

export default function App() {
  const [pantalla, setPantalla] = useState("inicio");
  const [intensidad, setIntensidad] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);

  async function detenerMicrofono() {
    try {
      if (recordingRef.current) {
        const status = await recordingRef.current.getStatusAsync();
        if ("isLoaded" in status && status.isLoaded) {
          await recordingRef.current.stopAndUnloadAsync();
        }
      }
    } catch (e) {
      console.log("Micro ya liberado");
    } finally {
      recordingRef.current = null;
    }
  }

  async function iniciarMicrofono() {
    try {
      const permiso = await Audio.requestPermissionsAsync();
      if (permiso.status !== "granted") return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      await detenerMicrofono();

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;

      recording.setOnRecordingStatusUpdate((status) => {
        if (status.metering !== undefined && status.metering > -35) {
          setIntensidad((prev) => {
            const nueva = Math.min(prev + 0.5, 80);
            if (Math.floor(nueva) > Math.floor(prev)) Haptics.selectionAsync();
            return nueva;
          });
        }
      });
    } catch (err) {
      console.log("Error al iniciar:", err);
    }
  }

  useEffect(() => {
    if (pantalla === "acumulacion") iniciarMicrofono();
    else detenerMicrofono();
    return () => {
      detenerMicrofono();
    };
  }, [pantalla]);

  const manejarToque = () => {
    setIntensidad((prev) => Math.min(prev + 2, 80));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <AnimatePresence>
          {pantalla === "inicio" && (
            <MotiView
              key="inicio"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.content}
            >
              <Text style={styles.titulo}>SINCRO [00]</Text>
              <Text style={styles.subtitulo}>El orden requiere energía.</Text>
              <Pressable onPress={() => setPantalla("acumulacion")}>
                <Text style={styles.boton}>INICIAR SECUENCIA</Text>
              </Pressable>
            </MotiView>
          )}

          {pantalla === "acumulacion" && (
            <MotiView key="acum" style={styles.content}>
              <View style={styles.canvas}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <MotiView
                    key={i}
                    animate={{
                      scale: 0.5 + intensidad / 40,
                      opacity: 0.15 + intensidad / 90,
                      borderWidth: 1,
                      borderColor: intensidad > 60 ? "#fff" : "#444",
                      borderRadius: intensidad > 70 ? 100 : 0,
                      rotate: `${(80 - intensidad) * i * 5}deg`,
                    }}
                    transition={{ type: "timing", duration: 100 }}
                    style={styles.rect}
                  />
                ))}
                <Pressable
                  style={StyleSheet.absoluteFill}
                  onPress={manejarToque}
                />
              </View>

              <MotiText
                from={{
                  opacity: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1 - intensidad / 200,
                  scale: 1,
                }}
                transition={{ type: "timing", duration: 400 }}
                style={[
                  styles.instruccion,
                  { color: "#ffffff", letterSpacing: 4 },
                ]}
              >
                INYECTA FRECUENCIA (VOZ/TACTO)
              </MotiText>

              {intensidad > 50 && (
                <MotiView
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Pressable onPress={() => setPantalla("grito")}>
                    <Text style={styles.botonAlerta}>
                      FORZAR ALINEACIÓN
                    </Text>
                  </Pressable>
                </MotiView>
              )}
            </MotiView>
          )}

          {pantalla === "grito" && (
            <MotiView
              key="grito"
              style={[styles.content, { backgroundColor: "#fff" }]}
            >
              <MotiText
                from={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={[styles.titulo, { color: "#000" }]}
              >
                SISTEMA EN ORDEN
              </MotiText>
              <Pressable
                onPress={() => {
                  setIntensidad(0);
                  setPantalla("inicio");
                }}
                style={{ marginTop: 50 }}
              >
                <Text
                  style={[
                    styles.boton,
                    { color: "#000", borderColor: "#000" },
                  ]}
                >
                  REINICIAR CICLO
                </Text>
              </Pressable>
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  titulo: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "100",
    letterSpacing: 10,
  },
  subtitulo: {
    color: "#444",
    fontSize: 12,
    marginTop: 10,
    marginBottom: 50,
  },
  canvas: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  rect: { position: "absolute", width: 200, height: 200 },
  instruccion: { color: "#555", fontSize: 10, letterSpacing: 2 },
  boton: {
    color: "#fff",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#fff",
    padding: 15,
    borderRadius: 5,
  },
  botonAlerta: {
    color: "#ff0000",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 30,
  },
});
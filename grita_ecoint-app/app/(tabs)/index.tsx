import "react-native-reanimated";
import React, { useState, useEffect, useRef } from "react";
import { Text, View, Pressable, StyleSheet, Dimensions } from "react-native";
import { MotiView, MotiText, AnimatePresence } from "moti";
import * as Haptics from "expo-haptics";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Audio } from "expo-av";

const { width } = Dimensions.get("window");

export default function App() {
  const [pantalla, setPantalla] = useState("inicio");
  const [intensidad, setIntensidad] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);

  async function iniciarMicrofono() {
    try {
      const permiso = await Audio.requestPermissionsAsync();
      if (permiso.status !== "granted") return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      if (recordingRef.current) {
        await detenerMicrofono();
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recordingRef.current = recording;

      recording.setOnRecordingStatusUpdate((status) => {
        if (status.metering !== undefined && status.metering > -20) {
          setIntensidad((prev) => {
            const nuevaIntensidad = prev + 0.6;
            if (Math.floor(nuevaIntensidad) > Math.floor(prev)) {
              Haptics.selectionAsync();
            }
            return nuevaIntensidad;
          });
        }
      });
    } catch (err) {
      console.log("Error al iniciar micro:", err);
    }
  }

  async function detenerMicrofono() {
    try {
      if (recordingRef.current) {
        const status = await recordingRef.current.getStatusAsync();
        if (status.canRecord) {
          await recordingRef.current.stopAndUnloadAsync();
        }
        recordingRef.current = null;
      }
    } catch (e) {
      console.log("Error al detener/descargar micro:", e);
      recordingRef.current = null;
    }
  }

  useEffect(() => {
    if (pantalla === "acumulacion") {
      iniciarMicrofono();
    } else {
      detenerMicrofono();
    }

    return () => {
      detenerMicrofono();
    };
  }, [pantalla]);

  const manejarToque = () => {
    setIntensidad((prev) => prev + 0.5);
    Haptics.selectionAsync();
  };

  const reset = () => {
    setIntensidad(0);
    setPantalla("inicio");
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <AnimatePresence exitBeforeEnter>
          {pantalla === "inicio" && (
            <MotiView
              key="inicio"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.content}
            >
              <Text style={styles.textoPrincipal}>¿Cuánta es tu emoción?</Text>
              <Pressable onPress={() => setPantalla("acumulacion")}>
                <Text style={styles.boton}>Comienza a contar</Text>
              </Pressable>
            </MotiView>
          )}

          {pantalla === "acumulacion" && (
            <MotiView
              key="acum"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.content}
            >
              <MotiView
                from={{
                  backgroundColor: `hsl(180, 85%, 50%)`,
                  scale: 1,
                }}
                animate={{
                  scale: 1 + intensidad * 0.015,

                  backgroundColor: `hsl(${Math.max(
                    180 - intensidad * 2.25,
                    0,
                  )}, 85%, 55%)`,

                  rotate:
                    intensidad > 30
                      ? ["0deg", "-1deg", "1deg", "0deg"]
                      : "0deg",
                }}
                transition={{ type: "timing", duration: 150 }}
                style={styles.circulo}
              >
                <Pressable style={styles.fullPress} onPress={manejarToque}>
                  <Text style={styles.textoInterno}>
                    {Math.floor(intensidad)}
                  </Text>
                </Pressable>
              </MotiView>

              {/* ESTE ES EL CAMBIO: El texto ahora se mueve hacia abajo según crece el botón */}
    <MotiView
      animate={{
        translateY: intensidad * 1.8, // Se desplaza hacia abajo a medida que sube la intensidad
      }}
      transition={{ type: 'timing', duration: 150 }}
    >
      <Text style={styles.instruccion}>
        Presiona o haz un sonido
      </Text>
    </MotiView>

              {}
              {intensidad > 40 && (
                <MotiView
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                >
                  <Pressable onPress={() => setPantalla("decision")}>
                    <Text style={styles.botonSiguiente}>YA NO PUEDO MÁS</Text>
                  </Pressable>
                </MotiView>
              )}
            </MotiView>
          )}

          {pantalla === "decision" && (
            <MotiView
              key="decision"
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={styles.content}
            >
              <Text style={styles.textoPrincipal}>Alcanzé mi límite</Text>
              <View style={styles.row}>
                <Pressable onPress={reset} style={styles.opcionBoton}>
                  <Text style={styles.textoOpcion}>Parar</Text>
                </Pressable>

                <Pressable
                  onPress={() => setPantalla("grito")}
                  style={[styles.opcionBoton, { borderColor: "#ff0000" }]}
                >
                  <Text
                    style={[
                      styles.textoOpcion,
                      { color: "#ff0000", fontWeight: "bold" },
                    ]}
                  >
                    GRITAR
                  </Text>
                </Pressable>
              </View>
            </MotiView>
          )}

          {pantalla === "grito" && (
            <MotiView
              key="grito"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.content}
            >
              <MotiText
                animate={{
                  scale: [5, 1.9, 1.5],
                  opacity: [0.7, 1, 0.8],
                }}
                transition={{
                  loop: true,
                  duration: 600,
                  type: "timing",
                }}
                style={styles.gritoTexto}
              >
                ¡Inhalar!
              </MotiText>

              <Pressable
                onPress={() => setPantalla("fin")}
                style={{ marginTop: 80, padding: 20 }}
              >
                <Text style={styles.boton}>Soltar el aire...</Text>
              </Pressable>
            </MotiView>
          )}

          {pantalla === "fin" && (
            <MotiView
              key="fin"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.content}
            >
              <Text style={styles.textoFinal}>
                El silencio ahora es distinto.
              </Text>
              <Pressable onPress={reset} style={styles.botonReiniciar}>
                <Text style={styles.textoBotonReiniciar}>
                  Comenzar de nuevo
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
    width: "100%",
  },
  circulo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "white",
    marginBottom: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  fullPress: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  textoInterno: {
    color: "white",
    fontWeight: "bold",
    fontSize: 22,
  },
  instruccion: {
    color: "#666",
    fontSize: 14,
    marginBottom: 20,
  },
  textoPrincipal: {
    color: "white",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 40,
  },
  textoFinal: {
    color: "#ffffff",
    fontSize: 22,
    fontStyle: "italic",
    textAlign: "center",
    fontWeight: "300",
    marginBottom: 50,
  },
  gritoTexto: {
    color: "#ff0000",
    fontWeight: "900",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 20,
  },
  opcionBoton: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 10,
    minWidth: 110,
    alignItems: "center",
  },
  textoOpcion: {
    color: "#fff",
    fontSize: 16,
  },
  boton: {
    color: "white",
    fontSize: 18,
    textDecorationLine: "underline",
    textAlign: "center",
  },
  botonSiguiente: {
    color: "#ff4444",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  botonReiniciar: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 30,
  },
  textoBotonReiniciar: {
    color: "#aaa",
    fontSize: 16,
    letterSpacing: 1.2,
  },
});

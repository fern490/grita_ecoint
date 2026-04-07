import { Text, View, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [pantalla, setPantalla] = useState('inicio');
  const [intensidad, setIntensidad] = useState(0);

  // Función para cambiar color según intensidad
  const getBackgroundColor = () => {
    if (intensidad < 5) return '#111';       // oscuro
    if (intensidad < 10) return '#3b0000';   // rojo suave
    if (intensidad < 20) return '#7a0000';   // rojo medio
    return '#ff0000';                        // rojo fuerte
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      
      {pantalla === 'inicio' && (
        <>
          <Text style={styles.texto}>¿Qué estás guardando?</Text>
          <Pressable onPress={() => setPantalla('acumulacion')}>
            <Text style={styles.boton}>Entrar</Text>
          </Pressable>
        </>
      )}

      {pantalla === 'acumulacion' && (
        <>
          <Text style={styles.texto}>Tocá la pantalla...</Text>

          {/* Contador de intensidad */}
          <Pressable onPress={() => setIntensidad(intensidad + 1)}>
            <Text style={styles.texto}>Intensidad: {intensidad}</Text>
          </Pressable>

          <Pressable onPress={() => setPantalla('decision')}>
            <Text style={styles.boton}>Seguir</Text>
          </Pressable>
        </>
      )}

      {pantalla === 'decision' && (
        <>
          <Text style={styles.texto}>¿Callar o gritar?</Text>
          <Pressable onPress={() => {
            setIntensidad(0); // reset
            setPantalla('inicio');
          }}>
            <Text style={styles.boton}>Callar</Text>
          </Pressable>
          <Pressable onPress={() => setPantalla('grito')}>
            <Text style={styles.boton}>Gritar</Text>
          </Pressable>
        </>
      )}

      {pantalla === 'grito' && (
        <>
          <Text style={styles.texto}>AAAAAAAAA</Text>
          <Pressable onPress={() => setPantalla('fin')}>
            <Text style={styles.boton}>Soltar</Text>
          </Pressable>
        </>
      )}

      {pantalla === 'fin' && (
        <>
          <Text style={styles.texto}>¿Te sentís mejor?</Text>
          <Pressable onPress={() => {
            setIntensidad(0); // reset
            setPantalla('inicio');
          }}>
            <Text style={styles.boton}>Reiniciar</Text>
          </Pressable>
        </>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    color: 'white',
    fontSize: 20,
    marginBottom: 20,
  },
  boton: {
    color: '#ff4444',
    fontSize: 18,
    marginTop: 10,
  },
});
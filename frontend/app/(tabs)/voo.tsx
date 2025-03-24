import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import axios from 'axios';

const SERPAPI_KEY = "ad5fc2187f55ec89675e6630529688fc5de9de87bae04f185a8a42c7d6994956";
const SERPAPI_URL = "https://serpapi.com/search.json";

interface Voo {
  tipo: 'Ida' | 'Volta';
  origin: string;
  destination: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  price: string;
}

export default function FlightScreen() {
  const [iataOrigem, setIataOrigem] = useState('');
  const [iataDestino, setIataDestino] = useState('');
  const [dataPartida, setDataPartida] = useState('');
  const [dataVolta, setDataVolta] = useState('');
  const [idaEVolta, setIdaEVolta] = useState(true);
  const [voos, setVoos] = useState<Voo[]>([]);
  const [loading, setLoading] = useState(false);

  function validarParametros() {
    if (!iataOrigem || iataOrigem.length !== 3) {
      throw new Error("O código IATA de origem deve ter 3 letras.");
    }
    if (!iataDestino || iataDestino.length !== 3) {
      throw new Error("O código IATA de destino deve ter 3 letras.");
    }
    if (!/\d{4}-\d{2}-\d{2}/.test(dataPartida)) {
      throw new Error("A data de ida deve estar no formato YYYY-MM-DD.");
    }
    if (idaEVolta && !/\d{4}-\d{2}-\d{2}/.test(dataVolta)) {
      throw new Error("A data de volta deve estar no formato YYYY-MM-DD.");
    }
  }

  function calcularChegada(partidaStr: string, duracao: number) {
    if (!partidaStr || !duracao) return 'Não disponível';
    const partida = new Date(partidaStr);
    partida.setMinutes(partida.getMinutes() + duracao);
    return partida.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function formatarDataCompleta(dataISO: string) {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  async function buscarVoos() {
    setLoading(true);
    try {
      validarParametros();

      const url = `${SERPAPI_URL}?engine=google_flights&departure_id=${iataOrigem.toUpperCase()}&arrival_id=${iataDestino.toUpperCase()}&outbound_date=${dataPartida}${idaEVolta ? `&return_date=${dataVolta}&type=1` : '&type=2'}&currency=USD&hl=en&api_key=${SERPAPI_KEY}`;

      const response = await axios.get(url);
      const resultados = response.data.best_flights;

      if (!resultados || resultados.length === 0) {
        Alert.alert("Nenhum voo encontrado.");
        setVoos([]);
        return;
      }

      const voosFormatados: Voo[] = [];

      resultados.forEach((voo: any) => {
        const conexoes = voo.flights;
        const metade = idaEVolta ? Math.floor(conexoes.length / 2) : conexoes.length;

        const vooIda = conexoes.slice(0, metade);
        const primeiraIda = vooIda[0];
        const ultimaIda = vooIda[vooIda.length - 1];

        const duracaoIda = voo.total_duration / (idaEVolta ? 2 : 1);

        if (primeiraIda?.airline) {
          voosFormatados.push({
            tipo: 'Ida',
            origin: primeiraIda?.departure_airport?.id ?? 'Origem não informada',
            destination: ultimaIda?.arrival_airport?.id ?? 'Destino não informado',
            airline: primeiraIda.airline,
            departureTime: formatarDataCompleta(primeiraIda?.departure_airport?.time),
            arrivalTime: calcularChegada(primeiraIda?.departure_airport?.time, duracaoIda),
            price: voo?.price ? `$${voo.price}` : 'Preço não disponível',
          });

          if (idaEVolta) {
            const vooVolta = conexoes.slice(metade);
            const primeiraVolta = vooVolta[0];
            const ultimaVolta = vooVolta[vooVolta.length - 1];

            if (primeiraVolta?.airline) {
              const horaVolta = primeiraVolta?.departure_airport?.time?.split('T')[1]?.substring(0, 5) || '12:00';
              const dataHoraPartidaVolta = new Date(`${dataVolta}T${horaVolta}:00`);

              voosFormatados.push({
                tipo: 'Volta',
                origin: ultimaIda?.arrival_airport?.id ?? 'Origem não informada',
                destination: primeiraIda?.departure_airport?.id ?? 'Destino não informado',
                airline: primeiraVolta.airline,
                departureTime: dataHoraPartidaVolta.toLocaleString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }),
                arrivalTime: calcularChegada(dataHoraPartidaVolta.toISOString(), duracaoIda),
                price: voo?.price ? `$${voo.price}` : 'Preço não disponível',
              });
            }
          }
        }
      });

      setVoos(voosFormatados);
    } catch (error: any) {
      console.error("Erro ao buscar voos:", error.response?.data || error.message);
      Alert.alert("Erro", error.message || "Erro ao buscar voos.");
    } finally {
      setLoading(false);
    }
  }

  function obterComparativoPrecos(voos: Voo[]) {
    const mapaCompanhias: { [companhia: string]: number } = {};
    voos.forEach((voo) => {
      const precoNumerico = parseFloat(voo.price.replace('$', ''));
      if (!mapaCompanhias[voo.airline] || precoNumerico < mapaCompanhias[voo.airline]) {
        mapaCompanhias[voo.airline] = precoNumerico;
      }
    });
    return mapaCompanhias;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar Voos</Text>

      <TextInput
        style={styles.input}
        placeholder="Código IATA Origem (Ex: GRU)"
        value={iataOrigem}
        onChangeText={setIataOrigem}
        autoCapitalize="characters"
      />

      <TextInput
        style={styles.input}
        placeholder="Código IATA Destino (Ex: AUA)"
        value={iataDestino}
        onChangeText={setIataDestino}
        autoCapitalize="characters"
      />

      <TextInput
        style={styles.input}
        placeholder="Data de Ida (YYYY-MM-DD)"
        value={dataPartida}
        onChangeText={setDataPartida}
        keyboardType="default"
      />

      <View style={styles.switchContainer}>
        <Text>Ida e Volta?</Text>
        <Switch value={idaEVolta} onValueChange={setIdaEVolta} />
      </View>

      {idaEVolta && (
        <TextInput
          style={styles.input}
          placeholder="Data de Volta (YYYY-MM-DD)"
          value={dataVolta}
          onChangeText={setDataVolta}
          keyboardType="default"
        />
      )}

      <TouchableOpacity style={styles.searchButton} onPress={buscarVoos}>
        <Text style={styles.searchButtonText}>Buscar</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#5B2FD4" />
      ) : (
        <>
          <FlatList
            data={voos}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.vooItem}>
                <Text style={styles.vooDestino}>{item.tipo} - {item.origin} → {item.destination}</Text>
                <Text>Companhia: {item.airline}</Text>
                <Text>Preço: {item.price}</Text>
                <Text>Partida: {item.departureTime}</Text>
                <Text>Chegada: {item.arrivalTime}</Text>
              </View>
            )}
          />

          {voos.length > 0 && (
            <View style={styles.comparadorContainer}>
              <Text style={styles.comparadorTitulo}>Comparativo de Preços</Text>
              {Object.entries(obterComparativoPrecos(voos)).map(([companhia, preco]) => (
                <Text key={companhia} style={styles.comparadorItem}>
                  {companhia}: ${preco}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    color: '#000',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  searchButton: {
    backgroundColor: '#5B2FD4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  vooItem: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  vooDestino: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  comparadorContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
  },
  comparadorTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  comparadorItem: {
    fontSize: 14,
    marginBottom: 4,
  },
});

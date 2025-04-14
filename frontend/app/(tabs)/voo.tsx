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
import { useRouter } from 'expo-router';
import { TextInputMask } from 'react-native-masked-text';
import { parseISO, isBefore } from 'date-fns';
import { api } from '../../src/services/api';

const EXCHANGE_RATE_URL = "https://api.exchangerate.host/latest?base=USD&symbols=BRL";

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
  const router = useRouter();

  function formatarParaISO(data: string) {
    const partes = data.split('/');
    if (partes.length === 3) {
      const [dia, mes, ano] = partes;
      return `${ano}-${mes}-${dia}`;
    }
    return data;
  }

  function validarParametros() {
    const isoPartida = formatarParaISO(dataPartida);
    const isoVolta = formatarParaISO(dataVolta);

    if (!iataOrigem || iataOrigem.length !== 3) {
      throw new Error("O código IATA de origem deve ter 3 letras.");
    }
    if (!iataDestino || iataDestino.length !== 3) {
      throw new Error("O código IATA de destino deve ter 3 letras.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoPartida)) {
      throw new Error("A data de ida deve estar no formato correto.");
    }
    if (idaEVolta && !/^\d{4}-\d{2}-\d{2}$/.test(isoVolta)) {
      throw new Error("A data de volta deve estar no formatocorreto.");
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

  async function buscarCotacaoUSD() {
    try {
      const res = await axios.get(EXCHANGE_RATE_URL);
      return res.data?.rates?.BRL ?? 5.71;
    } catch {
      Alert.alert("Aviso", "Erro ao obter taxa de câmbio. Usando valor padrão de R$5,71.");
      return 5.71;
    }
  }

  async function buscarVoos() {
    setLoading(true);
    try {
      validarParametros();
      const hoje = new Date();
      const isoPartida = formatarParaISO(dataPartida);
      const isoVolta = formatarParaISO(dataVolta);

      const dataPartidaISO = parseISO(isoPartida);
      const dataVoltaISO = parseISO(isoVolta);

      if (isBefore(dataPartidaISO, hoje)) {
        throw new Error("A data de ida não pode ser anterior à data de hoje.");
      }

      if (idaEVolta) {
        if (isBefore(dataVoltaISO, hoje)) {
          throw new Error("A data de volta não pode ser anterior à data de hoje.");
        }
        if (isBefore(dataVoltaISO, dataPartidaISO)) {
          throw new Error("A data de volta não pode ser anterior à data de ida.");
        }
      }

      const cotacaoBRL = await buscarCotacaoUSD();
      const formatarReal = (valor: number) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(valor);

      const response = await api.get('/api/flights', {
        params: {
          iataOrigem: iataOrigem.toUpperCase(),
          iataDestino: iataDestino.toUpperCase(),
          dataPartida: isoPartida,
          dataVolta: isoVolta,
          idaEVolta: idaEVolta,
        },
      });

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

        const duracaoIda = voo.total_duration / (idaEVolta ? 2 : 1);

        const precoUSD = parseFloat(voo?.price);
        const precoBRL = isNaN(precoUSD) ? null : precoUSD * cotacaoBRL;

        if (primeiraIda?.airline) {
          voosFormatados.push({
            tipo: 'Ida',
            origin: iataOrigem.toUpperCase(),
            destination: iataDestino.toUpperCase(),
            airline: primeiraIda.airline,
            departureTime: formatarDataCompleta(primeiraIda?.departure_airport?.time),
            arrivalTime: calcularChegada(primeiraIda?.departure_airport?.time, duracaoIda),
            price: precoBRL ? formatarReal(precoBRL) : 'Preço não disponível',
          });

          if (idaEVolta) {
            const vooVolta = conexoes.slice(metade);
            const primeiraVolta = vooVolta[0];

            if (primeiraVolta?.airline) {
              const horaVolta = primeiraVolta?.departure_airport?.time?.split('T')[1]?.substring(0, 5) || '12:00';
              const dataHoraPartidaVolta = new Date(`${isoVolta}T${horaVolta}:00`);

              voosFormatados.push({
                tipo: 'Volta',
                origin: iataDestino.toUpperCase(),
                destination: iataOrigem.toUpperCase(),
                airline: primeiraVolta.airline,
                departureTime: dataHoraPartidaVolta.toLocaleString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }),
                arrivalTime: calcularChegada(dataHoraPartidaVolta.toISOString(), duracaoIda),
                price: precoBRL ? formatarReal(precoBRL) : 'Preço não disponível',
              });
            }
          }
        }
      });

      setVoos(voosFormatados);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao buscar voos.");
    } finally {
      setLoading(false);
    }
  }

  function obterComparativoPrecos(voos: Voo[]): { [companhia: string]: string } {
    const mapaCompanhias: { [companhia: string]: number } = {};
    voos.forEach((voo) => {
      const precoNumerico = parseFloat(
        voo.price.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()
      );
      if (!mapaCompanhias[voo.airline] || precoNumerico < mapaCompanhias[voo.airline]) {
        mapaCompanhias[voo.airline] = precoNumerico;
      }
    });

    const mapaFormatado: { [companhia: string]: string } = {};
    Object.entries(mapaCompanhias).forEach(([companhia, valor]) => {
      mapaFormatado[companhia] = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor);
    });

    return mapaFormatado;
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Código IATA Origem (Ex: GRU)"
          value={iataOrigem}
          onChangeText={setIataOrigem}
          autoCapitalize="characters"
          placeholderTextColor="#888"

        />

        <TextInput
          style={styles.input}
          placeholder="Código IATA Destino (Ex: AUA)"
          value={iataDestino}
          onChangeText={setIataDestino}
          autoCapitalize="characters"
          placeholderTextColor="#888"

        />

        <TextInputMask
          type={'datetime'}
          options={{ format: 'DD/MM/YYYY' }}
          style={styles.input}
          placeholder="Data de Ida"
          value={dataPartida}
          onChangeText={setDataPartida}
          placeholderTextColor="#888"

        />

        <View style={styles.switchContainer}>
          <Text>Ida e Volta?</Text>
          <Switch value={idaEVolta} onValueChange={setIdaEVolta} />
        </View>
      </View>

      {idaEVolta && (
        <TextInputMask
          type={'datetime'}
          options={{ format: 'DD/MM/YYYY' }}
          style={styles.input}
          placeholder="Data de Volta"
          value={dataVolta}
          onChangeText={setDataVolta}
          placeholderTextColor="#888"

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
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/modal/infoVooModal",
                    params: {
                      tipo: item.tipo,
                      origin: item.origin,
                      destination: item.destination,
                      airline: item.airline,
                      departureTime: item.departureTime,
                      arrivalTime: item.arrivalTime,
                      price: item.price,
                    },
                  })
                }
              >
                <View style={styles.vooItem}>
                  <Text style={styles.vooDestino}>{item.tipo} - {item.origin} → {item.destination}</Text>
                  <Text>Companhia: {item.airline}</Text>
                  <Text>Partida: {item.departureTime}</Text>
                  <Text>Chegada: {item.arrivalTime}</Text>
                  <Text style={styles.vooPrice}>Preço: {item.price}</Text>
                </View>
              </TouchableOpacity>
            )}
          />

          {voos.length > 0 && (
            <View style={styles.comparadorContainer}>
              <Text style={styles.comparadorTitulo}>Comparativo de Preços</Text>
              {Object.entries(obterComparativoPrecos(voos)).map(([companhia, preco]) => (
                <Text key={companhia} style={styles.comparadorItem}>
                  {companhia}: {preco}
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
  inputContainer: {
    width: '100%',
  },
  input: {
    padding: 16,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    color: 'black',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: '#5B2FD4',
    padding: 15,
    borderRadius: 40,
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
    borderRadius: 20,
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
    borderRadius: 20,
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
  vooPrice: {
    marginTop: 6,
    color: '#5B2FD4',
    fontWeight: 'bold',
  },
});